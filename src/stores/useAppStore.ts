import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { AppState, Theme, Project } from '../types';
import { useAuthStore } from './useAuthStore';

interface AppStore extends Omit<AppState, 'user' | 'isAuthenticated'> {
  // Theme
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  
  // UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  
  // Projects
  saveProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteProject: (id: string) => void;
  getProjectsByTool: (tool: string) => Project[];
  loadProjects: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark',
      sidebarCollapsed: false,
      currentTool: null,
      projects: [],
      
      // Theme
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      setTheme: (theme) => set({ theme }),
      
      // UI
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCurrentTool: (tool) => set({ currentTool: tool }),
      
      // Projects
      saveProject: async (projectData) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('projects')
            .upsert({
              user_id: user.id,
              name: projectData.name,
              tool: projectData.tool,
              data: projectData.data,
            })
            .select()
            .single();
            
          if (error) {
            console.error('Error saving project:', error);
            return;
          }
          if (data) {
            const project: Project = {
              id: data.id,
              name: data.name,
              tool: data.tool,
              data: data.data,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at),
            };
            set((state) => ({
              projects: [...state.projects.filter(p => p.id !== project.id), project]
            }));
          }
        } catch (error) {
          console.error('Error saving project:', error);
        }
      },
      
      deleteProject: async (id) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) {
            console.error('Error deleting project:', error);
            return;
          }
          set((state) => ({
            projects: state.projects.filter(p => p.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting project:', error);
        }
      },
      
      getProjectsByTool: (tool) => {
        const state = get();
        return state.projects.filter(p => p.tool === tool);
      },
      
      loadProjects: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
          if (error) {
            console.error('Error loading projects:', error);
            return;
          }
          if (data) {
            const projects: Project[] = data.map(item => ({
              id: item.id,
              name: item.name,
              tool: item.tool,
              data: item.data,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.updated_at),
            }));
            set({ projects });
          }
        } catch (error) {
          console.error('Error loading projects:', error);
        }
      },
    }),
    {
      name: 'creldesk-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        projects: state.projects,
      }),
    }
  )
);