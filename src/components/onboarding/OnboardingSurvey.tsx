import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Users, Target, Sun, Moon, Check, GraduationCap, Briefcase, Building2, Store, Rocket, Wand2, Palette, Zap, BarChart3, BookOpen, Handshake, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';

interface OnboardingData {
  role: string;
  customRole?: string;
  goals: string[];
  experience: string;
}

interface OnboardingSurveyProps {
  onComplete: (data: OnboardingData) => void;
}

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Learning and academic projects' },
  { id: 'freelancer', label: 'Freelancer', icon: Briefcase, description: 'Independent contractor or consultant' },
  { id: 'employee', label: 'Employee', icon: Building2, description: 'Working at a company or organization' },
  { id: 'business-owner', label: 'Business Owner', icon: Store, description: 'Running an established business' },
  { id: 'founder', label: 'Founder', icon: Rocket, description: 'Building a startup or new venture' },
  { id: 'other', label: 'Other', icon: Wand2, description: 'Something else entirely' },
];

const GOALS = [
  { id: 'design', label: 'Design & Creative Work', icon: Palette },
  { id: 'productivity', label: 'Boost Productivity', icon: Zap },
  { id: 'business', label: 'Business Operations', icon: BarChart3 },
  { id: 'learning', label: 'Learning & Development', icon: BookOpen },
  { id: 'collaboration', label: 'Team Collaboration', icon: Handshake },
  { id: 'automation', label: 'Workflow Automation', icon: RotateCcw },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Just getting started', description: 'New to productivity tools' },
  { id: 'intermediate', label: 'Some experience', description: 'Used similar tools before' },
  { id: 'advanced', label: 'Very experienced', description: 'Power user of productivity tools' },
];

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: '',
    customRole: '',
    goals: [],
    experience: '',
  });
  const [customRoleInput, setCustomRoleInput] = useState('');
  const { theme, toggleTheme } = useAppStore();
  const { user } = useAuthStore();

  const totalSteps = 3;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleRoleSelect = (roleId: string) => {
    setOnboardingData(prev => ({ ...prev, role: roleId }));
    if (roleId !== 'other') {
      setCustomRoleInput('');
      setOnboardingData(prev => ({ ...prev, customRole: '' }));
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleExperienceSelect = (experienceId: string) => {
    setOnboardingData(prev => ({ ...prev, experience: experienceId }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const finalData = {
      ...onboardingData,
      customRole: onboardingData.role === 'other' ? customRoleInput : undefined,
    };
    onComplete(finalData);
  };

  const handleSkip = () => {
    onComplete({
      role: 'other',
      goals: [],
      experience: 'intermediate',
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return onboardingData.role && (onboardingData.role !== 'other' || customRoleInput.trim());
      case 1:
        return onboardingData.goals.length > 0;
      case 2:
        return onboardingData.experience;
      default:
        return false;
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Welcome to Creldesk, {getUserName()}! 👋
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Let's personalize your experience by learning a bit about you. This helps us show you the most relevant tools and features.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
                What best describes your role?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ROLES.map((role, index) => (
                  <motion.button
                    key={role.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                      onboardingData.role === role.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <role.icon size={24} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {role.label}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {role.description}
                        </div>
                      </div>
                      {onboardingData.role === role.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {onboardingData.role === 'other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="Please specify your role..."
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 transition-all duration-200"
                    autoFocus
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Target size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  What are your main goals?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Select all that apply. This helps us prioritize the tools and features most relevant to you.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GOALS.map((goal, index) => (
                  <motion.button
                    key={goal.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                      onboardingData.goals.includes(goal.id)
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <goal.icon size={24} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {goal.label}
                        </div>
                      </div>
                      {onboardingData.goals.includes(goal.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  How familiar are you with productivity tools?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  This helps us tailor the interface complexity and provide appropriate guidance.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level, index) => (
                  <motion.button
                    key={level.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExperienceSelect(level.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                      onboardingData.experience === level.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {level.label}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {level.description}
                        </div>
                      </div>
                      {onboardingData.experience === level.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <img 
              src="/Creldesk.png" 
              alt="Creldesk Logo" 
              className="h-12 w-auto max-w-[200px] object-contain"
              width="200"
              height="48"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </motion.div>

        {/* Survey Content */}
        <Card padding="xl" className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 shadow-2xl border-0">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </Button>
              )}
              
              <button
                onClick={handleSkip}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors underline"
              >
                Skip for now
              </button>
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>{currentStep === totalSteps - 1 ? 'Get Started' : 'Continue'}</span>
              <ChevronRight size={16} />
            </Button>
          </motion.div>
        </Card>
      </div>
    </div>
  );
};