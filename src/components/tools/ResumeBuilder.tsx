import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, Palette, User, Briefcase, GraduationCap, Award, Globe, Plus, Trash2, Sparkles, FileText, Code, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ResumeData } from '../../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type TemplateType = 'modern-minimalist' | 'classic-professional' | 'creative-freelancer' | 'tech-developer' | 'elegant-modern';

interface SkillItem {
  name: string;
  level: number;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

interface ExtendedResumeData extends ResumeData {
  projects: ProjectItem[];
  languages: Array<{ name: string; level: string }>;
  references: Array<{ name: string; position: string; company: string; email: string; phone: string }>;
  skillsWithLevels: SkillItem[];
  profileImage?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  summary?: string;
}

const TEMPLATES = [
  { id: 'modern-minimalist', name: 'Modern Minimalist', icon: FileText, description: 'Clean lines with lots of whitespace' },
  { id: 'classic-professional', name: 'Classic Professional', icon: Briefcase, description: 'Traditional corporate format' },
  { id: 'creative-freelancer', name: 'Creative Freelancer', icon: Palette, description: 'Perfect for designers and creators' },
  { id: 'tech-developer', name: 'Tech Developer', icon: Code, description: 'Highlight programming skills' },
  { id: 'elegant-modern', name: 'Elegant Modern', icon: Zap, description: 'Sophisticated with soft shadows' },
];

const AI_SUGGESTIONS = {
  objectives: [
    "Experienced freelancer with a passion for delivering high-quality solutions and exceeding client expectations.",
    "Creative professional seeking to leverage technical expertise and innovative thinking to drive project success.",
    "Results-driven specialist with proven ability to manage multiple projects while maintaining exceptional quality standards.",
    "Dedicated professional committed to continuous learning and delivering value through strategic problem-solving.",
  ],
  summaries: [
    "Versatile professional with extensive experience in project management and client relations. Proven track record of delivering complex projects on time and within budget.",
    "Creative problem-solver with strong technical skills and excellent communication abilities. Experienced in working with diverse teams and adapting to changing requirements.",
    "Detail-oriented professional with expertise in multiple domains. Known for innovative solutions and commitment to quality in every project undertaken.",
  ]
};

export const ResumeBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern-minimalist');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [resumeData, setResumeData] = useState<ExtendedResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    objective: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    skillsWithLevels: [],
    certifications: [],
    projects: [],
    languages: [],
    references: [],
    portfolioUrl: '',
    githubUrl: '',
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.6);

  // Auto-resize preview
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.preview-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const scale = Math.min(containerWidth / 794, 0.8); // A4 width is ~794px
        setPreviewScale(scale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
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
    const newEdu = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: '',
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: string, value: any) => {
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

  const addProject = () => {
    const newProject = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
      url: '',
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const addSkillWithLevel = () => {
    setResumeData(prev => ({
      ...prev,
      skillsWithLevels: [...prev.skillsWithLevels, { name: '', level: 3 }]
    }));
  };

  const updateSkillWithLevel = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      skillsWithLevels: prev.skillsWithLevels.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkillWithLevel = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skillsWithLevels: prev.skillsWithLevels.filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestion = (type: 'objective' | 'summary') => {
    const suggestions = type === 'objective' ? AI_SUGGESTIONS.objectives : AI_SUGGESTIONS.summaries;
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    setResumeData(prev => ({
      ...prev,
      [type]: randomSuggestion
    }));
  };

  const exportToPDF = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    
    try {
      // Create a temporary container with full size
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px'; // A4 width at 96 DPI
      tempContainer.style.minHeight = '1123px'; // A4 height at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '72px'; // 1 inch margins
      tempContainer.innerHTML = previewRef.current.innerHTML;
      
      document.body.appendChild(tempContainer);

      // Generate canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, 595, 842); // A4 size in points
      
      // Save PDF
      const fileName = resumeData.personalInfo.fullName 
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';
      
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTemplate = () => {
    const commonStyles = {
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1f2937',
      lineHeight: '1.6',
    };

    const sectionHeaderStyle = {
      color: accentColor,
      borderBottom: `2px solid ${accentColor}`,
      paddingBottom: '8px',
      marginBottom: '16px',
      fontSize: '18px',
      fontWeight: '600',
    };

    switch (selectedTemplate) {
      case 'modern-minimalist':
        return (
          <div style={{ ...commonStyles, padding: '40px', maxWidth: '794px', minHeight: '1123px', backgroundColor: 'white' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: `3px solid ${accentColor}`, paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0', color: accentColor }}>
                {resumeData.personalInfo.fullName || 'Your Name'}
              </h1>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '12px' }}>
                Professional Title
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
              </div>
            </div>

            {/* Objective */}
            {resumeData.objective && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={sectionHeaderStyle}>Objective</h2>
                <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.6' }}>{resumeData.objective}</p>
              </div>
            )}

            {/* Skills */}
            {resumeData.skillsWithLevels.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={sectionHeaderStyle}>Skills</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {resumeData.skillsWithLevels.map((skill, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                        <span>{skill.name}</span>
                        <span style={{ color: '#6b7280' }}>{skill.level}/5</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                        <div style={{ 
                          width: `${(skill.level / 5) * 100}%`, 
                          height: '100%', 
                          backgroundColor: accentColor, 
                          borderRadius: '3px' 
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={sectionHeaderStyle}>Experience</h2>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>{exp.position}</h3>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: accentColor, marginBottom: '8px', fontWeight: '500' }}>
                      {exp.company}
                    </div>
                    <p style={{ fontSize: '14px', margin: '0', lineHeight: '1.5' }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={sectionHeaderStyle}>Education</h2>
                {resumeData.education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                          {edu.degree} in {edu.field}
                        </h3>
                        <div style={{ fontSize: '14px', color: accentColor }}>{edu.institution}</div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{edu.graduationDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {resumeData.projects.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={sectionHeaderStyle}>Portfolio</h2>
                {resumeData.projects.map((project, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>{project.name}</h3>
                    <p style={{ fontSize: '14px', margin: '0 0 8px 0', lineHeight: '1.5' }}>{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Technologies: {project.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'classic-professional':
        return (
          <div style={{ ...commonStyles, padding: '40px', maxWidth: '794px', minHeight: '1123px', backgroundColor: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: '#1f2937' }}>
                {resumeData.personalInfo.fullName || 'Your Name'}
              </h1>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
                {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
                {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
                {resumeData.personalInfo.website && <div>{resumeData.personalInfo.website}</div>}
              </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ ...sectionHeaderStyle, backgroundColor: '#f9fafb', padding: '8px 0', margin: '0 0 12px 0' }}>
                  SUMMARY
                </h2>
                <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.6' }}>{resumeData.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {resumeData.experience.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ ...sectionHeaderStyle, backgroundColor: '#f9fafb', padding: '8px 0', margin: '0 0 12px 0' }}>
                  WORK EXPERIENCE
                </h2>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>{exp.position}</h3>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{exp.company}</div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <ul style={{ margin: '8px 0 0 20px', padding: '0', fontSize: '14px' }}>
                      {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{line.trim()}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ ...sectionHeaderStyle, backgroundColor: '#f9fafb', padding: '8px 0', margin: '0 0 12px 0' }}>
                  EDUCATION
                </h2>
                {resumeData.education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>
                          {edu.degree} in {edu.field}
                        </h3>
                        <div style={{ fontSize: '14px', color: '#374151' }}>{edu.institution}</div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{edu.graduationDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {resumeData.certifications.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ ...sectionHeaderStyle, backgroundColor: '#f9fafb', padding: '8px 0', margin: '0 0 12px 0' }}>
                  CERTIFICATIONS
                </h2>
                {resumeData.certifications.map((cert, index) => (
                  <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    <strong>{cert.name}</strong> - {cert.issuer} ({cert.date})
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'creative-freelancer':
        return (
          <div style={{ ...commonStyles, display: 'flex', maxWidth: '794px', minHeight: '1123px', backgroundColor: 'white' }}>
            {/* Left Sidebar */}
            <div style={{ 
              width: '280px', 
              backgroundColor: `${accentColor}15`, 
              padding: '32px 24px',
              borderRight: `3px solid ${accentColor}`
            }}>
              {/* Profile */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: accentColor,
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {resumeData.personalInfo.fullName ? resumeData.personalInfo.fullName.charAt(0) : 'U'}
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0', color: accentColor }}>
                  {resumeData.personalInfo.fullName || 'Your Name'}
                </h1>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Creative Professional</div>
              </div>

              {/* Contact */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: accentColor, marginBottom: '12px' }}>
                  CONTACT
                </h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                  {resumeData.personalInfo.email && <div style={{ marginBottom: '4px' }}>{resumeData.personalInfo.email}</div>}
                  {resumeData.personalInfo.phone && <div style={{ marginBottom: '4px' }}>{resumeData.personalInfo.phone}</div>}
                  {resumeData.personalInfo.location && <div style={{ marginBottom: '4px' }}>{resumeData.personalInfo.location}</div>}
                  {resumeData.personalInfo.website && <div style={{ marginBottom: '4px' }}>{resumeData.personalInfo.website}</div>}
                </div>
              </div>

              {/* Skills */}
              {resumeData.skillsWithLevels.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: accentColor, marginBottom: '12px' }}>
                    SKILLS
                  </h3>
                  {resumeData.skillsWithLevels.map((skill, index) => (
                    <div key={index} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{skill.name}</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(level => (
                          <div
                            key={level}
                            style={{
                              width: '20px',
                              height: '4px',
                              backgroundColor: level <= skill.level ? accentColor : '#e5e7eb',
                              borderRadius: '2px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '32px' }}>
              {/* Profile */}
              {resumeData.objective && (
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ ...sectionHeaderStyle, fontSize: '20px', color: accentColor }}>Profile</h2>
                  <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.6' }}>{resumeData.objective}</p>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ ...sectionHeaderStyle, fontSize: '20px', color: accentColor }}>Projects</h2>
                  {resumeData.projects.map((project, index) => (
                    <div key={index} style={{ 
                      marginBottom: '20px', 
                      padding: '16px', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px',
                      borderLeft: `4px solid ${accentColor}`
                    }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>{project.name}</h3>
                      <p style={{ fontSize: '14px', margin: '0 0 8px 0', lineHeight: '1.5' }}>{project.description}</p>
                      {project.technologies.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {project.technologies.join(' • ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ ...sectionHeaderStyle, fontSize: '20px', color: accentColor }}>Experience</h2>
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>{exp.position}</h3>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: accentColor, marginBottom: '8px', fontWeight: '500' }}>
                        {exp.company}
                      </div>
                      <p style={{ fontSize: '14px', margin: '0', lineHeight: '1.5' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'tech-developer':
        return (
          <div style={{ ...commonStyles, fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace', padding: '40px', maxWidth: '794px', minHeight: '1123px', backgroundColor: 'white' }}>
            {/* Header */}
            <div style={{ 
              backgroundColor: '#1f2937', 
              color: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              marginBottom: '32px',
              border: `2px solid ${accentColor}`
            }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: accentColor }}>
                {resumeData.personalInfo.fullName || 'developer@creldesk.com'}
              </h1>
              <div style={{ fontSize: '16px', marginBottom: '12px', color: '#9ca3af' }}>
                {'<'} Full Stack Developer {' />'}
              </div>
              <div style={{ fontSize: '14px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {resumeData.personalInfo.email && <span>📧 {resumeData.personalInfo.email}</span>}
                {resumeData.githubUrl && <span>🔗 {resumeData.githubUrl}</span>}
                {resumeData.personalInfo.location && <span>📍 {resumeData.personalInfo.location}</span>}
              </div>
            </div>

            {/* Objective */}
            {resumeData.objective && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: accentColor, 
                  marginBottom: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  // OBJECTIVE
                </h2>
                <div style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '16px', 
                  borderRadius: '6px',
                  borderLeft: `4px solid ${accentColor}`,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {resumeData.objective}
                </div>
              </div>
            )}

            {/* Skills */}
            {resumeData.skillsWithLevels.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: accentColor, 
                  marginBottom: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  // TECHNICAL SKILLS
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {resumeData.skillsWithLevels.map((skill, index) => (
                    <div key={index} style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '12px', 
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                        <span style={{ fontWeight: '500' }}>{skill.name}</span>
                        <span style={{ color: accentColor, fontWeight: '600' }}>
                          {'★'.repeat(skill.level)}{'☆'.repeat(5 - skill.level)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Level: {skill.level}/5
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeData.projects.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: accentColor, 
                  marginBottom: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  // PROJECTS
                </h2>
                {resumeData.projects.map((project, index) => (
                  <div key={index} style={{ 
                    marginBottom: '20px',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '6px',
                    border: `1px solid ${accentColor}`
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: accentColor }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.5', color: '#d1d5db' }}>
                      {project.description}
                    </p>
                    {project.technologies.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        <span style={{ color: accentColor }}>Tech Stack:</span> {project.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: accentColor, 
                  marginBottom: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  // EXPERIENCE
                </h2>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>{exp.position}</h3>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
                        {exp.startDate} → {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: accentColor, marginBottom: '8px', fontWeight: '500' }}>
                      {exp.company}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.5',
                      backgroundColor: '#f9fafb',
                      padding: '12px',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${accentColor}`
                    }}>
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'elegant-modern':
        return (
          <div style={{ 
            ...commonStyles, 
            padding: '40px', 
            maxWidth: '794px', 
            minHeight: '1123px', 
            backgroundColor: 'white',
            background: `linear-gradient(135deg, #ffffff 0%, ${accentColor}05 100%)`
          }}>
            {/* Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '40px',
              background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`,
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '300', 
                margin: '0 0 8px 0', 
                background: `linear-gradient(135deg, ${accentColor}, #6366f1)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1px'
              }}>
                {resumeData.personalInfo.fullName || 'Your Name'}
              </h1>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '16px', fontWeight: '300' }}>
                Professional Consultant
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '24px', 
                flexWrap: 'wrap',
                marginTop: '16px'
              }}>
                {resumeData.personalInfo.email && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✉ {resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📞 {resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo.location && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {resumeData.personalInfo.location}</span>}
              </div>
            </div>

            {/* Profile */}
            {resumeData.summary && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '300', 
                  color: accentColor, 
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  Profile
                </h2>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                  border: `1px solid ${accentColor}20`
                }}>
                  <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.7', textAlign: 'center', color: '#374151' }}>
                    {resumeData.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Skills */}
            {resumeData.skillsWithLevels.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '300', 
                  color: accentColor, 
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  Skills
                </h2>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                  border: `1px solid ${accentColor}20`
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {resumeData.skillsWithLevels.map((skill, index) => (
                      <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                          <span style={{ fontWeight: '500' }}>{skill.name}</span>
                          <span style={{ color: accentColor, fontSize: '12px' }}>{skill.level}/5</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          backgroundColor: '#f1f5f9', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${(skill.level / 5) * 100}%`, 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${accentColor}, #6366f1)`,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '300', 
                  color: accentColor, 
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  Experience
                </h2>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                  border: `1px solid ${accentColor}20`
                }}>
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} style={{ 
                      marginBottom: index < resumeData.experience.length - 1 ? '24px' : '0',
                      paddingBottom: index < resumeData.experience.length - 1 ? '24px' : '0',
                      borderBottom: index < resumeData.experience.length - 1 ? `1px solid ${accentColor}20` : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0', color: '#1f2937' }}>{exp.position}</h3>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          backgroundColor: `${accentColor}10`,
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '16px', color: accentColor, marginBottom: '12px', fontWeight: '400' }}>
                        {exp.company}
                      </div>
                      <p style={{ fontSize: '14px', margin: '0', lineHeight: '1.6', color: '#4b5563' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '300', 
                  color: accentColor, 
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  Education
                </h2>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                  border: `1px solid ${accentColor}20`
                }}>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} style={{ marginBottom: index < resumeData.education.length - 1 ? '16px' : '0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0' }}>
                            {edu.degree} in {edu.field}
                          </h3>
                          <div style={{ fontSize: '14px', color: accentColor }}>{edu.institution}</div>
                        </div>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          backgroundColor: `${accentColor}10`,
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          {edu.graduationDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Template not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Resume Builder</h2>
        <p className="text-slate-600 dark:text-slate-400">Create professional resumes with our beautiful templates</p>
      </div>

      {/* Template Selection */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Choose Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.map((template) => {
            const IconComponent = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id as TemplateType)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <IconComponent size={24} className={`mx-auto mb-2 ${
                  selectedTemplate === template.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`} />
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{template.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{template.description}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card padding="md">
            <div className="flex items-center space-x-2 mb-4">
              <User size={20} className="text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                label="Email"
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, email: e.target.value }
                }))}
                placeholder="john@example.com"
              />
              <Input
                label="Phone"
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
                label="Website"
                value={resumeData.personalInfo.website}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, website: e.target.value }
                }))}
                placeholder="www.johndoe.com"
              />
              <Input
                label="LinkedIn"
                value={resumeData.personalInfo.linkedin}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                }))}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </Card>

          {/* Objective/Summary */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Objective & Summary</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAISuggestion('objective')}
                >
                  <Sparkles size={14} className="mr-1" />
                  AI Objective
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAISuggestion('summary')}
                >
                  <Sparkles size={14} className="mr-1" />
                  AI Summary
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Objective
                </label>
                <textarea
                  value={resumeData.objective}
                  onChange={(e) => setResumeData(prev => ({ ...prev, objective: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Brief statement of your career goals and what you bring to the role..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Summary
                </label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Professional summary highlighting your key achievements and expertise..."
                />
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
              <Button variant="outline" size="sm" onClick={addSkillWithLevel}>
                <Plus size={16} className="mr-1" />
                Add Skill
              </Button>
            </div>
            <div className="space-y-3">
              {resumeData.skillsWithLevels.map((skill, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkillWithLevel(index, 'name', e.target.value)}
                    placeholder="Skill name"
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Level:</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={skill.level}
                      onChange={(e) => updateSkillWithLevel(index, 'level', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm font-medium w-8">{skill.level}/5</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSkillWithLevel(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Experience */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase size={20} className="text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Experience</h3>
              </div>
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus size={16} className="mr-1" />
                Add Experience
              </Button>
            </div>
            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Experience {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="Software Developer"
                    />
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Tech Corp"
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
                          className="rounded"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Current position</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                      rows={3}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GraduationCap size={20} className="text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Education</h3>
              </div>
              <Button variant="outline" size="sm" onClick={addEducation}>
                <Plus size={16} className="mr-1" />
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Education {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      placeholder="University Name"
                    />
                    <Input
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="Bachelor's Degree"
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
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Projects */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Projects</h3>
              <Button variant="outline" size="sm" onClick={addProject}>
                <Plus size={16} className="mr-1" />
                Add Project
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.projects.map((project, index) => (
                <div key={project.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Project {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Project Name"
                      value={project.name}
                      onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      placeholder="My Awesome Project"
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                        rows={3}
                        placeholder="Describe your project and its impact..."
                      />
                    </div>
                    <Input
                      label="Technologies (comma-separated)"
                      value={project.technologies.join(', ')}
                      onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customization */}
          <Card padding="md">
            <div className="flex items-center space-x-2 mb-4">
              <Palette size={20} className="text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Customization</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye size={20} className="text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Preview</h3>
            </div>
            <Button onClick={exportToPDF} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>

          <Card padding="sm" className="preview-container">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto max-h-[800px]">
              <div
                ref={previewRef}
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                  width: '794px',
                  minHeight: '1123px',
                  margin: '0 auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                {renderTemplate()}
              </div>
            </div>
          </Card>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Preview is scaled to fit. PDF export will be full size with proper margins.
          </div>
        </div>
      </div>
    </div>
  );
};