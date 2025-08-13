import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Sparkles, Zap, Target, Users, BarChart3, Calendar } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { TOOLS } from '../constants/tools';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export const Dashboard: React.FC = () => {
  const { setCurrentTool, projects } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Get user name from Supabase user metadata
  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.name || user.email?.split('@')[0] || '';
  };
  
  const recentProjects = projects.slice(-6);
  
  // Get current time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get popular tools (mock data for now)
  const popularTools = TOOLS.slice(0, 8);
  const featuredTools = TOOLS.filter(tool => ['logo-editor', 'resume-builder', 'invoice-generator', 'qr-code-generator'].includes(tool.id));
  
  // Stats data
  const stats = [
    { label: 'Projects Created', value: projects.length, icon: Target, color: 'from-blue-500 to-blue-600' },
    { label: 'Tools Available', value: TOOLS.length, icon: Zap, color: 'from-purple-500 to-purple-600' },
    { label: 'Hours Saved', value: Math.floor(projects.length * 2.5), icon: Clock, color: 'from-green-500 to-green-600' },
    { label: 'This Month', value: projects.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'from-orange-500 to-orange-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 max-w-7xl mx-auto min-h-screen"
    >
      {/* Hero Welcome Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 md:p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Sparkles size={32} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {getGreeting()}{isAuthenticated && user ? `, ${getUserName().split(' ')[0]}!` : '!'}
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300">
                  Ready to create something amazing? Your creative toolkit awaits.
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                        <StatIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Featured Tools Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <Card padding="lg" className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Featured Tools
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Most popular tools to boost your productivity
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTools.map((tool, index) => {
              const ToolIcon = (LucideIcons as any)[tool.icon];
              
              return (
                <motion.div
                  key={tool.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group cursor-pointer"
                  onClick={() => setCurrentTool(tool.id)}
                >
                  <Card hover padding="lg" className="h-full bg-white dark:bg-slate-800 border-2 border-transparent group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-all duration-300">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <ToolIcon size={32} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                          Get Started
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card padding="lg" className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Recent Projects
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Continue where you left off
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentProjects.map((project, index) => {
                  const tool = TOOLS.find(t => t.id === project.tool);
                  const ToolIcon = tool ? (LucideIcons as any)[tool.icon] : null;
                  
                  return (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => setCurrentTool(project.tool)}
                    >
                      <Card
                        hover
                        padding="md"
                        className="border-2 border-transparent group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          {ToolIcon && (
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <ToolIcon size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                              {tool?.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {new Date(project.updatedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                  Open →
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* All Tools */}
        <motion.div variants={itemVariants} className={recentProjects.length > 0 ? '' : 'xl:col-span-3'}>
          <Card padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    All Tools
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your complete creative arsenal
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {TOOLS.map((tool, index) => {
                const ToolIcon = (LucideIcons as any)[tool.icon];
                
                return (
                  <motion.div
                    key={tool.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group cursor-pointer"
                    onClick={() => setCurrentTool(tool.id)}
                  >
                    <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <ToolIcon size={18} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {tool.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {tool.new && (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs rounded-full font-medium">
                                New
                              </span>
                            )}
                            {tool.premium && (
                              <Zap size={14} className="text-amber-500" />
                            )}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-primary-600 dark:text-primary-400">
                                →
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mt-12">
        <Card padding="lg" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">
                Ready to Create Something Amazing?
              </h2>
            </div>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              Choose from our professional toolkit and bring your ideas to life. 
              From logos to resumes, we've got everything you need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {featuredTools.slice(0, 3).map((tool) => {
                const ToolIcon = (LucideIcons as any)[tool.icon];
                return (
                  <Button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200"
                    size="lg"
                  >
                    <ToolIcon size={18} className="mr-2" />
                    {tool.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
};