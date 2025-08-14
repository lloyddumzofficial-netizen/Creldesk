import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, X, Move, RotateCcw, ChevronLeft, ChevronRight, Eye, Save, Share2, Palette, Type, Layout, Zap, Check, Plus, Trash2, GripVertical } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { ResumeData } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

// Types
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  demo?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean, spacious layout with plenty of whitespace',
    category: 'Professional',
    preview: 'Clean design with blue accents'
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Traditional corporate layout',
    category: 'Corporate',
    preview: 'Conservative formatting'
  },
  {
    id: 'creative-freelancer',
    name: 'Creative Freelancer',
    description: 'Modern, visually appealing design for creatives',
    category: 'Creative',
    preview: 'Two-column creative layout'
  },
  {
    id: 'tech-developer',
    name: 'Tech Developer',
    description: 'Code-focused, technical layout',
    category: 'Technical',
    preview: 'Developer-friendly design'
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Luxury, high-end design for senior professionals',
    category: 'Executive',
    preview: 'Premium professional styling'
  }
];

const COLOR_THEMES = [
  { id: 'blue', name: 'Professional Blue', primary: '#2563eb', secondary: '#1e40af' },
  { id: 'green', name: 'Growth Green', primary: '#059669', secondary: '#047857' },
  { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', secondary: '#6d28d9' },
  { id: 'orange', name: 'Energy Orange', primary: '#ea580c', secondary: '#c2410c' },
  { id: 'monochrome', name: 'Classic Black', primary: '#374151', secondary: '#1f2937' }
];

const STEPS = [
  { id: 1, name: 'Template', icon: Layout },
  { id: 2, name: 'Personal', icon: User },
  { id: 3, name: 'Summary', icon: FileText },
  { id: 4, name: 'Experience', icon: Briefcase },
  { id: 5, name: 'Education', icon: GraduationCap },
  { id: 6, name: 'Skills', icon: Zap },
  { id: 7, name: 'Projects', icon: Code },
  { id: 8, name: 'Preview', icon: Eye }
];

export const ResumeBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimalist');
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const { user: authUser } = useAuthStore();
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const saveData = {
      currentStep,
      selectedTemplate,
      selectedTheme,
      resumeData,
      profilePhoto
    };
    localStorage.setItem('resume-builder-data', JSON.stringify(saveData));
  }, [currentStep, selectedTemplate, selectedTheme, resumeData, profilePhoto]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resume-builder-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCurrentStep(parsed.currentStep || 1);
        setSelectedTemplate(parsed.selectedTemplate || 'modern-minimalist');
        setSelectedTheme(parsed.selectedTheme || 'blue');
        setResumeData(parsed.resumeData || resumeData);
        setProfilePhoto(parsed.profilePhoto || null);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const currentTheme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0];

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp]
    });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu]
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: '',
      level: 5,
      category: 'Technical'
    };
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, newSkill]
    });
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    });
  };

  const removeSkill = (id: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill.id !== id)
    });
  };

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      demo: ''
    };
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject]
    });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      )
    });
  };

  const removeProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(project => project.id !== id)
    });
  };

  const exportPDF = async () => {
    if (!previewRef.current) return;

    try {
      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const A4_WIDTH = 595;
      const A4_HEIGHT = 842;
      const MARGIN = 40;

      const canvas = await html2canvas(previewRef.current, {
        width: A4_WIDTH,
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT]
      });

      // Add metadata for re-import functionality
      pdf.setProperties({
        title: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume`,
        author: authUser?.email || 'Resume Builder User',
        subject: 'Professional Resume',
        creator: 'Creldesk Resume Builder',
        resumeData: JSON.stringify({
          resumeData,
          selectedTemplate,
          selectedTheme,
          profilePhoto
        }),
        generatedDate: new Date().toISOString()
      });

      const imgHeight = (canvas.height * A4_WIDTH) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH, imgHeight);

      const fileName = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const generateShareableLink = async () => {
    try {
      const shareId = `${authUser?.id || 'anonymous'}-${Date.now()}`;
      const shareData = {
        resumeData,
        shareId,
        selectedTheme,
        profilePhoto
      };
      
      // In a real app, this would upload to cloud storage
      const shareId = btoa(JSON.stringify(shareData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
      const shareUrl = `${window.location.origin}/resume/${shareId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      alert('Shareable link copied to clipboard!');
    } catch (error) {
      prompt('Copy this shareable link:', shareUrl);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Template Selection
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Choose Your Template</h2>
              <p className="text-slate-600 dark:text-slate-400">Select a professional template that matches your style</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg",
                    selectedTemplate === template.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "hover:shadow-md"
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <Layout size={32} className="text-white" />
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{template.preview}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{template.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{template.description}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                      {template.category}
                    </span>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Color Theme Selection */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Choose Color Theme</h3>
              <div className="flex flex-wrap gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all",
                      selectedTheme === theme.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Personal Information
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Personal Information</h2>
              <p className="text-slate-600 dark:text-slate-400">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name *"
                value={resumeData.personalInfo.firstName}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, firstName: e.target.value }
                })}
                placeholder="John"
                required
              />
              <Input
                label="Last Name *"
                value={resumeData.personalInfo.lastName}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, lastName: e.target.value }
                })}
                placeholder="Doe"
                required
              />
              <Input
                label="Email *"
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                })}
                placeholder="john.doe@email.com"
                required
              />
              <Input
                label="Phone *"
                value={resumeData.personalInfo.phone}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                })}
                placeholder="+1 (555) 123-4567"
                required
              />
              <Input
                label="Location *"
                value={resumeData.personalInfo.location}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                })}
                placeholder="New York, NY"
                required
              />
              <Input
                label="Website"
                value={resumeData.personalInfo.website || ''}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, website: e.target.value }
                })}
                placeholder="https://johndoe.com"
              />
              <Input
                label="LinkedIn"
                value={resumeData.personalInfo.linkedin || ''}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                })}
                placeholder="linkedin.com/in/johndoe"
              />
              <Input
                label="GitHub"
                value={resumeData.personalInfo.github || ''}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                })}
                placeholder="github.com/johndoe"
              />
            </div>

            {/* Profile Photo Upload */}
            <Card padding="md">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Profile Photo (Optional)</h3>
              <div className="flex items-center space-x-4">
                {profilePhoto ? (
                  <div className="relative">
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                    />
                    <button
                      onClick={() => setProfilePhoto(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <Upload size={24} className="text-slate-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setProfilePhoto(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recommended: Square image, 400x400px
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 3: // Professional Summary
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Professional Summary</h2>
              <p className="text-slate-600 dark:text-slate-400">Write a compelling summary of your professional background</p>
            </div>

            <Card padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Professional Summary *
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Zap size={14} className="mr-1" />
                      AI Suggest
                    </Button>
                    <span className="text-xs text-slate-500">
                      {resumeData.summary.length}/300
                    </span>
                  </div>
                </div>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 resize-none"
                  rows={6}
                  placeholder="Write a compelling 2-3 sentence summary highlighting your key achievements, skills, and career objectives..."
                  maxLength={300}
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips for a great summary:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Start with your years of experience and key expertise</li>
                    <li>• Mention 2-3 of your biggest achievements</li>
                    <li>• Include relevant keywords for your industry</li>
                    <li>• Keep it concise but impactful (150-300 characters)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 4: // Work Experience
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Work Experience</h2>
                <p className="text-slate-600 dark:text-slate-400">Add your professional experience</p>
              </div>
              <Button onClick={addExperience}>
                <Plus size={16} className="mr-2" />
                Add Experience
              </Button>
            </div>

            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <Card key={exp.id} padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical size={16} className="text-slate-400 cursor-move" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Experience {index + 1}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Company *"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                      required
                    />
                    <Input
                      label="Position *"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="Job Title"
                      required
                    />
                    <Input
                      label="Location"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      placeholder="City, State"
                    />
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Current Position
                        </span>
                      </label>
                    </div>
                    <Input
                      label="Start Date *"
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      required
                    />
                    {!exp.current && (
                      <Input
                        label="End Date *"
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Job Description *
                      </label>
                      <Button variant="outline" size="sm">
                        <Zap size={14} className="mr-1" />
                        AI Suggest
                      </Button>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                      rows={4}
                      placeholder="• Describe your key responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Include quantifiable results when possible&#10;• Focus on impact and outcomes"
                    />
                  </div>
                </Card>
              ))}

              {resumeData.experience.length === 0 && (
                <Card padding="lg" className="text-center">
                  <div className="py-8">
                    <Briefcase size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No work experience added yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your professional experience to showcase your career journey
                    </p>
                    <Button onClick={addExperience}>
                      <Plus size={16} className="mr-2" />
                      Add Your First Experience
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 5: // Education
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Education</h2>
                <p className="text-slate-600 dark:text-slate-400">Add your educational background</p>
              </div>
              <Button onClick={addEducation}>
                <Plus size={16} className="mr-2" />
                Add Education
              </Button>
            </div>

            <div className="space-y-6">
              {resumeData.education.map((edu, index) => (
                <Card key={edu.id} padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical size={16} className="text-slate-400 cursor-move" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Education {index + 1}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Institution *"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      placeholder="University Name"
                      required
                    />
                    <Input
                      label="Degree *"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                      required
                    />
                    <Input
                      label="Field of Study *"
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      placeholder="Computer Science"
                      required
                    />
                    <Input
                      label="Graduation Date *"
                      type="month"
                      value={edu.graduationDate}
                      onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      required
                    />
                    <Input
                      label="GPA (Optional)"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </Card>
              ))}

              {resumeData.education.length === 0 && (
                <Card padding="lg" className="text-center">
                  <div className="py-8">
                    <GraduationCap size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No education added yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your educational background to strengthen your resume
                    </p>
                    <Button onClick={addEducation}>
                      <Plus size={16} className="mr-2" />
                      Add Your Education
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 6: // Skills
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Skills</h2>
                <p className="text-slate-600 dark:text-slate-400">Showcase your technical and soft skills</p>
              </div>
              <Button onClick={addSkill}>
                <Plus size={16} className="mr-2" />
                Add Skill
              </Button>
            </div>

            <div className="space-y-6">
              {resumeData.skills.map((skill, index) => (
                <Card key={skill.id} padding="md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical size={16} className="text-slate-400 cursor-move" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Skill {index + 1}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input
                      label="Skill Name *"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                      placeholder="JavaScript"
                      required
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Category
                      </label>
                      <select
                        value={skill.category}
                        onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Languages">Languages</option>
                        <option value="Tools">Tools</option>
                        <option value="Frameworks">Frameworks</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Proficiency Level: {skill.level}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={skill.level}
                        onChange={(e) => updateSkill(skill.id, 'level', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                        style={{
                          background: `linear-gradient(to right, ${currentTheme.primary} 0%, ${currentTheme.primary} ${skill.level * 10}%, #e2e8f0 ${skill.level * 10}%, #e2e8f0 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {resumeData.skills.length === 0 && (
                <Card padding="lg" className="text-center">
                  <div className="py-8">
                    <Zap size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No skills added yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your skills to highlight your expertise
                    </p>
                    <Button onClick={addSkill}>
                      <Plus size={16} className="mr-2" />
                      Add Your First Skill
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 7: // Projects
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Projects</h2>
                <p className="text-slate-600 dark:text-slate-400">Showcase your best work and projects</p>
              </div>
              <Button onClick={addProject}>
                <Plus size={16} className="mr-2" />
                Add Project
              </Button>
            </div>

            <div className="space-y-6">
              {resumeData.projects.map((project, index) => (
                <Card key={project.id} padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical size={16} className="text-slate-400 cursor-move" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Project {index + 1}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Project Name *"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        placeholder="My Awesome Project"
                        required
                      />
                      <Input
                        label="Project URL"
                        value={project.url || ''}
                        onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                        placeholder="https://github.com/username/project"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Project Description *
                      </label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                        rows={3}
                        placeholder="Describe what the project does, your role, and key achievements..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Technologies Used
                      </label>
                      <Input
                        value={project.technologies.join(', ')}
                        onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(', ').filter(t => t.trim()))}
                        placeholder="React, Node.js, MongoDB, AWS"
                      />
                      <p className="text-xs text-slate-500">Separate technologies with commas</p>
                    </div>
                  </div>
                </Card>
              ))}

              {resumeData.projects.length === 0 && (
                <Card padding="lg" className="text-center">
                  <div className="py-8">
                    <Code size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No projects added yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your projects to demonstrate your practical skills
                    </p>
                    <Button onClick={addProject}>
                      <Plus size={16} className="mr-2" />
                      Add Your First Project
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 8: // Preview & Export
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Preview & Export</h2>
              <p className="text-slate-600 dark:text-slate-400">Review your resume and export as PDF</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={exportPDF} size="lg">
                <Download size={20} className="mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={generateShareableLink} size="lg">
                <Share2 size={20} className="mr-2" />
                Share Resume
              </Button>
              <Button variant="outline" size="lg">
                <Save size={20} className="mr-2" />
                Save to Cloud
              </Button>
            </div>

            {/* Resume Preview */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Resume Preview</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">A4 Format</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white">
                <div
                  ref={previewRef}
                  className="max-w-[595px] mx-auto bg-white shadow-lg"
                  style={{ minHeight: '842px', width: '595px' }}
                >
                  {renderResumePreview()}
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResumePreview = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    const theme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0];

    return (
      <div className="p-12 text-sm leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: theme.primary }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>
            {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
            {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
            {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
            {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
            {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {resumeData.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: theme.primary }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-slate-700 leading-relaxed">{resumeData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: theme.primary }}>
              WORK EXPERIENCE
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-slate-900">{exp.position}</h3>
                      <p className="text-slate-700">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    </div>
                    <div className="text-slate-600 text-sm">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-slate-700 mt-2 whitespace-pre-line">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: theme.primary }}>
              EDUCATION
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{edu.degree} in {edu.field}</h3>
                    <p className="text-slate-700">{edu.institution}</p>
                    {edu.gpa && <p className="text-slate-600 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {edu.graduationDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: theme.primary }}>
              SKILLS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {resumeData.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between">
                  <span className="text-slate-900 font-medium">{skill.name}</span>
                  <div className="flex space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: i < skill.level ? theme.primary : '#e2e8f0'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: theme.primary }}>
              PROJECTS
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{project.name}</h3>
                    {project.url && (
                      <a href={project.url} className="text-sm" style={{ color: theme.primary }}>
                        View Project
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-slate-700 mb-2">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded"
                          style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Resume Builder</h1>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-500 text-white"
                        : isCompleted
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    )}
                  >
                    {isCompleted ? (
                      <Check size={16} />
                    ) : (
                      <StepIcon size={16} />
                    )}
                    <span className="hidden sm:inline">{step.name}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Content */}
          <div className="lg:col-span-3">
            <Card padding="xl">
              {renderStepContent()}
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-32">
              <Card className="p-0 overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Preview</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">A4 Format</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white max-h-[600px] overflow-y-auto">
                  <div
                    className="bg-white shadow-sm border border-slate-200 mx-auto"
                    style={{ 
                      width: '297px', // A4 width scaled down
                      minHeight: '420px', // A4 height scaled down
                      transform: 'scale(0.5)',
                      transformOrigin: 'top center'
                    }}
                  >
                    {renderResumePreview()}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Auto-saved • Last saved just now
          </div>
          
          {currentStep < STEPS.length ? (
            <Button onClick={nextStep}>
              Next
              <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={exportPDF}>
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};