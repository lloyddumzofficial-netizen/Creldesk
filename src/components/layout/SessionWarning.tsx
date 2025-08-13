import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const SessionWarning: React.FC = () => {
  const { 
    isSessionExpiring, 
    sessionExpiry, 
    extendSession, 
    logout, 
    dismissSessionWarning,
    isLoading,
    getSessionDuration
  } = useAuthStore();

  const [timeRemaining, setTimeRemaining] = React.useState('');

  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return '0:00';
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if (!isSessionExpiring) return;

    const updateTimer = () => {
      const duration = getSessionDuration();
      setTimeRemaining(formatTime(duration));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isSessionExpiring, getSessionDuration]);

  const handleExtendSession = async () => {
    await extendSession();
    dismissSessionWarning();
  };

  return (
    <AnimatePresence>
      {isSessionExpiring && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 shadow-xl backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      "0 10px 15px -3px rgba(245, 158, 11, 0.4)",
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle size={20} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-800 dark:text-amber-200 text-lg">
                    Session Expiring Soon
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-mono font-medium">
                      {timeRemaining} remaining
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismissSessionWarning}
                  className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200 transition-colors p-1"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    Your session will expire soon. Extend it to continue working or sign out to save your progress.
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleExtendSession}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Extend Session
                  </Button>
                  
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-all duration-200"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};