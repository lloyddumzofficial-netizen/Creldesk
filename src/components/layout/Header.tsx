import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sun, Moon, User, Menu, LogOut, Settings, Clock, Shield, Activity, MessageCircle } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/Button';
import { AuthModal } from '../auth/AuthModal';
import { MessagingSystem } from '../messaging/MessagingSystem';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    sidebarCollapsed, 
    toggleSidebar
  } = useAppStore();
  
  const { 
    user, 
    profile, 
    logout, 
    isAuthenticated, 
    sessionExpiry, 
    updateLastActivity,
    getSessionDuration,
    isSessionHealthy,
    sessionHistory
  } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showMessaging, setShowMessaging] = React.useState(false);

  // Get user name from Supabase user metadata or profile
  const getUserName = () => {
    if (profile?.name) return profile.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return '';
  };

  // Update activity on user interaction
  React.useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated) {
        updateLastActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, updateLastActivity]);

  // Format session expiry time
  const getSessionStatus = () => {
    const timeLeft = getSessionDuration();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m left`;
    return 'Expiring soon';
  };

  // Get session status color
  const getSessionStatusColor = () => {
    const timeLeft = getSessionDuration();
    
    if (timeLeft <= 0) return 'text-red-500';
    if (timeLeft <= 5 * 60 * 1000) return 'text-amber-500'; // 5 minutes
    if (timeLeft <= 15 * 60 * 1000) return 'text-yellow-500'; // 15 minutes
    return 'text-green-500';
  };

  // Get session health indicator
  const getSessionHealthIcon = () => {
    if (!isAuthenticated) return null;
    const healthy = isSessionHealthy();
    return healthy ? (
      <Shield size={10} className="text-green-500" />
    ) : (
      <Activity size={10} className="text-amber-500" />
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu size={20} />
          </Button>
          
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="public/Creldesk.png" 
              alt="Creldesk Logo" 
              className="h-10 w-auto max-w-[200px] object-contain"
              width="200"
              height="40"
              onLoad={() => console.log('Logo loaded successfully')}
              onError={(e) => {
                console.error('Logo failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>
        </div>

        <div className="flex-1 max-w-lg mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search tools, users... (⌘K)"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 focus:scale-[1.02] focus:bg-white dark:focus:bg-slate-700"
              onFocus={() => isAuthenticated && updateLastActivity()}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hidden md:flex"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </motion.div>
          </Button>
          
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMessaging(true)}
              className="relative"
            >
              <MessageCircle size={16} />
            </Button>
          )}
          
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {getUserName().charAt(0).toUpperCase()}
                  {/* Session health indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                    {getSessionHealthIcon()}
                  </div>
                </motion.div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {getUserName()}
                  </div>
                  <div className={`text-xs flex items-center space-x-1 ${getSessionStatusColor()}`}>
                    <Clock size={10} />
                    <span>{getSessionStatus()}</span>
                  </div>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {getUserName().charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {getUserName()}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Settings size={16} />
                      <span>Account Settings</span>
                    </button>
                    
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 mx-2 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Session:</span>
                          <div className="flex items-center space-x-1">
                            {getSessionHealthIcon()}
                            <span className={`text-xs font-mono ${getSessionStatusColor()}`}>{getSessionStatus()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Activity:</span>
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {sessionHistory.length} events
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 py-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => setShowAuthModal(true)}>
              <User size={16} className="mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
      </header>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <MessagingSystem
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
      />
    </>
  );
};