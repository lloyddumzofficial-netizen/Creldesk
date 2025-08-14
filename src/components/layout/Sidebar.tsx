import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Search, Sparkles, Zap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { TOOLS, TOOL_CATEGORIES } from '../../constants/tools';
import { cn } from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    currentTool, 
    setCurrentTool,
    projects 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 72 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  const recentProjects = projects.slice(-3);
  const filteredTools = TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside
      initial={false}
      animate={sidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-[73px] bottom-0 z-30 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    Creldesk
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Professional Suite
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hidden lg:flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-900/30"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors duration-200" size={16} />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm shadow-sm placeholder:text-slate-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {/* Quick Actions */}
        <AnimatePresence>
          {!sidebarCollapsed && recentProjects.length > 0 && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="px-6 mb-10"
            >
              <div className="flex items-center space-x-3 mb-6 px-1">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Clock size={12} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">Recent Projects</span>
              </div>
              <div className="space-y-3">
                {recentProjects.map((project, index) => (
                  <motion.button
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 hover:shadow-sm"
                  >
                    <div className="font-medium truncate text-sm">{project.name}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool Categories */}
        {TOOL_CATEGORIES.map((category, categoryIndex) => {
          const categoryTools = filteredTools.filter(tool => tool.category === category.id);
          
          if (categoryTools.length === 0) return null;
          
          const CategoryIcon = (LucideIcons as any)[category.icon];

          return (
            <motion.div 
              key={category.id} 
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className={cn(
                "flex items-center px-6 mb-5",
                sidebarCollapsed ? "justify-center" : "space-x-3"
              )}>
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                  <CategoryIcon size={12} className="text-white" />
                </div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex items-center space-x-2"
                    >
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
                        {category.name}
                      </span>
                      <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {categoryTools.length}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2 px-4">
                {categoryTools.map((tool, toolIndex) => {
                  const ToolIcon = (LucideIcons as any)[tool.icon];
                  const isActive = currentTool === tool.id;

                  return (
                    <motion.button
                      key={tool.id}
                      onClick={() => setCurrentTool(tool.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (toolIndex * 0.05) }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                        sidebarCollapsed ? "p-3.5 justify-center" : "p-3.5 space-x-3",
                        isActive
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                          : "hover:bg-white/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 hover:shadow-sm"
                      )}
                    >
                      {/* Background gradient for active state */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          layoutId="activeBackground"
                        />
                      )}
                      
                      <div className={cn(
                        "relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm",
                        isActive 
                          ? "bg-white/20 backdrop-blur-sm" 
                          : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                      )}>
                        <ToolIcon size={17} className={cn(
                          "transition-colors duration-200",
                          isActive 
                            ? "text-white" 
                            : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        )} />
                      </div>
                      
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.div
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className="flex-1 text-left relative z-10"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium tracking-wide">{tool.name}</span>
                              {tool.new && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-medium shadow-sm">
                                  New
                                </span>
                              )}
                              {tool.premium && (
                                <Zap size={12} className="text-amber-400" />
                              )}
                            </div>
                            {!isActive && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                                {tool.description}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="p-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm"
          >
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                All you need. In one desk.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};