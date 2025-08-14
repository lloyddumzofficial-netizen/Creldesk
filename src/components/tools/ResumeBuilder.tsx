import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Save, 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages, 
  Heart,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Calendar,
  Building,
  Star,
  Palette,
  Upload,
  Camera,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';
import { ResumeData } from '../../types';

interface TemplateStyle {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  layout: 'sidebar' | 'traditional' | 'modern' | 'creative';
}

const RESUME_TEMPLATES: TemplateStyle[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, traditional layout perfect for corporate roles',
    primaryColor: '#1e293b',
    secondaryColor: '#64748b',
    accentColor: '#0ea5e9',
    layout: 'sidebar'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with bold colors and clean lines',
    primaryColor: '#0f172a',
    secondaryColor: '#475569',
    accentColor: '#14b8a6',
    layout: 'modern'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant design for creative professionals',
    primaryColor: '#1e1b4b',
    secondaryColor: '#6366f1',
    accentColor: '#f59e0b',
    layout: 'creative'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple design focusing on content',
    primaryColor: '#374151',
    secondaryColor: '#9ca3af',
    accentColor: '#059669',
    layout: 'traditional'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior positions',
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    accentColor: '#dc2626',
    layout: 'sidebar'
  }
];

const SKILL_CATEGORIES = [
  'Technical Skills',
  'Soft Skills',
  'Programming Languages',
  'Tools & Software',
  'Certifications',
  'Languages'
];

