import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { AdUnit } from '../ads/AdUnit';

interface ToolWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showHeaderAd?: boolean;
  showSidebarAd?: boolean;
  showFooterAd?: boolean;
}

export const ToolWrapper: React.FC<ToolWrapperProps> = ({
  title,
  description,
  children,
  showHeaderAd = true,
  showSidebarAd = true,
  showFooterAd = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-0 w-full"
    >
      {/* Tool Header */}
      <div className="mb-8 px-6 pt-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {/* Header Ad */}

      {/* Main Content Area */}
      <div className="flex gap-0">
        {/* Tool Interface */}
        <div className="flex-1 px-6">
          <Card padding="xl" className="min-h-[600px] w-full">
            {children}
          </Card>
        </div>

        {/* Sidebar with Ad */}
        {showSidebarAd && (
          <div className="hidden xl:block w-80 pr-6">
            <div className="sticky top-6 space-y-6 pl-6">
              {/* Header Ad moved to sidebar */}
              {showHeaderAd && (
                <AdUnit placement="sidebar" size="300x250" />
              )}
              
              <AdUnit placement="sidebar" size="300x250" />
              
              {/* Tips Card */}
              <Card padding="lg">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Pro Tips
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use keyboard shortcuts to work faster
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your work is automatically saved
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Export in multiple formats
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer Ad */}
      {showFooterAd && (
        <div className="px-6 pb-6">
          <AdUnit placement="footer" size="728x90" className="mt-8" />
        </div>
      )}
    </motion.div>
  );
};