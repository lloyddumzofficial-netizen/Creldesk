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

      // Check if query is a UUID (user ID search)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);
      
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
        .or(isUUID 
          ? `id.eq.${query}` 
          : `name.ilike.%${query}%,email.ilike.%${query}%,id.ilike.%${query}%`
        )
        .limit(10);

      if (error) throw error;

      const users: User[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        status: (profile.user_presence as any)?.[0]?.status || 'offline',
        last_seen: (profile.user_presence as any)?.[0]?.last_seen || new Date().toISOString(),
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
    const { user: currentUser } = useAuthStore.getState();
    if (!currentUser) return null;

    try {
      set({ isLoading: true, error: null });

      // First check if conversation already exists
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner (
            id,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', currentUser.id);

      if (searchError) throw searchError;

      // Check if any of these conversations include the target user
      let conversationId = null;
      if (existingConversation) {
        for (const conv of existingConversation) {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id);
          
          const participantIds = participants?.map(p => p.user_id) || [];
          if (participantIds.includes(userId) && participantIds.includes(currentUser.id)) {
            conversationId = conv.conversation_id;
            break;
          }
        }
      }

      // If no existing conversation, create a new one
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            created_by: currentUser.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        conversationId = newConversation.id;

        // Add both users as participants
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert([
            {
              conversation_id: conversationId,
              user_id: currentUser.id,
            },
            {
              conversation_id: conversationId,
              user_id: userId,
            }
          ]);

        if (participantsError) throw participantsError;
      }

      if (error) throw error;

      // Reload conversations to get the updated list
      await get().loadConversations();

      return conversationId;
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
    const { user: currentUser } = useAuthStore.getState();
    if (!currentUser) return;

    try {
      set({ isLoading: true, error: null });

      // Get conversations where user is a participant
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner (
            id,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', currentUser.id)
        .order('conversations(updated_at)', { ascending: false });

      if (error) throw error;

      const conversations: Conversation[] = await Promise.all(
        (data || []).map(async (item) => {
          const conv = item.conversations;
          
          // Get all participants for this conversation
          const { data: participantData } = await supabase
            .from('conversation_participants')
            .select(`
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
            `)
            .eq('conversation_id', conv.id);

          const participants: User[] = (participantData || [])
            .filter(cp => cp.profiles)
            .map(cp => ({
              id: cp.profiles.id,
              name: cp.profiles.name,
              email: cp.profiles.email,
              avatar_url: cp.profiles.avatar_url,
              status: (cp.profiles.user_presence as any)?.[0]?.status || 'offline',
              last_seen: (cp.profiles.user_presence as any)?.[0]?.last_seen || new Date().toISOString(),
            }));

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles (
                id,
                name,
                email,
                avatar_url
              )
            )
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count for current user
          const { data: participantInfo } = await supabase
            .from('conversation_participants')
            .select('last_read_at')
            .eq('conversation_id', conv.id)
            .eq('user_id', currentUser.id)
            .single();

          let unreadCount = 0;
          if (participantInfo?.last_read_at) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .gt('created_at', participantInfo.last_read_at)
              .neq('sender_id', currentUser.id);
            
            unreadCount = count || 0;
          }

          return {
            id: conv.id,
            created_by: conv.created_by,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants,
            last_message: lastMessage || undefined,
            unread_count: unreadCount,
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
    const { user: currentUser } = useAuthStore.getState();
    if (!currentUser) return;

    try {
      set({ isLoading: true, error: null });

      // Verify user is participant in this conversation
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUser.id)
        .single();

      if (!participant) {
        set({ error: 'Access denied to this conversation' });
        return;
      }

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
        sender: msg.sender ? {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          avatar_url: msg.sender.avatar_url,
          status: 'offline',
          last_seen: new Date().toISOString(),
        } : undefined,
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
      // Verify user is participant in this conversation
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (!participant) {
        set({ error: 'Cannot send message to this conversation' });
        return;
      }

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
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  },

  // Load online users
  loadOnlineUsers: async () => {
    const { user: currentUser } = useAuthStore.getState();
    if (!currentUser) return;

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
        .neq('user_id', currentUser.id)
        .order('last_seen', { ascending: false });

      if (error) throw error;

      const users: User[] = (data || []).map(presence => ({
        id: (presence.profiles as any).id,
        name: (presence.profiles as any).name,
        email: (presence.profiles as any).email,
        avatar_url: (presence.profiles as any).avatar_url,
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
          const { user: currentUser } = useAuthStore.getState();
          if (!currentUser) return;

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

          // Update conversation in the list
          set(state => ({
            conversations: state.conversations.map(conv =>
              conv.id === conversationId
                ? { 
                    ...conv, 
                    last_message: newMessage,
                    updated_at: payload.new.created_at,
                    unread_count: payload.new.sender_id !== currentUser.id ? conv.unread_count + 1 : conv.unread_count
                  }
                : conv
            )
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