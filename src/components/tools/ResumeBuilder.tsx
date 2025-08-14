import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Calendar, 
  GraduationCap, 
  Award, 
  Star, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  Palette, 
  FileText,
  Building2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ResumeData } from '../../types';
import { cn } from '../../utils/cn';

export const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    objective: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  });

  const [activeSection, setActiveSection] = useState<'personal' | 'objective' | 'experience' | 'education' | 'skills' | 'certifications'>('personal');
  const [newSkill, setNewSkill] = useState('');
  const { saveProject } = useAppStore();
  const { user } = useAuthStore();

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

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addCertification = () => {
    const newCert = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
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

  const saveResume = async () => {
    if (user) {
      await saveProject({
        name: resumeData.personalInfo.fullName || 'My Resume',
        tool: 'resume-builder',
        data: resumeData,
      });
    }
  };

  const exportToPDF = () => {
    // Create HTML content for PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${resumeData.personalInfo.fullName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #14b8a6; padding-bottom: 20px; }
          .name { font-size: 28px; font-weight: bold; color: #14b8a6; margin-bottom: 10px; }
          .contact { font-size: 14px; color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #14b8a6; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .experience-item, .education-item, .cert-item { margin-bottom: 15px; }
          .company, .institution { font-weight: bold; color: #333; }
          .position, .degree { font-style: italic; color: #666; }
          .date { float: right; color: #999; font-size: 12px; }
          .skills { display: flex; flex-wrap: wrap; gap: 8px; }
          .skill { background: #f0f9ff; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${resumeData.personalInfo.fullName}</div>
          <div class="contact">
            ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
            ${resumeData.personalInfo.website ? ` | ${resumeData.personalInfo.website}` : ''}
            ${resumeData.personalInfo.linkedin ? ` | ${resumeData.personalInfo.linkedin}` : ''}
          </div>
        </div>

        ${resumeData.objective ? `
        <div class="section">
          <div class="section-title">Professional Objective</div>
          <p>${resumeData.objective}</p>
        </div>
        ` : ''}

        ${resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${resumeData.experience.map(exp => `
            <div class="experience-item">
              <div class="company">${exp.company} <span class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span></div>
              <div class="position">${exp.position}</div>
              <p>${exp.description}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resumeData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resumeData.education.map(edu => `
            <div class="education-item">
              <div class="institution">${edu.institution} <span class="date">${edu.graduationDate}</span></div>
              <div class="degree">${edu.degree} in ${edu.field}</div>
              ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resumeData.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${resumeData.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${resumeData.certifications.map(cert => `
            <div class="cert-item">
              <div class="company">${cert.name} <span class="date">${cert.date}</span></div>
              <div class="position">${cert.issuer}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName || 'Resume'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'objective', label: 'Objective', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Building2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Resume Builder</h2>
          <p className="text-slate-600 dark:text-slate-400">Create a professional resume with our easy-to-use builder</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={saveResume} variant="outline">
            <Save size={16} className="mr-2" />
            Save
          </Button>
          <Button onClick={exportToPDF}>
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-left",
                      activeSection === section.id
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Personal Information</h3>
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
                        value={resumeData.personalInfo.website || ''}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value }
                        }))}
                        placeholder="https://johndoe.com"
                      />
                      <Input
                        label="LinkedIn"
                        value={resumeData.personalInfo.linkedin || ''}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                        }))}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'objective' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Professional Objective</h3>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Objective Statement
                      </label>
                      <textarea
                        value={resumeData.objective}
                        onChange={(e) => setResumeData(prev => ({ ...prev, objective: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                        rows={4}
                        placeholder="Write a brief statement about your career goals and what you bring to potential employers..."
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Work Experience</h3>
                      <Button onClick={addExperience} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {resumeData.experience.map((exp, index) => (
                        <Card key={exp.id} padding="md" className="border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Experience #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              placeholder="Company Name"
                            />
                            <Input
                              label="Position"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                              placeholder="Job Title"
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
                                <span className="text-sm text-slate-700 dark:text-slate-300">Current position</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Job Description
                            </label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                              rows={3}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </Card>
                      ))}
                      
                      {resumeData.experience.length === 0 && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No work experience added yet</p>
                          <p className="text-sm">Click "Add Experience" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Education</h3>
                      <Button onClick={addEducation} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Education
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {resumeData.education.map((edu, index) => (
                        <Card key={edu.id} padding="md" className="border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Education #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-500 hover:text-red-700"
                            >
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
                        </Card>
                      ))}
                      
                      {resumeData.education.length === 0 && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No education added yet</p>
                          <p className="text-sm">Click "Add Education" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
                    
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill}>
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {resumeData.skills.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Star size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No skills added yet</p>
                        <p className="text-sm">Add your professional skills</p>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'certifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Certifications</h3>
                      <Button onClick={addCertification} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Certification
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {resumeData.certifications.map((cert, index) => (
                        <Card key={cert.id} padding="md" className="border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Certification #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(cert.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </Card>
                      ))}
                      
                      {resumeData.certifications.length === 0 && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          <Award size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No certifications added yet</p>
                          <p className="text-sm">Click "Add Certification" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card padding="md" className="sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Preview</h3>
              <Button variant="ghost" size="sm">
                <Eye size={16} />
              </Button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs max-h-[600px] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {resumeData.personalInfo.fullName || 'Your Name'}
                </h1>
                <div className="text-slate-600 dark:text-slate-400 text-xs mt-2">
                  {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
                  {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
                  {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
                </div>
              </div>

              {/* Objective */}
              {resumeData.objective && (
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">Objective</h2>
                  <p className="text-slate-700 dark:text-slate-300">{resumeData.objective}</p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">Experience</h2>
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="mb-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{exp.company}</div>
                      <div className="text-slate-600 dark:text-slate-400">{exp.position}</div>
                      <div className="text-slate-500 dark:text-slate-500 text-xs">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                      {exp.description && (
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">Education</h2>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="mb-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{edu.institution}</div>
                      <div className="text-slate-600 dark:text-slate-400">{edu.degree} in {edu.field}</div>
                      <div className="text-slate-500 dark:text-slate-500 text-xs">{edu.graduationDate}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">Skills</h2>
                  <div className="flex flex-wrap gap-1">
                    {resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resumeData.certifications.length > 0 && (
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">Certifications</h2>
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="mb-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{cert.name}</div>
                      <div className="text-slate-600 dark:text-slate-400">{cert.issuer}</div>
                      <div className="text-slate-500 dark:text-slate-500 text-xs">{cert.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};