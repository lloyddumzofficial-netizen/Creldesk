import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Chrome, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const { login, register, resetPassword, signInWithGoogle, isLoading, error, clearError, setRememberMe: setStoreRememberMe } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === 'login') {
      setStoreRememberMe(rememberMe);
      const success = await login(formData.email, formData.password);
      if (success) {
        onClose();
      }
    } else if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        // You could set a local error here for password mismatch
        return;
      }
      setStoreRememberMe(rememberMe);
      const success = await register(formData.email, formData.password, formData.name);
      if (success) {
        onClose();
      }
    } else if (mode === 'reset') {
      const success = await resetPassword(formData.email);
      if (success) {
        alert('Password reset email sent! Check your inbox.');
        setMode('login');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setStoreRememberMe(rememberMe);
    const success = await signInWithGoogle();
    if (success) {
      onClose();
    }
  };
  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
    setRememberMe(false);
    clearError();
  };

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="relative shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="p-6">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {mode === 'login' ? 'Sign in to your account' : mode === 'register' ? 'Join Creldesk today' : 'Enter your email to reset password'}
                  </p>
                  </motion.div>
                </div>

                {/* Google Sign In Button */}
                {mode !== 'reset' && (
                  <motion.div 
                    className="mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2 border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
                    >
                      <Chrome size={18} className="text-slate-600 dark:text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                      </span>
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Or continue with email
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {mode === 'register' && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                      required
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}

                  {mode === 'register' && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                        required
                      />
                    </div>
                  )}

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                    >
                      <div className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                        {error}
                      </div>
                    </motion.div>
                  )}

                  {/* Remember Me Checkbox */}
                  {mode !== 'reset' && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="sr-only"
                          />
                          <motion.div 
                            className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                            rememberMe 
                              ? 'bg-primary-500 border-primary-500' 
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {rememberMe && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <Check size={12} className="text-white absolute top-0.5 left-0.5" />
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                          Keep me signed in for 7 days
                        </span>
                      </label>
                      
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('reset')}
                          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors duration-200"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full transition-all duration-200 hover:shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : 
                     mode === 'login' ? 'Sign In' : 
                     mode === 'register' ? 'Create Account' : 
                     'Send Reset Email'}
                  </Button>
                </motion.form>

                <motion.div 
                  className="mt-6 text-center space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {mode === 'login' && (
                    <>
                      <div className="text-slate-600 dark:text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <button
                          onClick={() => switchMode('register')}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors duration-200"
                        >
                          Sign up
                        </button>
                      </div>
                    </>
                  )}

                  {mode === 'register' && (
                    <div className="text-slate-600 dark:text-slate-400 text-sm">
                      Already have an account?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors duration-200"
                      >
                        Sign in
                      </button>
                    </div>
                  )}

                  {mode === 'reset' && (
                    <button
                      onClick={() => switchMode('login')}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors duration-200"
                    >
                      Back to sign in
                    </button>
                  )}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};