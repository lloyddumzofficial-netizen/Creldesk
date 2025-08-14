import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          tool: string;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          tool: string;
          data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          tool?: string;
          data?: any;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          task_column: 'todo' | 'inprogress' | 'done';
          priority: 'low' | 'medium' | 'high';
          position: number;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string;
          task_column?: 'todo' | 'inprogress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          position?: number;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          task_column?: 'todo' | 'inprogress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          position?: number;
          width?: number;
          height?: number;
          updated_at?: string;
        };
      };
    };
    conversations: {
      Row: {
        id: string;
        created_by: string;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        created_by: string;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        created_by?: string;
        updated_at?: string;
      };
    };
    conversation_participants: {
      Row: {
        id: string;
        conversation_id: string;
        user_id: string;
        joined_at: string;
        last_read_at: string;
      };
      Insert: {
        id?: string;
        conversation_id: string;
        user_id: string;
        joined_at?: string;
        last_read_at?: string;
      };
      Update: {
        id?: string;
        conversation_id?: string;
        user_id?: string;
        last_read_at?: string;
      };
    };
    messages: {
      Row: {
        id: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type: 'text' | 'image' | 'file';
        created_at: string;
        updated_at: string;
        edited_at?: string;
      };
      Insert: {
        id?: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type?: 'text' | 'image' | 'file';
        created_at?: string;
        updated_at?: string;
        edited_at?: string;
      };
      Update: {
        id?: string;
        conversation_id?: string;
        sender_id?: string;
        content?: string;
        message_type?: 'text' | 'image' | 'file';
        updated_at?: string;
        edited_at?: string;
      };
    };
    user_presence: {
      Row: {
        user_id: string;
        status: 'online' | 'away' | 'busy' | 'offline';
        last_seen: string;
        updated_at: string;
      };
      Insert: {
        user_id: string;
        status?: 'online' | 'away' | 'busy' | 'offline';
        last_seen?: string;
        updated_at?: string;
      };
      Update: {
        user_id?: string;
        status?: 'online' | 'away' | 'busy' | 'offline';
        last_seen?: string;
        updated_at?: string;
      };
    };
  };
}