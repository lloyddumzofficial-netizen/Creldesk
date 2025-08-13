import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { SessionWarning } from './SessionWarning';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useAppStore();
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-150 flex flex-col">
      <SessionWarning />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <Header />
      
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-out",
          "min-h-[calc(100vh-73px-64px)]" // Account for header and footer height
        )}>
          {children}
        </main>
      </div>
      
      <Footer />
      
      {/* Mobile sidebar overlay */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-50 transition-opacity duration-300",
        !sidebarCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="absolute inset-0 bg-black/50" onClick={() => useAppStore.getState().setSidebarCollapsed(true)} />
        <div className="relative">
          {/* Close button for mobile */}
          <button
            onClick={() => useAppStore.getState().setSidebarCollapsed(true)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Sidebar />
        </div>
      </div>
    </div>
  );
};