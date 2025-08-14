import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, X, Move, RotateCcw, Eye, Palette, Save, FileText, User, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ResumeData } from '../../types';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type TemplateType = 'modern-minimalist' | 'classic-professional' | 'creative-freelancer' | 'tech-developer' | 'elegant-modern';

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  preview: string;
  color: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines with lots of whitespace',
    preview: 'Clean, minimal design perfect for any industry',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Traditional layout for corporate roles',
    preview: 'Time-tested format that works everywhere',
    color: 'from-slate-500 to-slate-600'
  },
  {
    id: 'creative-freelancer',
    name: 'Creative Freelancer',
    description: 'Perfect for designers and creators',
    preview: 'Showcase your creativity and projects',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'tech-developer',
    name: 'Tech Developer',
    description: 'Optimized for developers and engineers',
    preview: 'Highlight your technical skills and projects',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'elegant-modern',
    name: 'Elegant Modern',
    description: 'Sophisticated design for consultants',
    preview: 'Professional elegance with subtle styling',
    color: 'from-amber-500 to-amber-600'
  }
];

export const ResumeBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern-minimalist');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      website: 'www.johndoe.com',
      linkedin: 'linkedin.com/in/johndoe',
    },
    objective: 'Experienced professional with a passion for creating innovative solutions and driving business growth through strategic thinking and collaborative leadership.',
    experience: [
      {
        id: '1',
        company: 'Tech Solutions Inc.',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: '2024-01',
        current: false,
        description: 'Led development of scalable web applications serving 100K+ users. Implemented microservices architecture reducing system downtime by 40%.'
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2019-05',
        gpa: '3.8'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    certifications: [
      {
        id: '1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023-06'
      }
    ]
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [accentColor, setAccentColor] = useState('#3b82f6');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    const newExp = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEdu = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: '',
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id),
    });
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skill.trim()],
      });
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skill),
    });
  };

  const addCertification = () => {
    const newCert = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
    };
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, newCert],
    });
  };

  const updateCertification = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  const removeCertification = (id: string) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter(cert => cert.id !== id),
    });
  };

  const generateResumeHTML = (template: TemplateType) => {
    const baseStyles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; line-height: 1.5; color: #1f2937; }
      .resume-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; }
      .section-title { font-weight: 600; margin-bottom: 12px; }
      .skill-bar { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; margin-top: 4px; }
      .skill-fill { height: 100%; background: ${accentColor}; border-radius: 3px; }
      @media print { body { margin: 0; } .resume-container { box-shadow: none; margin: 0; } }
    `;

    switch (template) {
      case 'modern-minimalist':
        return `
          <!DOCTYPE html>
          <html><head><title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            ${baseStyles}
            .header { text-align: center; padding: 40px 40px 30px; border-bottom: 2px solid ${accentColor}; }
            .name { font-size: 32px; font-weight: 700; color: ${accentColor}; margin-bottom: 8px; }
            .title { font-size: 18px; color: #6b7280; margin-bottom: 20px; }
            .contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
            .contact-item { font-size: 13px; color: #4b5563; }
            .content { padding: 40px; }
            .section { margin-bottom: 35px; }
            .section-title { font-size: 18px; color: ${accentColor}; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            .experience-item, .education-item { margin-bottom: 20px; }
            .job-title { font-weight: 600; font-size: 16px; }
            .company { color: ${accentColor}; font-weight: 500; }
            .date { color: #6b7280; font-size: 13px; margin-top: 2px; }
            .description { margin-top: 8px; }
            .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .skill-item { display: flex; justify-content: space-between; align-items: center; }
          </style></head>
          <body>
            <div class="resume-container">
              <div class="header">
                <div class="name">${resumeData.personalInfo.fullName}</div>
                <div class="title">Professional</div>
                <div class="contact">
                  <span class="contact-item">${resumeData.personalInfo.email}</span>
                  <span class="contact-item">${resumeData.personalInfo.phone}</span>
                  <span class="contact-item">${resumeData.personalInfo.location}</span>
                  ${resumeData.personalInfo.website ? `<span class="contact-item">${resumeData.personalInfo.website}</span>` : ''}
                </div>
              </div>
              <div class="content">
                <div class="section">
                  <div class="section-title">OBJECTIVE</div>
                  <p>${resumeData.objective}</p>
                </div>
                <div class="section">
                  <div class="section-title">SKILLS</div>
                  <div class="skills-grid">
                    ${resumeData.skills.map(skill => `
                      <div class="skill-item">
                        <span>${skill}</span>
                        <div style="width: 60px;">
                          <div class="skill-bar">
                            <div class="skill-fill" style="width: 85%;"></div>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="section">
                  <div class="section-title">EXPERIENCE</div>
                  ${resumeData.experience.map(exp => `
                    <div class="experience-item">
                      <div class="job-title">${exp.position}</div>
                      <div class="company">${exp.company}</div>
                      <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                      <div class="description">${exp.description}</div>
                    </div>
                  `).join('')}
                </div>
                <div class="section">
                  <div class="section-title">EDUCATION</div>
                  ${resumeData.education.map(edu => `
                    <div class="education-item">
                      <div class="job-title">${edu.degree} in ${edu.field}</div>
                      <div class="company">${edu.institution}</div>
                      <div class="date">${edu.graduationDate}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                    </div>
                  `).join('')}
                </div>
                ${resumeData.certifications.length > 0 ? `
                <div class="section">
                  <div class="section-title">CERTIFICATIONS</div>
                  ${resumeData.certifications.map(cert => `
                    <div class="education-item">
                      <div class="job-title">${cert.name}</div>
                      <div class="company">${cert.issuer}</div>
                      <div class="date">${cert.date}</div>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
              </div>
            </div>
          </body></html>
        `;

      case 'classic-professional':
        return `
          <!DOCTYPE html>
          <html><head><title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            ${baseStyles}
            .header { padding: 30px 40px; background: #f8fafc; }
            .name { font-size: 28px; font-weight: 700; margin-bottom: 5px; }
            .contact { margin-top: 10px; }
            .contact-item { display: inline-block; margin-right: 20px; font-size: 13px; color: #4b5563; }
            .content { padding: 30px 40px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; background: #f1f5f9; padding: 8px 12px; margin-bottom: 15px; }
            .experience-item { margin-bottom: 18px; }
            .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
            .job-title { font-weight: 600; }
            .company { color: #4b5563; }
            .date { color: #6b7280; font-size: 13px; }
            .description ul { margin-left: 20px; margin-top: 5px; }
            .description li { margin-bottom: 3px; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .skill-tag { background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          </style></head>
          <body>
            <div class="resume-container">
              <div class="header">
                <div class="name">${resumeData.personalInfo.fullName}</div>
                <div class="contact">
                  <span class="contact-item">${resumeData.personalInfo.email}</span>
                  <span class="contact-item">${resumeData.personalInfo.phone}</span>
                  <span class="contact-item">${resumeData.personalInfo.location}</span>
                </div>
              </div>
              <div class="content">
                <div class="section">
                  <div class="section-title">PROFESSIONAL SUMMARY</div>
                  <p>${resumeData.objective}</p>
                </div>
                <div class="section">
                  <div class="section-title">WORK EXPERIENCE</div>
                  ${resumeData.experience.map(exp => `
                    <div class="experience-item">
                      <div class="job-header">
                        <div>
                          <div class="job-title">${exp.position}</div>
                          <div class="company">${exp.company}</div>
                        </div>
                        <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                      </div>
                      <div class="description">
                        <ul><li>${exp.description}</li></ul>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <div class="section">
                  <div class="section-title">EDUCATION</div>
                  ${resumeData.education.map(edu => `
                    <div class="experience-item">
                      <div class="job-header">
                        <div>
                          <div class="job-title">${edu.degree} in ${edu.field}</div>
                          <div class="company">${edu.institution}</div>
                        </div>
                        <div class="date">${edu.graduationDate}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <div class="section">
                  <div class="section-title">SKILLS</div>
                  <div class="skills-list">
                    ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          </body></html>
        `;

      case 'creative-freelancer':
        return `
          <!DOCTYPE html>
          <html><head><title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            ${baseStyles}
            .resume-container { display: flex; }
            .sidebar { width: 35%; background: linear-gradient(135deg, ${accentColor}, #8b5cf6); color: white; padding: 40px 30px; }
            .main-content { width: 65%; padding: 40px 35px; }
            .profile-section { text-align: center; margin-bottom: 30px; }
            .profile-photo { width: 120px; height: 120px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); margin: 0 auto 20px; object-fit: cover; background: rgba(255,255,255,0.1); }
            .name { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
            .title { font-size: 16px; opacity: 0.9; margin-bottom: 20px; }
            .sidebar-section { margin-bottom: 25px; }
            .sidebar-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; opacity: 0.9; letter-spacing: 1px; }
            .contact-item { display: block; margin-bottom: 8px; font-size: 13px; opacity: 0.8; }
            .skill-item { margin-bottom: 10px; }
            .skill-name { font-size: 13px; margin-bottom: 4px; }
            .main-section { margin-bottom: 30px; }
            .main-title { font-size: 18px; font-weight: 600; color: ${accentColor}; margin-bottom: 15px; position: relative; }
            .main-title::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 30px; height: 2px; background: ${accentColor}; }
            .experience-item { margin-bottom: 20px; }
            .job-title { font-weight: 600; font-size: 16px; color: #1f2937; }
            .company { color: ${accentColor}; font-weight: 500; margin-top: 2px; }
            .date { color: #6b7280; font-size: 13px; margin-top: 2px; }
            .description { margin-top: 8px; color: #4b5563; }
          </style></head>
          <body>
            <div class="resume-container">
              <div class="sidebar">
                <div class="profile-section">
                  ${croppedPhoto ? `<img src="${croppedPhoto}" alt="Profile" class="profile-photo">` : '<div class="profile-photo"></div>'}
                  <div class="name">${resumeData.personalInfo.fullName}</div>
                  <div class="title">Creative Professional</div>
                </div>
                <div class="sidebar-section">
                  <div class="sidebar-title">CONTACT</div>
                  <div class="contact-item">${resumeData.personalInfo.email}</div>
                  <div class="contact-item">${resumeData.personalInfo.phone}</div>
                  <div class="contact-item">${resumeData.personalInfo.location}</div>
                  ${resumeData.personalInfo.website ? `<div class="contact-item">${resumeData.personalInfo.website}</div>` : ''}
                </div>
                <div class="sidebar-section">
                  <div class="sidebar-title">SKILLS</div>
                  ${resumeData.skills.map(skill => `
                    <div class="skill-item">
                      <div class="skill-name">${skill}</div>
                      <div class="skill-bar">
                        <div class="skill-fill" style="width: 85%; background: rgba(255,255,255,0.8);"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="main-content">
                <div class="main-section">
                  <div class="main-title">PROFILE</div>
                  <p>${resumeData.objective}</p>
                </div>
                <div class="main-section">
                  <div class="main-title">EXPERIENCE</div>
                  ${resumeData.experience.map(exp => `
                    <div class="experience-item">
                      <div class="job-title">${exp.position}</div>
                      <div class="company">${exp.company}</div>
                      <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                      <div class="description">${exp.description}</div>
                    </div>
                  `).join('')}
                </div>
                <div class="main-section">
                  <div class="main-title">EDUCATION</div>
                  ${resumeData.education.map(edu => `
                    <div class="experience-item">
                      <div class="job-title">${edu.degree} in ${edu.field}</div>
                      <div class="company">${edu.institution}</div>
                      <div class="date">${edu.graduationDate}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </body></html>
        `;

      case 'tech-developer':
        return `
          <!DOCTYPE html>
          <html><head><title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            ${baseStyles}
            body { font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace; }
            .header { background: #0f172a; color: white; padding: 30px 40px; }
            .name { font-size: 28px; font-weight: 700; color: ${accentColor}; margin-bottom: 5px; }
            .title { font-size: 16px; color: #94a3b8; margin-bottom: 15px; }
            .contact { display: flex; gap: 20px; flex-wrap: wrap; }
            .contact-item { font-size: 13px; color: #cbd5e1; }
            .content { padding: 30px 40px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; color: ${accentColor}; margin-bottom: 15px; font-family: monospace; }
            .section-title::before { content: '// '; color: #6b7280; }
            .tech-skills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .skill-category { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid ${accentColor}; }
            .skill-category-title { font-weight: 600; font-size: 14px; margin-bottom: 8px; color: ${accentColor}; }
            .skill-list { font-size: 12px; color: #4b5563; }
            .experience-item { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${accentColor}; }
            .job-title { font-weight: 600; font-size: 16px; color: #1f2937; }
            .company { color: ${accentColor}; font-weight: 500; }
            .date { color: #6b7280; font-size: 13px; margin-top: 2px; }
            .description { margin-top: 10px; font-family: sans-serif; }
            .code-block { background: #1e293b; color: #e2e8f0; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 8px; }
          </style></head>
          <body>
            <div class="resume-container">
              <div class="header">
                <div class="name">${resumeData.personalInfo.fullName}</div>
                <div class="title">Software Engineer</div>
                <div class="contact">
                  <span class="contact-item">${resumeData.personalInfo.email}</span>
                  <span class="contact-item">${resumeData.personalInfo.phone}</span>
                  <span class="contact-item">${resumeData.personalInfo.location}</span>
                  ${resumeData.personalInfo.website ? `<span class="contact-item">${resumeData.personalInfo.website}</span>` : ''}
                </div>
              </div>
              <div class="content">
                <div class="section">
                  <div class="section-title">OBJECTIVE</div>
                  <p>${resumeData.objective}</p>
                </div>
                <div class="section">
                  <div class="section-title">TECHNICAL SKILLS</div>
                  <div class="tech-skills">
                    <div class="skill-category">
                      <div class="skill-category-title">Languages</div>
                      <div class="skill-list">${resumeData.skills.filter(s => ['JavaScript', 'Python', 'Java', 'TypeScript', 'Go', 'Rust'].includes(s)).join(', ')}</div>
                    </div>
                    <div class="skill-category">
                      <div class="skill-category-title">Frameworks</div>
                      <div class="skill-list">${resumeData.skills.filter(s => ['React', 'Vue', 'Angular', 'Node.js', 'Django', 'Flask'].includes(s)).join(', ')}</div>
                    </div>
                    <div class="skill-category">
                      <div class="skill-category-title">Tools & Cloud</div>
                      <div class="skill-list">${resumeData.skills.filter(s => ['AWS', 'Docker', 'Kubernetes', 'Git', 'Jenkins'].includes(s)).join(', ')}</div>
                    </div>
                  </div>
                </div>
                <div class="section">
                  <div class="section-title">EXPERIENCE</div>
                  ${resumeData.experience.map(exp => `
                    <div class="experience-item">
                      <div class="job-title">${exp.position}</div>
                      <div class="company">${exp.company}</div>
                      <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                      <div class="description">${exp.description}</div>
                    </div>
                  `).join('')}
                </div>
                <div class="section">
                  <div class="section-title">EDUCATION</div>
                  ${resumeData.education.map(edu => `
                    <div class="experience-item">
                      <div class="job-title">${edu.degree} in ${edu.field}</div>
                      <div class="company">${edu.institution}</div>
                      <div class="date">${edu.graduationDate}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </body></html>
        `;

      case 'elegant-modern':
        return `
          <!DOCTYPE html>
          <html><head><title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            ${baseStyles}
            .resume-container { box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px; text-align: center; position: relative; }
            .header::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 3px; background: ${accentColor}; }
            .name { font-size: 32px; font-weight: 300; color: #1f2937; margin-bottom: 8px; letter-spacing: 1px; }
            .title { font-size: 18px; color: ${accentColor}; font-weight: 500; margin-bottom: 20px; }
            .contact { display: flex; justify-content: center; gap: 25px; flex-wrap: wrap; }
            .contact-item { font-size: 14px; color: #4b5563; }
            .content { padding: 40px; }
            .section { margin-bottom: 35px; }
            .section-title { font-size: 18px; font-weight: 300; color: #1f2937; margin-bottom: 20px; position: relative; padding-left: 20px; }
            .section-title::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${accentColor}; border-radius: 2px; }
            .experience-item { background: #fefefe; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
            .job-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
            .job-title { font-weight: 600; font-size: 16px; color: #1f2937; }
            .company { color: ${accentColor}; font-weight: 500; margin-top: 2px; }
            .date { color: #6b7280; font-size: 13px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; }
            .description { color: #4b5563; line-height: 1.6; }
            .skills-elegant { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-elegant { background: linear-gradient(135deg, ${accentColor}, #8b5cf6); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; }
          </style></head>
          <body>
            <div class="resume-container">
              <div class="header">
                <div class="name">${resumeData.personalInfo.fullName}</div>
                <div class="title">Professional Consultant</div>
                <div class="contact">
                  <span class="contact-item">${resumeData.personalInfo.email}</span>
                  <span class="contact-item">${resumeData.personalInfo.phone}</span>
                  <span class="contact-item">${resumeData.personalInfo.location}</span>
                  ${resumeData.personalInfo.website ? `<span class="contact-item">${resumeData.personalInfo.website}</span>` : ''}
                </div>
              </div>
              <div class="content">
                <div class="section">
                  <div class="section-title">Professional Summary</div>
                  <p style="font-size: 15px; line-height: 1.7; color: #4b5563;">${resumeData.objective}</p>
                </div>
                <div class="section">
                  <div class="section-title">Core Competencies</div>
                  <div class="skills-elegant">
                    ${resumeData.skills.map(skill => `<span class="skill-elegant">${skill}</span>`).join('')}
                  </div>
                </div>
                <div class="section">
                  <div class="section-title">Professional Experience</div>
                  ${resumeData.experience.map(exp => `
                    <div class="experience-item">
                      <div class="job-header">
                        <div>
                          <div class="job-title">${exp.position}</div>
                          <div class="company">${exp.company}</div>
                        </div>
                        <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                      </div>
                      <div class="description">${exp.description}</div>
                    </div>
                  `).join('')}
                </div>
                <div class="section">
                  <div class="section-title">Education</div>
                  ${resumeData.education.map(edu => `
                    <div class="experience-item">
                      <div class="job-header">
                        <div>
                          <div class="job-title">${edu.degree} in ${edu.field}</div>
                          <div class="company">${edu.institution}</div>
                        </div>
                        <div class="date">${edu.graduationDate}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                ${resumeData.certifications.length > 0 ? `
                <div class="section">
                  <div class="section-title">Professional Certifications</div>
                  ${resumeData.certifications.map(cert => `
                    <div class="experience-item">
                      <div class="job-header">
                        <div>
                          <div class="job-title">${cert.name}</div>
                          <div class="company">${cert.issuer}</div>
                        </div>
                        <div class="date">${cert.date}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
              </div>
            </div>
          </body></html>
        `;

      default:
        return generateResumeHTML('modern-minimalist');
    }
  };

  const exportResume = () => {
    const resumeHTML = generateResumeHTML(selectedTemplate);
    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume_${selectedTemplate}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateAISuggestion = () => {
    const suggestions = [
      "Results-driven professional with expertise in strategic planning and team leadership, committed to delivering innovative solutions that drive business growth and operational excellence.",
      "Dynamic and detail-oriented specialist with a proven track record of managing complex projects and fostering collaborative relationships to achieve organizational objectives.",
      "Experienced professional passionate about leveraging technology and data-driven insights to optimize processes and create value for stakeholders across diverse industries.",
      "Innovative problem-solver with strong analytical skills and a commitment to continuous learning, dedicated to contributing to organizational success through strategic thinking and execution.",
      "Accomplished professional with extensive experience in cross-functional collaboration and process improvement, focused on delivering high-quality results in fast-paced environments."
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setResumeData({ ...resumeData, objective: randomSuggestion });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Resume Builder</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Create professional resumes with our enhanced templates</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => console.log('Save draft')}>
            <Save size={16} className="mr-2" />
            Save Draft
          </Button>
          <Button onClick={exportResume}>
            <Download size={16} className="mr-2" />
            Download Resume
          </Button>
        </div>
      </div>

      {/* Template Selection */}
      <Card padding="lg">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Eye size={20} className="mr-2 text-primary-500" />
          Choose Your Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className={`h-32 rounded-t-xl bg-gradient-to-br ${template.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <FileText size={32} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{template.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{template.description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">{template.preview}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Customization */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Palette size={18} className="mr-2 text-primary-500" />
              Customization
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Accent Color:</label>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Profile Photo Upload */}
          {(selectedTemplate === 'creative-freelancer') && (
            <Card padding="md">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Profile Photo</h3>
              <div className="flex items-center space-x-4">
                {croppedPhoto ? (
                  <div className="relative">
                    <img
                      src={croppedPhoto}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                    />
                    <button
                      onClick={() => {
                        setCroppedPhoto(null);
                        setProfilePhoto(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
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
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Personal Information */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <User size={18} className="mr-2 text-primary-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={resumeData.personalInfo.fullName}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                })}
              />
              <Input
                label="Email"
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                })}
              />
              <Input
                label="Phone"
                value={resumeData.personalInfo.phone}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                })}
              />
              <Input
                label="Location"
                value={resumeData.personalInfo.location}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                })}
              />
              <Input
                label="Website"
                value={resumeData.personalInfo.website || ''}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, website: e.target.value }
                })}
              />
              <Input
                label="LinkedIn"
                value={resumeData.personalInfo.linkedin || ''}
                onChange={(e) => setResumeData({
                  ...resumeData,
                  personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                })}
              />
            </div>
          </Card>

          {/* Professional Summary */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Professional Summary</h3>
              <Button variant="outline" size="sm" onClick={generateAISuggestion}>
                ✨ AI Suggest
              </Button>
            </div>
            <textarea
              value={resumeData.objective}
              onChange={(e) => setResumeData({ ...resumeData, objective: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              rows={4}
              placeholder="Write a compelling professional summary..."
            />
          </Card>

          {/* Skills */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Skills</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Add a skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </Card>

          {/* Experience */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <Briefcase size={18} className="mr-2 text-primary-500" />
                Work Experience
              </h3>
              <Button variant="outline" size="sm" onClick={addExperience}>
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Experience</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <Input
                      label="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    />
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                    <Input
                      label="Start Date"
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    />
                    <Input
                      label="End Date"
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Currently working here</span>
                    </label>
                  </div>
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <GraduationCap size={18} className="mr-2 text-primary-500" />
                Education
              </h3>
              <Button variant="outline" size="sm" onClick={addEducation}>
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Education</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    />
                    <Input
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    />
                    <Input
                      label="Field of Study"
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
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
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Certifications</h3>
              <Button variant="outline" size="sm" onClick={addCertification}>
                Add Certification
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Certification</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeCertification(cert.id)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Certification Name"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                    />
                    <Input
                      label="Issuing Organization"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
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
        </div>

        {/* Live Preview Section */}
        <div className="xl:sticky xl:top-6">
          <Card padding="sm" className="bg-white">
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Preview</h3>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
              <div 
                className="w-full h-full overflow-auto text-xs transform scale-[0.4] origin-top-left"
                style={{ width: '250%', height: '250%' }}
                dangerouslySetInnerHTML={{ __html: generateResumeHTML(selectedTemplate) }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && profilePhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Crop Photo</h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative inline-block">
              <img
                ref={imageRef}
                src={profilePhoto}
                alt="Crop preview"
                className="max-w-full max-h-96 object-contain"
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Size:
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={cropArea.width}
                    onChange={(e) => {
                      const size = parseInt(e.target.value);
                      setCropArea(prev => ({ ...prev, width: size, height: size }));
                    }}
                    className="ml-2"
                  />
                </label>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowCropModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setCroppedPhoto(profilePhoto);
                  setShowCropModal(false);
                }}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={cropCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};