import React, { useState, useEffect } from 'react';
import { OnboardingSurvey } from './OnboardingSurvey';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../lib/supabase';

interface OnboardingData {
  role: string;
  customRole?: string;
  goals: string[];
  experience: string;
}

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // If profile doesn't have onboarding data, show survey
        const needsOnboarding = !profile?.onboarding_completed;
        setShowOnboarding(needsOnboarding);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding if we can't determine status
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;

    try {
      // Save onboarding data to user profile
      await supabase
        .from('profiles')
        .update({
          role: data.role,
          custom_role: data.customRole,
          goals: data.goals,
          experience_level: data.experience,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Still proceed to dashboard even if save fails
      setShowOnboarding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Loading Creldesk
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Preparing your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (showOnboarding) {
    return <OnboardingSurvey onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
};