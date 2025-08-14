import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  updated_at: string;
  edited_at?: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
}

interface MessagingStore {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  onlineUsers: User[];
  searchResults: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  searchUsers: (query: string) => Promise<void>;
  createOrGetConversation: (userId: string) => Promise<string | null>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<void>;
  loadOnlineUsers: () => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  subscribeToMessages: (conversationId: string) => () => void;
  subscribeToPresence: () => () => void;
  clearError: () => void;
}

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  messages: [],
  onlineUsers: [],
  searchResults: [],
  isLoading: false,
  error: null,

  // Search users by name or email
  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          user_presence (
            status,
            last_seen
          )
        `)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      const users: User[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        status: profile.user_presence?.[0]?.status || 'offline',
        last_seen: profile.user_presence?.[0]?.last_seen || new Date().toISOString(),
      }));

      set({ searchResults: users });
    } catch (error) {
      console.error('Error searching users:', error);
      set({ error: 'Failed to search users' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Create or get existing conversation with a user
  createOrGetConversation: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        other_user_id: userId
      });

      if (error) throw error;

      // Reload conversations to get the updated list
      await get().loadConversations();

      return data;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      set({ error: 'Failed to create conversation' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Load user's conversations
  loadConversations: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_by,
          created_at,
          updated_at,
          conversation_participants (
            user_id,
            profiles (
              id,
              name,
              email,
              avatar_url,
              user_presence (
                status,
                last_seen
              )
            )
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversations: Conversation[] = await Promise.all(
        (data || []).map(async (conv) => {
          const participants: User[] = conv.conversation_participants
            .map(cp => ({
              id: cp.profiles.id,
              name: cp.profiles.name,
              email: cp.profiles.email,
              avatar_url: cp.profiles.avatar_url,
              status: cp.profiles.user_presence?.[0]?.status || 'offline',
              last_seen: cp.profiles.user_presence?.[0]?.last_seen || new Date().toISOString(),
            }));

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { data: unreadCount } = await supabase.rpc('get_unread_message_count', {
            conversation_id: conv.id
          });

          return {
            id: conv.id,
            created_by: conv.created_by,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants,
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
          };
        })
      );

      set({ conversations });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ error: 'Failed to load conversations' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Load messages for a conversation
  loadMessages: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        edited_at: msg.edited_at,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          avatar_url: msg.sender.avatar_url,
          status: 'offline',
          last_seen: new Date().toISOString(),
        },
      }));

      set({ messages });

      // Mark as read
      await get().markAsRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ error: 'Failed to load messages' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Send a message
  sendMessage: async (conversationId: string, content: string) => {
    const { user } = useAuthStore.getState();
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: 'Failed to send message' });
    }
  },

  // Set current conversation
  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
    if (conversation) {
      get().loadMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  },

  // Update user presence
  updatePresence: async (status: 'online' | 'away' | 'busy' | 'offline') => {
    try {
      const { error } = await supabase.rpc('update_user_presence', {
        new_status: status
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  },

  // Load online users
  loadOnlineUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select(`
          user_id,
          status,
          last_seen,
          profiles (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .in('status', ['online', 'away', 'busy'])
        .order('last_seen', { ascending: false });

      if (error) throw error;

      const users: User[] = (data || []).map(presence => ({
        id: presence.profiles.id,
        name: presence.profiles.name,
        email: presence.profiles.email,
        avatar_url: presence.profiles.avatar_url,
        status: presence.status,
        last_seen: presence.last_seen,
      }));

      set({ onlineUsers: users });
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  },

  // Mark conversation as read
  markAsRead: async (conversationId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      // Update local state
      const conversations = get().conversations.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      );
      set({ conversations });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages: (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, name, email, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            message_type: payload.new.message_type,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            edited_at: payload.new.edited_at,
            sender: sender ? {
              id: sender.id,
              name: sender.name,
              email: sender.email,
              avatar_url: sender.avatar_url,
              status: 'offline',
              last_seen: new Date().toISOString(),
            } : undefined,
          };

          set(state => ({
            messages: [...state.messages, newMessage]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Subscribe to presence updates
  subscribeToPresence: () => {
    const channel = supabase
      .channel('user_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        () => {
          // Reload online users when presence changes
          get().loadOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Clear error
  clearError: () => set({ error: null }),
}));