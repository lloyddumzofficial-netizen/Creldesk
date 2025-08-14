/*
  # Advanced Messaging System

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `conversation_participants`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)
      - `last_read_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `message_type` (text, default 'text')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `edited_at` (timestamp)
    
    - `user_presence`
      - `user_id` (uuid, primary key, references profiles)
      - `status` (text, default 'offline')
      - `last_seen` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for conversation participants to access messages

  3. Functions
    - Function to get or create conversation between users
    - Function to update user presence
    - Function to get unread message counts
</*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  edited_at timestamptz
);

-- Create user presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    ) OR
    conversation_id IN (
      SELECT id 
      FROM conversations 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation"
  ON conversation_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- User presence policies
CREATE POLICY "Users can view all user presence"
  ON user_presence
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON user_presence
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own presence"
  ON user_presence
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS conversations_created_by_idx ON conversations(created_by);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS conversation_participants_conversation_id_idx ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_participants_user_id_idx ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS user_presence_status_idx ON user_presence(status);
CREATE INDEX IF NOT EXISTS user_presence_last_seen_idx ON user_presence(last_seen DESC);

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id uuid;
  current_user_id uuid := auth.uid();
BEGIN
  -- Check if conversation already exists between these two users
  SELECT c.id INTO conversation_id
  FROM conversations c
  WHERE c.id IN (
    SELECT cp1.conversation_id
    FROM conversation_participants cp1
    WHERE cp1.user_id = current_user_id
    INTERSECT
    SELECT cp2.conversation_id
    FROM conversation_participants cp2
    WHERE cp2.user_id = other_user_id
  )
  AND (
    SELECT COUNT(*)
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
  ) = 2
  LIMIT 1;

  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (created_by)
    VALUES (current_user_id)
    RETURNING id INTO conversation_id;

    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, current_user_id),
      (conversation_id, other_user_id);
  END IF;

  RETURN conversation_id;
END;
$$;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(new_status text DEFAULT 'online')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, last_seen, updated_at)
  VALUES (auth.uid(), new_status, now(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    last_seen = EXCLUDED.last_seen,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count integer;
  last_read timestamptz;
BEGIN
  -- Get user's last read timestamp for this conversation
  SELECT cp.last_read_at INTO last_read
  FROM conversation_participants cp
  WHERE cp.conversation_id = get_unread_message_count.conversation_id
    AND cp.user_id = auth.uid();

  -- Count messages after last read timestamp
  SELECT COUNT(*)::integer INTO unread_count
  FROM messages m
  WHERE m.conversation_id = get_unread_message_count.conversation_id
    AND m.created_at > COALESCE(last_read, '1970-01-01'::timestamptz)
    AND m.sender_id != auth.uid();

  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
    CREATE TRIGGER update_conversations_updated_at
      BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at') THEN
    CREATE TRIGGER update_messages_updated_at
      BEFORE UPDATE ON messages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_presence_updated_at') THEN
    CREATE TRIGGER update_user_presence_updated_at
      BEFORE UPDATE ON user_presence
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;