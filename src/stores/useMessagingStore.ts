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

      // Check if a conversation already exists between these two users
      const { data: existingParticipants, error: searchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('user_id', [currentUser.id, userId]);

      if (!searchError && existingParticipants) {
        // Find conversations that have both users
        const conversationCounts = existingParticipants.reduce((acc, participant) => {
          acc[participant.conversation_id] = (acc[participant.conversation_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Find conversation with exactly 2 participants (both users)
        const existingConversationId = Object.keys(conversationCounts).find(convId => {
          return conversationCounts[convId] === 2;
        });
        
        if (existingConversationId) {
          // Verify this conversation has exactly these two users
          const { data: allParticipants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', existingConversationId);
            
          if (allParticipants && allParticipants.length === 2) {
            const participantIds = allParticipants.map(p => p.user_id).sort();
            const expectedIds = [currentUser.id, userId].sort();
            
            if (participantIds[0] === expectedIds[0] && participantIds[1] === expectedIds[1]) {
              console.log('Found existing conversation:', existingConversationId);
              set({ isLoading: false });
              return existingConversationId;
            }
          }
        }
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

      // Get conversations where user is a participant
      const { data: participantData, error } = await supabase
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

      if (error) {
        console.error('Error loading conversations:', error);
        set({ error: `Failed to load conversations: ${error.message}` });
        return;
      }

      if (!participantData || participantData.length === 0) {
        console.log('No conversations found');
        set({ conversations: [] });
        return;
      }

      console.log('Found conversations:', participantData.length);

      const conversations: Conversation[] = await Promise.all(
        participantData.map(async (participantRow) => {
          const conv = participantRow.conversations;
          const conversationId = conv.id;
          
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
            .eq('conversation_id', conversationId);

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

          // Get last message for this conversation
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const lastMessage = lastMessageData ? {
            id: lastMessageData.id,
            conversation_id: lastMessageData.conversation_id,
            sender_id: lastMessageData.sender_id,
            content: lastMessageData.content,
            message_type: lastMessageData.message_type,
            created_at: lastMessageData.created_at,
            updated_at: lastMessageData.updated_at,
            edited_at: lastMessageData.edited_at,
          } : undefined;

          // Get unread count
          const { data: unreadData } = await supabase
            .from('conversation_participants')
            .select('last_read_at')
            .eq('conversation_id', conversationId)
            .eq('user_id', currentUser.id)
            .single();

          let unreadCount = 0;
          if (unreadData?.last_read_at && lastMessage) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conversationId)
              .neq('sender_id', currentUser.id)
              .gt('created_at', unreadData.last_read_at);
            unreadCount = count || 0;
          }

          return {
            id: conversationId,
            created_by: conv.created_by,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants,
            last_message: lastMessage,
            unread_count: unreadCount,
          };
        })
      );

      // Filter out null conversations and sort by updated_at
      const validConversations = conversations.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

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

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
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
        sender: msg.profiles ? {
          id: msg.profiles.id,
          name: msg.profiles.name,
          email: msg.profiles.email,
          avatar_url: msg.profiles.avatar_url,
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
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
        });

      if (error) throw error;

      // Conversation timestamp is updated automatically by trigger

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