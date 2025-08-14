import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { AuthState } from '../types';

interface AuthStore extends AuthState {
  session: Session | null;
  profile: any | null;
  sessionExpiry: number | null;
  lastActivity: number;
  rememberMe: boolean;
  sessionWarningShown: boolean;
  isSessionExpiring: boolean;
  autoSaveEnabled: boolean;
  sessionHistory: Array<{ timestamp: number; action: string; ip?: string }>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: any) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  checkSessionValidity: () => boolean;
  updateLastActivity: () => void;
  setRememberMe: (remember: boolean) => void;
  extendSession: () => Promise<void>;
  showSessionWarning: () => void;
  dismissSessionWarning: () => void;
  enableAutoSave: (enabled: boolean) => void;
  addSessionEvent: (action: string) => void;
  getSessionDuration: () => number;
  isSessionHealthy: () => boolean;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      sessionExpiry: null,
      lastActivity: Date.now(),
      rememberMe: false,
      sessionWarningShown: false,
      isSessionExpiring: false,
      autoSaveEnabled: true,
      sessionHistory: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initialize: async () => {
        set({ isLoading: true });
        
        try {
          console.log('Initializing auth store...');
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            // Handle refresh token not found error
            if (error.message?.includes('Refresh Token Not Found')) {
              console.log('Refresh token not found, signing out');
              await supabase.auth.signOut();
              set({ 
                session: null,
                user: null,
                profile: null,
                sessionExpiry: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
              });
              return;
            }
            set({ error: error.message, isLoading: false });
            return;
          }

          if (session) {
            console.log('Found existing session for user:', session.user.id);
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Error loading profile:', profileError);
              // Continue without profile if it doesn't exist yet
            }

            console.log('Setting authenticated state');
            set({
              session,
              user: session.user,
              profile,
              sessionExpiry: session.expires_at ? new Date(session.expires_at).getTime() : null,
              lastActivity: Date.now(),
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Add session start event
            get().addSessionEvent('session_restored');
          } else {
            console.log('No existing session found');
            set({
              session: null,
              user: null,
              profile: null,
              sessionExpiry: null,
              isAuthenticated: false,
              isLoading: false
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.id);
            
            if (event === 'SIGNED_IN' && session) {
              // Get user profile on sign in
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error('Error loading profile on sign in:', profileError);
                // Continue without profile if it doesn't exist yet
              }

              set({
                session,
                user: session.user,
                profile,
                sessionExpiry: session.expires_at ? new Date(session.expires_at).getTime() : null,
                lastActivity: Date.now(),
                isAuthenticated: true,
                isLoading: false,
                error: null
              });

              // Add session event
              get().addSessionEvent('signed_in');
            } else if (event === 'SIGNED_OUT') {
              get().addSessionEvent('signed_out');
              set({
                session: null,
                user: null,
                profile: null,
                sessionExpiry: null,
                sessionWarningShown: false,
                isSessionExpiring: false,
                isAuthenticated: false,
                isLoading: false,
                error: null
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              get().addSessionEvent('token_refreshed');
              set({
                session,
                sessionExpiry: session.expires_at ? new Date(session.expires_at).getTime() : null,
                lastActivity: Date.now(),
                sessionWarningShown: false,
                isSessionExpiring: false,
              });
            }
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ 
            error: 'Failed to initialize authentication', 
            isLoading: false 
          });
        }
      },

      startSessionMonitoring: () => {
        // Monitor session expiry and user activity
        const checkSession = () => {
          const state = get();
          if (!state.isAuthenticated || !state.sessionExpiry) return;

          const now = Date.now();
          const timeUntilExpiry = state.sessionExpiry - now;
          const timeSinceActivity = now - state.lastActivity;

          // Show warning 5 minutes before expiry
          if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0 && !state.sessionWarningShown) {
            set({ isSessionExpiring: true });
            state.showSessionWarning();
          }

          // Auto-refresh if remember me is enabled and session is about to expire
          if (state.rememberMe && timeUntilExpiry <= 2 * 60 * 1000 && timeUntilExpiry > 0) {
            state.refreshSession();
          }

          // Auto-logout if inactive for too long (30 minutes) and remember me is disabled
          if (!state.rememberMe && timeSinceActivity > 30 * 60 * 1000) {
            state.addSessionEvent('auto_logout_inactivity');
            state.logout();
          }
        };

        // Check every minute
        setInterval(checkSession, 60 * 1000);
      },

      checkSessionValidity: () => {
        const state = get();
        if (!state.session || !state.sessionExpiry) return false;
        
        const now = Date.now();
        const isExpired = now > state.sessionExpiry;
        const inactivityLimit = state.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000; // 7 days if remember me, 30 minutes otherwise
        const isInactive = now - state.lastActivity > inactivityLimit;
        
        return !isExpired && !isInactive;
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },

      setRememberMe: (remember: boolean) => {
        set({ rememberMe: remember });
        get().addSessionEvent(`remember_me_${remember ? 'enabled' : 'disabled'}`);
      },

      extendSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Error extending session:', error);
            return;
          }

          if (session) {
            set({
              session,
              sessionExpiry: session.expires_at ? new Date(session.expires_at).getTime() : null,
              lastActivity: Date.now(),
              sessionWarningShown: false,
              isSessionExpiring: false,
            });
            get().addSessionEvent('session_extended');
          }
        } catch (error) {
          console.error('Error extending session:', error);
        }
      },

      showSessionWarning: () => {
        set({ sessionWarningShown: true });
        get().addSessionEvent('session_warning_shown');
      },

      dismissSessionWarning: () => {
        set({ sessionWarningShown: false, isSessionExpiring: false });
        get().addSessionEvent('session_warning_dismissed');
      },

      enableAutoSave: (enabled: boolean) => {
        set({ autoSaveEnabled: enabled });
      },

      addSessionEvent: (action: string) => {
        const state = get();
        const newEvent = {
          timestamp: Date.now(),
          action,
          ip: undefined // Could be populated with actual IP if needed
        };
        
        set({
          sessionHistory: [...state.sessionHistory.slice(-49), newEvent] // Keep last 50 events
        });
      },

      getSessionDuration: () => {
        const state = get();
        if (!state.sessionExpiry) return 0;
        return Math.max(0, state.sessionExpiry - Date.now());
      },

      isSessionHealthy: () => {
        const state = get();
        if (!state.isAuthenticated) return false;
        
        const sessionDuration = state.getSessionDuration();
        const timeSinceActivity = Date.now() - state.lastActivity;
        
        return sessionDuration > 5 * 60 * 1000 && timeSinceActivity < 10 * 60 * 1000; // Healthy if >5min left and <10min since activity
      },

      refreshSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Error refreshing session:', error);
            // Handle refresh token not found error
            if (error.message?.includes('Refresh Token Not Found') ||
                error.message?.includes('session_not_found') ||
                error.message?.includes('Auth session missing')) {
              // Don't attempt signOut if session is already invalid
              set({
                session: null,
                user: null,
                profile: null,
                sessionExpiry: null,
                sessionWarningShown: false,
                isSessionExpiring: false,
                isAuthenticated: false,
                error: null
              });
              return;
            }
            return;
          }

          if (session) {
            set({
              session,
              user: session.user,
              sessionExpiry: session.expires_at ? new Date(session.expires_at).getTime() : null,
              lastActivity: Date.now(),
              sessionWarningShown: false,
              isSessionExpiring: false,
            });
            get().addSessionEvent('session_refreshed');
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Starting login process for:', email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error);
            set({ error: error.message, isLoading: false });
            return false;
          }

          if (data.user && data.session) {
            console.log('Login successful, loading profile for user:', data.user.id);
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Error loading profile during login:', profileError);
              // Continue without profile if it doesn't exist yet
            }

            console.log('Setting auth state with user:', data.user.id);
            set({
              user: data.user,
              session: data.session,
              profile,
              sessionExpiry: data.session.expires_at ? new Date(data.session.expires_at).getTime() : null,
              lastActivity: Date.now(),
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            get().addSessionEvent('login_success');
            
            console.log('Login completed successfully');
            return true;
          }

          console.log('Login failed: no user or session returned');
          return false;
        } catch (error) {
          console.error('Login exception:', error);
          get().addSessionEvent('login_failed');
          set({ 
            error: 'Login failed. Please try again.', 
            isLoading: false 
          });
          return false;
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin
            }
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          get().addSessionEvent('google_oauth_initiated');
          // OAuth will redirect, so we don't need to handle the response here
          set({ isLoading: false });
          return true;
        } catch (error) {
          get().addSessionEvent('google_oauth_failed');
          set({ 
            error: 'Google sign-in failed. Please try again.', 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Starting registration process for:', email);
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              }
            }
          });

          if (error) {
            console.error('Registration error:', error);
            set({ error: error.message, isLoading: false });
            return false;
          }

          if (data.user) {
            console.log('Registration successful for user:', data.user.id);
            // If email confirmation is disabled, user will be automatically signed in
            if (data.session) {
              console.log('User automatically signed in, loading profile');
              // Get user profile
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

              if (profileError) {
                console.error('Error loading profile during registration:', profileError);
                // Continue without profile if it doesn't exist yet
              }

              set({
                user: data.user,
                session: data.session,
                profile,
                sessionExpiry: data.session.expires_at ? new Date(data.session.expires_at).getTime() : null,
                lastActivity: Date.now(),
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              get().addSessionEvent('register_success');
            } else {
              // Email confirmation required
              console.log('Email confirmation required');
              set({
                isLoading: false,
                error: null
              });
              get().addSessionEvent('register_confirmation_required');
            }
            return true;
          }

          return false;
        } catch (error) {
          console.error('Registration exception:', error);
          get().addSessionEvent('register_failed');
          set({ 
            error: 'Registration failed. Please try again.', 
            isLoading: false 
          });
          return false;
        }
      },

      updateProfile: async (updates: any) => {
        const state = get();
        if (!state.user) return false;

        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', state.user.id)
            .select()
            .single();

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          set({
            profile: data,
            isLoading: false,
            error: null
          });

          get().addSessionEvent('profile_updated');
          return true;
        } catch (error) {
          set({
            error: 'Profile update failed. Please try again.',
            isLoading: false
          });
          return false;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        
        try {
          get().addSessionEvent('logout_initiated');
          
          // Only attempt signOut if we have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error('Logout error:', error);
            }
          }

          set({
            user: null,
            session: null,
            profile: null,
            sessionExpiry: null,
            sessionWarningShown: false,
            isSessionExpiring: false,
            sessionHistory: [], // Clear session history on logout
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Logout failed:', error);
          // Even if logout fails, clear local state
          set({
            user: null,
            session: null,
            profile: null,
            sessionExpiry: null,
            sessionWarningShown: false,
            isSessionExpiring: false,
            sessionHistory: [],
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          get().addSessionEvent('password_reset_requested');
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          set({ 
            error: 'Password reset failed. Please try again.', 
            isLoading: false 
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setSession: (session: Session | null) => set({ 
        session,
        user: session?.user || null,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at).getTime() : null,
        isAuthenticated: !!session
      }),
    }),
    {
      name: 'creldesk-auth',
      partialize: (state) => ({
        lastActivity: state.lastActivity,
        rememberMe: state.rememberMe,
        autoSaveEnabled: state.autoSaveEnabled,
        sessionHistory: state.sessionHistory.slice(-10), // Persist last 10 events
        // Don't persist sensitive session data, let Supabase handle it
      }),
    }
  )
);