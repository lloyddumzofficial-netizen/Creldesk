import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { useAuthStore } from './stores/useAuthStore';
import { LandingPage } from './components/LandingPage';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/Dashboard';
import { ToolWrapper } from './components/tools/ToolWrapper';
import { PhotopeaEditor } from './components/tools/PhotopeaEditor';
import { LogoEditor } from './components/tools/LogoEditor';
import { ResumeBuilder } from './components/tools/ResumeBuilder';
import { ProposalGenerator } from './components/tools/ProposalGenerator';
import { InvoiceGenerator } from './components/tools/InvoiceGenerator';
import { PDFCompressor } from './components/tools/PDFCompressor';
import { ScreenRecorder } from './components/tools/ScreenRecorder';
import { FileConverter } from './components/tools/FileConverter';
import { AudioVisualizer } from './components/tools/AudioVisualizer';
import { QRCodeGenerator } from './components/tools/QRCodeGenerator';
import { PasswordGenerator } from './components/tools/PasswordGenerator';
import { ColorPicker } from './components/tools/ColorPicker';
import { PomodoroTimer } from './components/tools/PomodoroTimer';
import { TOOLS } from './constants/tools';

function App() {
  const { theme, currentTool } = useAppStore();
  const { 
    isAuthenticated, 
    initialize, 
    isLoading, 
    checkSessionValidity, 
    refreshSession,
    updateLastActivity,
    autoSaveEnabled
  } = useAuthStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initialize authentication
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      useAppStore.getState().loadProjects();
    }
  }, [isAuthenticated]);

  // Session validation and refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!checkSessionValidity()) {
        console.log('Session invalid, attempting refresh...');
        refreshSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSessionValidity, refreshSession]);

  // Activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => updateLastActivity();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateLastActivity]);

  // Auto-save functionality
  useEffect(() => {
    if (!isAuthenticated || !autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      // Auto-save current work
      const currentData = useAppStore.getState();
      if (currentData.currentTool) {
        // This could be expanded to save current tool state
        console.log('Auto-saving work...');
      }
    }, 2 * 60 * 1000); // Auto-save every 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [isAuthenticated, autoSaveEnabled]);

  // Show loading screen during initialization
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
              Initializing your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page if user is not authenticated
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const renderTool = () => {
    if (!currentTool) return <Dashboard />;

    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) return <Dashboard />;

    const toolComponents: Record<string, React.ReactNode> = {
      'photopea-editor': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
          showHeaderAd={false}
          showSidebarAd={false}
          showFooterAd={false}
        >
          <PhotopeaEditor />
        </ToolWrapper>
      ),
      'logo-editor': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <LogoEditor />
        </ToolWrapper>
      ),
      'resume-builder': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <ResumeBuilder />
        </ToolWrapper>
      ),
      'proposal-generator': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <ProposalGenerator />
        </ToolWrapper>
      ),
      'invoice-generator': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <InvoiceGenerator />
        </ToolWrapper>
      ),
      'pdf-compressor': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <PDFCompressor />
        </ToolWrapper>
      ),
      'screen-recorder': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <ScreenRecorder />
        </ToolWrapper>
      ),
      'file-converter': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <FileConverter />
        </ToolWrapper>
      ),
      'audio-visualizer': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <AudioVisualizer />
        </ToolWrapper>
      ),
      'qr-code-generator': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <QRCodeGenerator />
        </ToolWrapper>
      ),
      'password-generator': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <PasswordGenerator />
        </ToolWrapper>
      ),
      'color-picker': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <ColorPicker />
        </ToolWrapper>
      ),
      'pomodoro-timer': (
        <ToolWrapper
          title={tool.name}
          description={tool.description}
        >
          <PomodoroTimer />
        </ToolWrapper>
      ),
    };

    return toolComponents[currentTool] || (
      <ToolWrapper
        title={tool.name}
        description={tool.description}
      >
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Coming Soon
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            This tool is currently in development. We're working hard to bring you amazing features!
          </p>
        </div>
      </ToolWrapper>
    );
  };

  return (
    <MainLayout>
      {renderTool()}
    </MainLayout>
  );
}

export default App;