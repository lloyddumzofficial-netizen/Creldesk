/*
  # Complete Messaging System Schema

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
      - `edited_at` (timestamp, nullable)
    - `user_presence`
      - `user_id` (uuid, primary key, references profiles)
      - `status` (text, default 'offline')
      - `last_seen` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for conversation participants to access messages

  3. Indexes
    - Add indexes for performance on frequently queried columns
    - Add composite indexes for conversation queries

  4. Functions
    - Add trigger to update conversation updated_at when messages are sent
    - Add function to find direct conversations between users
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
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

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can read conversations they participate in"
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

CREATE POLICY "Conversation creators can update conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Users can read participants of their conversations"
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

CREATE POLICY "Users can join conversations they're invited to"
  ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT created_by 
      FROM conversations 
      WHERE id = conversation_id
    )
  );

CREATE POLICY "Users can update their own participation"
  ON conversation_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can read messages from their conversations"
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
  USING (auth.uid() = sender_id);

-- User presence policies
CREATE POLICY "Users can read all user presence"
  ON user_presence
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own presence"
  ON user_presence
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS conversations_created_by_idx ON conversations(created_by);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS conversation_participants_conversation_id_idx ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_participants_user_id_idx ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS conversation_participants_last_read_at_idx ON conversation_participants(last_read_at);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_created_at_idx ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_presence_status_idx ON user_presence(status);
CREATE INDEX IF NOT EXISTS user_presence_last_seen_idx ON user_presence(last_seen DESC);

-- Function to update conversation updated_at when messages are sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to find direct conversation between two users
CREATE OR REPLACE FUNCTION find_direct_conversation(user1_id uuid, user2_id uuid)
RETURNS TABLE(conversation_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT cp1.conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = user1_id 
    AND cp2.user_id = user2_id
    AND cp1.conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      GROUP BY conversation_id 
      HAVING COUNT(*) = 2
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation with participants and last message
CREATE OR REPLACE FUNCTION get_user_conversations(target_user_id uuid)
RETURNS TABLE(
  conversation_id uuid,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  participant_count bigint,
  last_message_content text,
  last_message_created_at timestamptz,
  unread_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.created_by,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) as participant_count,
    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
    (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_created_at,
    (
      SELECT COUNT(*) 
      FROM messages m 
      WHERE m.conversation_id = c.id 
        AND m.created_at > COALESCE(
          (SELECT last_read_at FROM conversation_participants WHERE conversation_id = c.id AND user_id = target_user_id),
          '1970-01-01'::timestamptz
        )
        AND m.sender_id != target_user_id
    ) as unread_count
  FROM conversations c
  WHERE c.id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = target_user_id
  )
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;