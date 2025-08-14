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

      const { user: currentUser } = useAuthStore.getState();
      if (!currentUser) {
        set({ isLoading: false, error: 'Not authenticated' });
        return;
      }

      console.log('Searching users with query:', query);

      // Check if query is a UUID (user ID search)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .neq('id', currentUser.id) // Exclude current user from search
        .or(
          isUUID 
            ? `id.eq.${query}`
            : `name.ilike.%${query}%,email.ilike.%${query}%`
        )
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        set({ error: `Search failed: ${error.message}`, searchResults: [] });
        return;
      }

      console.log('Search results:', data);

      if (!data || data.length === 0) {
        console.log('No users found for query:', query);
        set({ searchResults: [] });
        return;
      }

      // Get presence data for found users
      const userIds = data.map(profile => profile.id);
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, status, last_seen')
        .in('user_id', userIds);

      const users: User[] = data.map(profile => {
        const userPresence = (presenceData || []).find(p => p.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          status: userPresence?.status || 'offline',
          last_seen: userPresence?.last_seen || new Date().toISOString(),
        };
      });

      console.log('Formatted users:', users);
      set({ searchResults: users });
    } catch (error) {
      console.error('Error searching users:', error);
      set({ error: `Failed to search users: ${error.message || 'Unknown error'}`, searchResults: [] });
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
      console.log('Creating/getting conversation with user:', userId);

      // First, check if a direct conversation already exists between these two users
      const { data: existingConversations, error: searchError } = await supabase
        .rpc('find_direct_conversation', {
          user1_id: currentUser.id,
          user2_id: userId
        });

      if (searchError) {
        console.log('RPC function not available, using manual search');
        // Fallback to manual search if RPC function doesn't exist
        const { data: myParticipations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', currentUser.id);

        if (myParticipations && myParticipations.length > 0) {
          for (const participation of myParticipations) {
            const { data: allParticipants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', participation.conversation_id);

            const participantIds = (allParticipants || []).map(p => p.user_id);
            
            // Check if this is a direct conversation (exactly 2 participants)
            if (participantIds.length === 2 && 
                participantIds.includes(userId) && 
                participantIds.includes(currentUser.id)) {
              console.log('Found existing conversation:', participation.conversation_id);
              set({ isLoading: false });
              return participation.conversation_id;
            }
          }
        }
      } else if (existingConversations && existingConversations.length > 0) {
        console.log('Found existing conversation via RPC:', existingConversations[0]);
        set({ isLoading: false });
        return existingConversations[0];
      }

      // No existing conversation found, create a new one
      console.log('Creating new conversation');
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw createError;
      }

      const conversationId = newConversation.id;
      console.log('Created new conversation:', conversationId);

      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversationId,
            user_id: currentUser.id,
            joined_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
          },
          {
            conversation_id: conversationId,
            user_id: userId,
            joined_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
          }
        ]);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        throw participantsError;
      }

      console.log('Successfully created conversation with participants');

      // Reload conversations to get the updated list
      await get().loadConversations();

      return conversationId;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      set({ error: `Failed to create conversation: ${error.message || 'Unknown error'}` });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Load user's conversations
  loadConversations: async () => {
    const { user: currentUser } = useAuthStore.getState();
    if (!currentUser) {
      console.log('No current user, skipping conversation load');
      return;
    }

    try {
      set({ isLoading: true, error: null });
      console.log('Loading conversations for user:', currentUser.id);

      // Get conversations where current user is a participant
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id, 
          last_read_at,
          conversations!inner (
            id,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', currentUser.id)
        .order('last_read_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No conversations found');
        set({ conversations: [] });
        return;
      }

      console.log('Found conversations:', data.length);

      const conversations: Conversation[] = await Promise.all(
        data.map(async (item) => {
          const conv = item.conversations;
          if (!conv) return null;
          
          // Get all participants for this conversation
          const { data: allParticipants } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles!inner (
                id,
                name,
                email,
                avatar_url
              )
            `)
            .eq('conversation_id', conv.id);

          const participantIds = (allParticipants || []).map(p => p.user_id);

          // Get presence data
          const { data: presenceData } = await supabase
            .from('user_presence')
            .select('user_id, status, last_seen')
            .in('user_id', participantIds);

          const participants: User[] = (allParticipants || []).map(participant => {
            const profile = participant.profiles;
            const presence = (presenceData || []).find(p => p.user_id === profile.id);
            return {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar_url: profile.avatar_url,
              status: presence?.status || 'offline',
              last_seen: presence?.last_seen || new Date().toISOString(),
            };
          });

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Calculate unread count
          let unreadCount = 0;
          if (item.last_read_at) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .gt('created_at', item.last_read_at)
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

      // Filter out null conversations and sort by updated_at
      const validConversations = conversations
        .filter((conv): conv is Conversation => conv !== null)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      console.log('Loaded conversations:', validConversations.length);
      set({ conversations: validConversations });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ error: `Failed to load conversations: ${error.message || 'Unknown error'}` });
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
    if (!currentUser) {
      console.log('No current user, skipping online users load');
      return;
    }

    try {
      console.log('Loading online users...');
      // Get all users with their presence status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .neq('id', currentUser.id)
        .limit(50);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No other users found');
        set({ onlineUsers: [] });
        return;
      }

      console.log('Found profiles:', profiles.length);

      // Get presence data for these users
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, status, last_seen')
        .in('user_id', profiles.map(p => p.id));

      if (presenceError) {
        console.warn('Error loading presence data:', presenceError);
      }

      console.log('Presence data:', presenceData?.length || 0);

      // Combine profile and presence data
      const users: User[] = profiles.map(profile => {
        const presence = (presenceData || []).find(p => p.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          status: presence?.status || 'offline',
          last_seen: presence?.last_seen || new Date().toISOString(),
        };
      });

      // Filter to show only online users first, then others
      const onlineUsers = users.filter(u => ['online', 'away', 'busy'].includes(u.status));
      const offlineUsers = users.filter(u => u.status === 'offline').slice(0, 5); // Limit offline users

      console.log('Online users:', onlineUsers.length, 'Offline users:', offlineUsers.length);
      set({ onlineUsers: [...onlineUsers, ...offlineUsers] });
    } catch (error) {
      console.error('Error loading online users:', error);
      set({ error: `Failed to load users: ${error.message || 'Unknown error'}` });
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