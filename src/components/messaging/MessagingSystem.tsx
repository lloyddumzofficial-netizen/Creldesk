import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Send, 
  X, 
  Users, 
  Circle,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { useMessagingStore, User, Conversation, Message } from '../../stores/useMessagingStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';

interface MessagingSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessagingSystem: React.FC<MessagingSystemProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    searchResults,
    onlineUsers,
    isLoading,
    error,
    searchUsers,
    createOrGetConversation,
    loadConversations,
    sendMessage,
    setCurrentConversation,
    updatePresence,
    loadOnlineUsers,
    subscribeToMessages,
    subscribeToPresence,
    clearError,
  } = useMessagingStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize messaging system
  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
      loadOnlineUsers();
      updatePresence('online');

      // Subscribe to presence updates
      const unsubscribePresence = subscribeToPresence();

      return () => {
        unsubscribePresence();
        updatePresence('offline');
      };
    }
  }, [isOpen, user]);

  // Subscribe to messages for current conversation
  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = subscribeToMessages(currentConversation.id);
      return unsubscribe;
    }
  }, [currentConversation]);

  // Search users when query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSendMessage = async () => {
    if (!currentConversation || !newMessage.trim()) return;

    await sendMessage(currentConversation.id, newMessage);
    setNewMessage('');
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartConversation = async (userId: string) => {
    const conversationId = await createOrGetConversation(userId);
    if (conversationId) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setShowUserSearch(false);
        setSearchQuery('');
      }
    }
  };

  const getOtherParticipant = (conversation: Conversation): User | undefined => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[80vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex"
      >
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <MessageCircle size={24} className="text-primary-500" />
                <span>Messages</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowUserSearch(true)}
                placeholder="Search by name, email, or user ID..."
                className="pl-10"
              />
            </div>
          </div>

          {/* User Search Results */}
          {showUserSearch && searchQuery && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Search Results ({searchResults.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUserSearch(false)}>
                  <X size={16} />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Searching users...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                          {searchUser.avatar_url ? (
                            <img src={searchUser.avatar_url} alt={searchUser.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            searchUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(searchUser.status)} rounded-full border-2 border-white dark:border-slate-800`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {searchUser.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {searchUser.email}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          ID: {searchUser.id.slice(0, 8)}...
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleStartConversation(searchUser.id)}
                      >
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  <User size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                  <p className="text-xs mt-1">Try searching by name, email, or user ID</p>
                </div>
              )}
            </div>
          )}

          {/* Online Users */}
          {!showUserSearch && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                <Users size={16} />
                <span>Online ({onlineUsers.length})</span>
              </h3>
              {onlineUsers.length > 0 ? (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {onlineUsers.slice(0, 8).map((onlineUser) => (
                    <div
                      key={onlineUser.id}
                      className="flex-shrink-0 cursor-pointer group"
                      onClick={() => handleStartConversation(onlineUser.id)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium group-hover:scale-110 transition-transform">
                          {onlineUser.avatar_url ? (
                            <img src={onlineUser.avatar_url} alt={onlineUser.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            onlineUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(onlineUser.status)} rounded-full border-2 border-white dark:border-slate-800`} />
                      </div>
                      <div className="text-xs text-center mt-1 text-slate-600 dark:text-slate-400 truncate w-12">
                        {onlineUser.name.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  <div className="text-xs">No users online</div>
                </div>
              )}
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setCurrentConversation(conversation)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all duration-200",
                        currentConversation?.id === conversation.id
                          ? "bg-primary-100 dark:bg-primary-900/20 shadow-sm"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            {otherUser.avatar_url ? (
                              <img src={otherUser.avatar_url} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              otherUser.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(otherUser.status)} rounded-full border-2 border-white dark:border-slate-800`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {otherUser.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {conversation.last_message && formatTime(conversation.last_message.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {conversation.last_message?.content || 'No messages yet'}
                            </div>
                            {conversation.unread_count > 0 && (
                              <div className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No conversations yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Search for users above to start a conversation
                </p>
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setCurrentConversation(conversation)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors",
                        currentConversation?.id === conversation.id
                          ? "bg-primary-100 dark:bg-primary-900/20"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            {otherUser.avatar_url ? (
                              <img src={otherUser.avatar_url} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              otherUser.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(otherUser.status)} rounded-full border-2 border-white dark:border-slate-800`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {otherUser.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {conversation.last_message && formatTime(conversation.last_message.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {conversation.last_message?.content || 'No messages yet'}
                            </div>
                            {conversation.unread_count > 0 && (
                              <div className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No conversations yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Search for users above to start a conversation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentConversation(null)}
                      className="md:hidden"
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    
                    {(() => {
                      const otherUser = getOtherParticipant(currentConversation);
                      if (!otherUser) return null;

                      return (
                        <>
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                              {otherUser.avatar_url ? (
                                <img src={otherUser.avatar_url} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                otherUser.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(otherUser.status)} rounded-full border-2 border-white dark:border-slate-800`} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {otherUser.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {getStatusText(otherUser.status)}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone size={20} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video size={20} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={20} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        isOwn
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      )}>
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "text-xs mt-1",
                          isOwn ? "text-primary-100" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip size={20} />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <Button variant="ghost" size="sm">
                    <Smile size={20} />
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="rounded-full"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Select a conversation
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError} className="text-white hover:bg-red-600">
                <X size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};