export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'editors' | 'productivity' | 'utilities';
  premium?: boolean;
  new?: boolean;
}

export interface Project {
  id: string;
  name: string;
  tool: string;
  data: any;
  updatedAt: Date;
  createdAt: Date;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  theme: Theme;
  sidebarCollapsed: boolean;
  currentTool: string | null;
  projects: Project[];
  isAuthenticated: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    profileImage?: string;
  };
  objective: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  to: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface ProposalData {
  clientName: string;
  projectTitle: string;
  projectDescription: string;
  scope: string[];
  timeline: string;
  budget: number;
  terms: string;
  deliverables: string[];
}