export const ResumeBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [showPreview, setShowPreview] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      website: 'www.johndoe.com',
      linkedin: 'linkedin.com/in/johndoe',
      profileImage: ''
    },
    objective: 'Experienced professional seeking to leverage expertise in a challenging role that offers growth opportunities and the chance to make meaningful contributions.',
    experience: [
      {
        id: '1',
        company: 'Tech Solutions Inc.',
        position: 'Senior Developer',
        startDate: '2020-01',
        endDate: '2024-01',
        current: false,
        description: 'Led development of scalable web applications serving 100k+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored junior developers and conducted code reviews.'
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2020-05',
        gpa: '3.8'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'],
    certifications: [
      {
        id: '1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023-06'
      }
    ]
  });

  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTemplate = RESUME_TEMPLATES.find(t => t.id === selectedTemplate) || RESUME_TEMPLATES[0];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64 for storage and display
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profileImage: base64String
          }
        }));
        setUploadingImage(false);
      };
      reader.onerror = () => {
        alert('Error reading image file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
      setUploadingImage(false);
    }
  };

  const removeProfileImage = () => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        profileImage: ''
      }
    }));
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addCertification = () => {
    const newCertification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const resumeHTML = renderResumeTemplate(resumeData, currentTemplate);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.personalInfo.fullName} - Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
            @media print {
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
              .resume-container { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          ${resumeHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success('Resume exported!', 'Your resume is ready for download');
  };

  const renderResumeTemplate = (data: ResumeData, template: TemplateStyle): string => {
    const { personalInfo, objective, experience, education, skills, certifications } = data;
    
    if (template.layout === 'sidebar') {
      return `
        <div class="resume-container" style="width: 210mm; height: 297mm; margin: 0 auto; display: flex; font-family: 'Inter', sans-serif; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Sidebar -->
          <div style="width: 35%; background: ${template.primaryColor}; color: white; padding: 40px 30px; display: flex; flex-direction: column;">
            <!-- Profile Photo -->
            <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.2); overflow: hidden;">
              ${personalInfo.profileImage ? `
                <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-cover;" />
              ` : `
                <svg width="60" height="60" fill="rgba(255,255,255,0.7)" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              `}
            </div>
            
            <!-- Contact Info -->
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: ${template.accentColor};">CONTACT</h3>
              <div style="space-y: 12px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
                  <span style="margin-right: 10px;">📧</span>
                  <span>${personalInfo.email}</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
                  <span style="margin-right: 10px;">📱</span>
                  <span>${personalInfo.phone}</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
                  <span style="margin-right: 10px;">📍</span>
                  <span>${personalInfo.location}</span>
                </div>
                ${personalInfo.website ? `
                <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
                  <span style="margin-right: 10px;">🌐</span>
                  <span>${personalInfo.website}</span>
                </div>
                ` : ''}
                ${personalInfo.linkedin ? `
                <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
                  <span style="margin-right: 10px;">💼</span>
                  <span>${personalInfo.linkedin}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Skills -->
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: ${template.accentColor};">SKILLS</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${skills.map(skill => `
                  <span style="background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${skill}</span>
                `).join('')}
              </div>
            </div>

            <!-- Languages -->
            <div>
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: ${template.accentColor};">LANGUAGES</h3>
              <div style="space-y: 8px;">
                <div style="margin-bottom: 8px;">
                  <div style="font-weight: 500; margin-bottom: 4px;">English</div>
                  <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px;">
                    <div style="background: ${template.accentColor}; height: 100%; width: 100%; border-radius: 3px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div style="flex: 1; padding: 40px; background: white;">
            <!-- Header -->
            <div style="margin-bottom: 40px; border-bottom: 2px solid ${template.accentColor}; padding-bottom: 20px;">
              <h1 style="font-size: 36px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 8px;">${personalInfo.fullName}</h1>
              <h2 style="font-size: 20px; color: ${template.accentColor}; font-weight: 500;">Professional Title</h2>
            </div>

            <!-- Objective -->
            <div style="margin-bottom: 35px;">
              <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🎯</span>
                PROFESSIONAL SUMMARY
              </h3>
              <p style="line-height: 1.6; color: ${template.secondaryColor}; font-size: 14px;">${objective}</p>
            </div>

            <!-- Experience -->
            <div style="margin-bottom: 35px;">
              <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 20px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">💼</span>
                WORK EXPERIENCE
              </h3>
              ${experience.map(exp => `
                <div style="margin-bottom: 25px; position: relative; padding-left: 20px;">
                  <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background: ${template.accentColor}; border-radius: 50%;"></div>
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                      <h4 style="font-size: 16px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 4px;">${exp.position}</h4>
                      <div style="font-size: 14px; color: ${template.accentColor}; font-weight: 500;">${exp.company}</div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: ${template.secondaryColor};">
                      <div>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                    </div>
                  </div>
                  <p style="line-height: 1.5; color: ${template.secondaryColor}; font-size: 13px;">${exp.description}</p>
                </div>
              `).join('')}
            </div>

            <!-- Education -->
            <div style="margin-bottom: 35px;">
              <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 20px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🎓</span>
                EDUCATION
              </h3>
              ${education.map(edu => `
                <div style="margin-bottom: 20px; position: relative; padding-left: 20px;">
                  <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background: ${template.accentColor}; border-radius: 50%;"></div>
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h4 style="font-size: 15px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 4px;">${edu.degree} in ${edu.field}</h4>
                      <div style="font-size: 14px; color: ${template.accentColor};">${edu.institution}</div>
                      ${edu.gpa ? `<div style="font-size: 12px; color: ${template.secondaryColor}; margin-top: 4px;">GPA: ${edu.gpa}</div>` : ''}
                    </div>
                    <div style="font-size: 12px; color: ${template.secondaryColor};">${edu.graduationDate}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Certifications -->
            ${certifications.length > 0 ? `
            <div>
              <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 20px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🏆</span>
                CERTIFICATIONS
              </h3>
              ${certifications.map(cert => `
                <div style="margin-bottom: 15px; position: relative; padding-left: 20px;">
                  <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background: ${template.accentColor}; border-radius: 50%;"></div>
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h4 style="font-size: 14px; font-weight: 600; color: ${template.primaryColor};">${cert.name}</h4>
                      <div style="font-size: 13px; color: ${template.accentColor};">${cert.issuer}</div>
                    </div>
                    <div style="font-size: 12px; color: ${template.secondaryColor};">${cert.date}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Modern Layout
    if (template.layout === 'modern') {
      return `
        <div class="resume-container" style="width: 210mm; height: 297mm; margin: 0 auto; font-family: 'Inter', sans-serif; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
          <!-- Header with Geometric Design -->
          <div style="background: linear-gradient(135deg, ${template.primaryColor} 0%, ${template.accentColor} 100%); color: white; padding: 50px 40px; position: relative;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            
            <div style="position: relative; z-index: 2;">
              <h1 style="font-size: 42px; font-weight: 800; margin-bottom: 10px; letter-spacing: -1px;">${personalInfo.fullName}</h1>
              <h2 style="font-size: 22px; font-weight: 400; opacity: 0.9; margin-bottom: 25px;">Professional Title</h2>
              
              <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 14px; opacity: 0.9;">
                <div style="display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📧</span>
                  ${personalInfo.email}
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📱</span>
                  ${personalInfo.phone}
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📍</span>
                  ${personalInfo.location}
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 40px;">
            <!-- Objective -->
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 20px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 15px; position: relative; padding-left: 25px;">
                <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.accentColor}; border-radius: 2px;"></span>
                PROFESSIONAL SUMMARY
              </h3>
              <p style="line-height: 1.7; color: ${template.secondaryColor}; font-size: 15px;">${objective}</p>
            </div>

            <!-- Two Column Layout -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <!-- Left Column -->
              <div>
                <!-- Experience -->
                <div style="margin-bottom: 40px;">
                  <h3 style="font-size: 20px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 25px; position: relative; padding-left: 25px;">
                    <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.accentColor}; border-radius: 2px;"></span>
                    EXPERIENCE
                  </h3>
                  ${experience.map(exp => `
                    <div style="margin-bottom: 30px; position: relative;">
                      <div style="margin-bottom: 8px;">
                        <h4 style="font-size: 16px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 4px;">${exp.position}</h4>
                        <div style="font-size: 14px; color: ${template.accentColor}; font-weight: 500; margin-bottom: 4px;">${exp.company}</div>
                        <div style="font-size: 12px; color: ${template.secondaryColor};">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                      </div>
                      <p style="line-height: 1.6; color: ${template.secondaryColor}; font-size: 13px;">${exp.description}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Right Column -->
              <div>
                <!-- Education -->
                <div style="margin-bottom: 40px;">
                  <h3 style="font-size: 20px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 25px; position: relative; padding-left: 25px;">
                    <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.accentColor}; border-radius: 2px;"></span>
                    EDUCATION
                  </h3>
                  ${education.map(edu => `
                    <div style="margin-bottom: 25px;">
                      <h4 style="font-size: 15px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 4px;">${edu.degree}</h4>
                      <div style="font-size: 14px; color: ${template.accentColor}; margin-bottom: 4px;">${edu.institution}</div>
                      <div style="font-size: 12px; color: ${template.secondaryColor};">${edu.graduationDate}</div>
                    </div>
                  `).join('')}
                </div>

                <!-- Skills -->
                <div style="margin-bottom: 40px;">
                  <h3 style="font-size: 20px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 25px; position: relative; padding-left: 25px;">
                    <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.accentColor}; border-radius: 2px;"></span>
                    CORE SKILLS
                  </h3>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${skills.map(skill => `
                      <span style="background: ${template.accentColor}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: 500;">${skill}</span>
                    `).join('')}
                  </div>
                </div>

                <!-- Certifications -->
                ${certifications.length > 0 ? `
                <div>
                  <h3 style="font-size: 20px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 25px; position: relative; padding-left: 25px;">
                    <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.accentColor}; border-radius: 2px;"></span>
                    CERTIFICATIONS
                  </h3>
                  ${certifications.map(cert => `
                    <div style="margin-bottom: 20px;">
                      <h4 style="font-size: 14px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 4px;">${cert.name}</h4>
                      <div style="font-size: 13px; color: ${template.accentColor}; margin-bottom: 2px;">${cert.issuer}</div>
                      <div style="font-size: 12px; color: ${template.secondaryColor};">${cert.date}</div>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Traditional Layout
    return `
      <div class="resume-container" style="width: 210mm; height: 297mm; margin: 0 auto; font-family: 'Inter', sans-serif; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${template.accentColor}; padding-bottom: 25px;">
          <h1 style="font-size: 36px; font-weight: 700; color: ${template.primaryColor}; margin-bottom: 8px;">${personalInfo.fullName}</h1>
          <h2 style="font-size: 18px; color: ${template.accentColor}; margin-bottom: 15px;">Professional Title</h2>
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; font-size: 14px; color: ${template.secondaryColor};">
            <span>${personalInfo.email}</span>
            <span>${personalInfo.phone}</span>
            <span>${personalInfo.location}</span>
          </div>
        </div>

        <!-- Objective -->
        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h3>
          <p style="line-height: 1.6; color: ${template.secondaryColor}; font-size: 14px;">${objective}</p>
        </div>

        <!-- Experience -->
        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Work Experience</h3>
          ${experience.map(exp => `
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                  <h4 style="font-size: 16px; font-weight: 600; color: ${template.primaryColor};">${exp.position}</h4>
                  <div style="font-size: 14px; color: ${template.accentColor}; font-weight: 500;">${exp.company}</div>
                </div>
                <div style="font-size: 12px; color: ${template.secondaryColor}; text-align: right;">
                  ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
              <p style="line-height: 1.5; color: ${template.secondaryColor}; font-size: 13px;">${exp.description}</p>
            </div>
          `).join('')}
        </div>

        <!-- Two Column Layout for Education and Skills -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <!-- Education -->
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Education</h3>
            ${education.map(edu => `
              <div style="margin-bottom: 20px;">
                <h4 style="font-size: 15px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 4px;">${edu.degree}</h4>
                <div style="font-size: 14px; color: ${template.accentColor}; margin-bottom: 4px;">${edu.institution}</div>
                <div style="font-size: 12px; color: ${template.secondaryColor};">${edu.graduationDate}</div>
              </div>
            `).join('')}
          </div>

          <!-- Skills -->
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Skills</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${skills.map(skill => `
                <span style="background: ${template.accentColor}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: 500;">${skill}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'objective', name: 'Summary', icon: FileText },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Star },
    { id: 'certifications', name: 'Certifications', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Resume Builder</h1>
            <p className="text-slate-600 dark:text-slate-400">Create professional resumes with customizable templates</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
            </Button>
            <Button onClick={exportToPDF} className="flex items-center space-x-2">
              <Download size={16} />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Template Selection */}
            <Card padding="lg">
              <div className="flex items-center space-x-2 mb-6">
                <Palette size={20} className="text-primary-500" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Choose Template</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {RESUME_TEMPLATES.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all duration-200",
                      selectedTemplate === template.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                    )}
                  >
                    <div 
                      className="w-full h-24 rounded-lg mb-3 relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.accentColor} 100%)` 
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <FileText size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{template.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{template.description}</div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Section Navigation */}
            <Card padding="md">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveSection(section.id)}
                      className="flex items-center space-x-2"
                    >
                      <Icon size={16} />
                      <span>{section.name}</span>
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Form Sections */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Personal Information */}
                {activeSection === 'personal' && (
                  <Card padding="lg">
                    <div className="flex items-center space-x-2 mb-6">
                      <User size={20} className="text-primary-500" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Personal Information</h3>
                    </div>
                    
                    {/* Profile Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Profile Image
                      </label>
                      
                      <div className="flex items-center space-x-4">
                        {/* Image Preview */}
                        <div className="relative">
                          {resumeData.personalInfo.profileImage ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                              <img
                                src={resumeData.personalInfo.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={removeProfileImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                              <Camera size={24} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Upload Controls */}
                        <div className="flex-1 space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          
                          <Button
                            onClick={triggerImageUpload}
                            variant="outline"
                            disabled={uploadingImage}
                            className="w-full"
                          >
                            {uploadingImage ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={16} className="mr-2" />
                                {resumeData.personalInfo.profileImage ? 'Change Image' : 'Upload Image'}
                              </>
                            )}
                          </Button>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPG, PNG up to 5MB. Square images work best.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                        }))}
                        placeholder="John Doe"
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        placeholder="john.doe@email.com"
                      />
                      <Input
                        label="Phone Number"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        placeholder="+1 (555) 123-4567"
                      />
                      <Input
                        label="Location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, location: e.target.value }
                        }))}
                        placeholder="New York, NY"
                      />
                      <Input
                        label="Website (Optional)"
                        value={resumeData.personalInfo.website || ''}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value }
                        }))}
                        placeholder="www.johndoe.com"
                      />
                      <Input
                        label="LinkedIn (Optional)"
                        value={resumeData.personalInfo.linkedin || ''}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                        }))}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                  </Card>
                )}

                {/* Professional Summary */}
                {activeSection === 'objective' && (
                  <Card padding="lg">
                    <div className="flex items-center space-x-2 mb-6">
                      <FileText size={20} className="text-primary-500" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Professional Summary</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Summary Statement
                        </label>
                        <textarea
                          value={resumeData.objective}
                          onChange={(e) => setResumeData(prev => ({ ...prev, objective: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 transition-all duration-200"
                          rows={4}
                          placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..."
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Writing Tips</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Keep it concise (2-3 sentences)</li>
                          <li>• Highlight your most relevant skills</li>
                          <li>• Mention years of experience</li>
                          <li>• Include your career goals</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Work Experience */}
                {activeSection === 'experience' && (
                  <Card padding="lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <Briefcase size={20} className="text-primary-500" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Work Experience</h3>
                      </div>
                      <Button onClick={addExperience} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Experience
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.experience.map((exp, index) => (
                        <div key={exp.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Experience #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input
                              label="Job Title"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                              placeholder="Senior Developer"
                            />
                            <Input
                              label="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              placeholder="Tech Solutions Inc."
                            />
                            <Input
                              label="Start Date"
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            />
                            <div className="space-y-2">
                              <Input
                                label="End Date"
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                              />
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Currently working here</span>
                              </label>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Job Description
                            </label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                              rows={3}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Education */}
                {activeSection === 'education' && (
                  <Card padding="lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <GraduationCap size={20} className="text-primary-500" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Education</h3>
                      </div>
                      <Button onClick={addEducation} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Education
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.education.map((edu, index) => (
                        <div key={edu.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Education #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              placeholder="University of Technology"
                            />
                            <Input
                              label="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              placeholder="Bachelor of Science"
                            />
                            <Input
                              label="Field of Study"
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                              placeholder="Computer Science"
                            />
                            <Input
                              label="Graduation Date"
                              type="month"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                            />
                            <Input
                              label="GPA (Optional)"
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              placeholder="3.8"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Skills */}
                {activeSection === 'skills' && (
                  <Card padding="lg">
                    <div className="flex items-center space-x-2 mb-6">
                      <Star size={20} className="text-primary-500" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Add Skills
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter a skill and press Enter"
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addSkill(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Current Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">💡 Skill Tips</h4>
                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• Include both technical and soft skills</li>
                          <li>• List skills relevant to the job you're applying for</li>
                          <li>• Use industry-standard terminology</li>
                          <li>• Include proficiency levels when relevant</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Certifications */}
                {activeSection === 'certifications' && (
                  <Card padding="lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <Award size={20} className="text-primary-500" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Certifications</h3>
                      </div>
                      <Button onClick={addCertification} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Certification
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.certifications.map((cert, index) => (
                        <div key={cert.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Certification #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(cert.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              label="Certification Name"
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                              placeholder="AWS Certified Solutions Architect"
                            />
                            <Input
                              label="Issuing Organization"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                              placeholder="Amazon Web Services"
                            />
                            <Input
                              label="Date Obtained"
                              type="month"
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <Card padding="md" className="bg-slate-100 dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Eye size={16} className="text-primary-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Preview</h3>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {currentTemplate.name} Template
                    </div>
                  </div>
                  
                  <div 
                    ref={previewRef}
                    className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200"
                    style={{ 
                      transform: 'scale(0.4)', 
                      transformOrigin: 'top left',
                      width: '210mm',
                      height: '297mm'
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ 
                      __html: renderResumeTemplate(resumeData, currentTemplate) 
                    }} />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};