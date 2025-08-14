import { Tool } from '../types';

export const TOOLS: Tool[] = [
  // Editors
  {
    id: 'photopea-editor',
    name: 'Photopea Editor',
    description: 'Professional photo editing with Photoshop-like features',
    icon: 'Image',
    category: 'editors',
  },
  {
    id: 'logo-editor',
    name: 'Logo Editor',
    description: 'Create logos with text, shapes, and Bezier curves',
    icon: 'Palette',
    category: 'editors',
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    description: 'Form-based resume builder with PDF export',
    icon: 'FileText',
    category: 'editors',
  },
  {
    id: 'proposal-generator',
    name: 'Proposal Generator',
    description: 'Ready-to-use freelancer proposal format',
    icon: 'FileEdit',
    category: 'editors',
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    description: 'Auto date, editable fields, export PDF',
    icon: 'Receipt',
    category: 'editors',
  },
  
  // Productivity
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    description: 'Upload PDF, compress, and download',
    icon: 'FileDown',
    category: 'productivity',
  },
  {
    id: 'screen-recorder',
    name: 'Screen Recorder',
    description: 'Record video + audio and export',
    icon: 'Video',
    category: 'productivity',
  },
  {
    id: 'file-converter',
    name: 'File Converter',
    description: 'PNG ↔ JPG, PDF ↔ DOCX conversion',
    icon: 'RefreshCw',
    category: 'productivity',
  },
  {
    id: 'audio-visualizer',
    name: 'Audio Visualizer',
    description: 'Upload MP3 and create animated bars',
    icon: 'Music',
    category: 'productivity',
  },
  
  // Utilities
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR for URLs or payments',
    icon: 'QrCode',
    category: 'utilities',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Customizable length, symbols, numbers',
    icon: 'Shield',
    category: 'utilities',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick color, show hex, copy to clipboard',
    icon: 'Pipette',
    category: 'utilities',
  },
  {
    id: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description: 'Start/stop/reset, configurable intervals',
    icon: 'Timer',
    category: 'utilities',
  },
  {
    id: 'task-board',
    name: 'Task Board',
    description: 'Kanban-style task management with drag-and-drop',
    icon: 'Trello',
    category: 'productivity',
  },
];

export const TOOL_CATEGORIES = [
  { id: 'editors', name: 'Editors', icon: 'Edit3' },
  { id: 'productivity', name: 'Productivity', icon: 'Zap' },
  { id: 'utilities', name: 'Utilities', icon: 'Settings' },
];