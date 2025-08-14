import React, { useState, useRef } from 'react';
import { Download, Upload, X, User, Mail, Phone, MapPin, Globe, Linkedin, Plus, Trash2, Eye, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  profileImage?: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
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

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  template: string;
  primaryColor: string;
  secondaryColor: string;
}

const templates = [
  { id: 'professional', name: 'Professional', description: 'Clean sidebar design' },
  { id: 'modern', name: 'Modern', description: 'Contemporary layout' },
  { id: 'creative', name: 'Creative', description: 'Vibrant and unique' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and clean' },
  { id: 'executive', name: 'Executive', description: 'Sophisticated design' }
];

export const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: ''
    },
    summary: '',
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    template: 'professional',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [isExporting, setIsExporting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profileImage: e.target?.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
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
      workExperience: [...prev.workExperience, newExp]
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
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

  const exportToPDF = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      // Create a temporary container for high-resolution rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.height = '1123px'; // A4 height in pixels at 96 DPI
      tempContainer.innerHTML = previewRef.current.innerHTML;
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = resumeData.personalInfo.fullName 
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTemplate = () => {
    const { template, primaryColor, secondaryColor } = resumeData;
    
    switch (template) {
      case 'professional':
        return <ProfessionalTemplate data={resumeData} />;
      case 'modern':
        return <ModernTemplate data={resumeData} />;
      case 'creative':
        return <CreativeTemplate data={resumeData} />;
      case 'minimal':
        return <MinimalTemplate data={resumeData} />;
      case 'executive':
        return <ExecutiveTemplate data={resumeData} />;
      default:
        return <ProfessionalTemplate data={resumeData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Form Panel */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating...' : 'Download PDF'}
              </button>
            </div>

            {/* Template Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Choose Template</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setResumeData(prev => ({ ...prev, template: template.id }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      resumeData.template === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Customization */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Colors
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={resumeData.primaryColor}
                    onChange={(e) => setResumeData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={resumeData.secondaryColor}
                    onChange={(e) => setResumeData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'summary', label: 'Summary', icon: User },
                { id: 'experience', label: 'Experience', icon: User },
                { id: 'education', label: 'Education', icon: User },
                { id: 'skills', label: 'Skills', icon: User },
                { id: 'certifications', label: 'Certifications', icon: User }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {resumeData.personalInfo.profileImage ? (
                      <div className="relative">
                        <img
                          src={resumeData.personalInfo.profileImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, profileImage: undefined }
                          }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Square images work best</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website (Optional)</label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.website || ''}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, website: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">LinkedIn (Optional)</label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.linkedin || ''}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary Section */}
            {activeSection === 'summary' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Summary</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Summary</label>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Write a compelling professional summary that highlights your key achievements and career objectives..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Focus on your most relevant achievements and what you can offer to employers.
                  </p>
                </div>
              </div>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a skill..."
                  />
                  <button
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add other sections here... */}
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 bg-gray-100 p-6">
        <div className="sticky top-6">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
            <div 
              ref={previewRef}
              className="border border-gray-200 rounded-lg overflow-hidden"
              style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}
            >
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Components
const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex" style={{ width: '794px', height: '1123px' }}>
      {/* Left Sidebar */}
      <div 
        className="w-1/3 text-white p-8 flex flex-col"
        style={{ backgroundColor: data.primaryColor }}
      >
        {/* Profile Image */}
        {data.personalInfo.profileImage && (
          <div className="mb-6 flex justify-center">
            <img
              src={data.personalInfo.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            CONTACT
          </h3>
          <div className="space-y-3 text-sm">
            {data.personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{data.personalInfo.location}</span>
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                <span className="break-all">{data.personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">SKILLS</h3>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="bg-white/20 px-3 py-2 rounded text-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4">EDUCATION</h3>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="text-sm">
                  <div className="font-semibold">{edu.degree}</div>
                  <div className="opacity-90">{edu.institution}</div>
                  <div className="opacity-75">{edu.graduationDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">Professional Title</h2>
          {data.summary && (
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          )}
        </div>

        {/* Work Experience */}
        {data.workExperience.length > 0 && (
          <div className="mb-8">
            <h3 
              className="text-xl font-bold mb-4 pb-2 border-b-2"
              style={{ borderColor: data.primaryColor }}
            >
              WORK EXPERIENCE
            </h3>
            <div className="space-y-6">
              {data.workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg">{exp.position}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h3 
              className="text-xl font-bold mb-4 pb-2 border-b-2"
              style={{ borderColor: data.primaryColor }}
            >
              CERTIFICATIONS
            </h3>
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between">
                  <div>
                    <div className="font-semibold">{cert.name}</div>
                    <div className="text-gray-600 text-sm">{cert.issuer}</div>
                  </div>
                  <div className="text-sm text-gray-500">{cert.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder templates (you can expand these)
const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="w-full h-full bg-white p-8" style={{ width: '794px', height: '1123px' }}>
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold">{data.personalInfo.fullName || 'Your Name'}</h1>
      <p className="text-gray-600">Modern Template</p>
    </div>
  </div>
);

const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="w-full h-full bg-white p-8" style={{ width: '794px', height: '1123px' }}>
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold">{data.personalInfo.fullName || 'Your Name'}</h1>
      <p className="text-gray-600">Creative Template</p>
    </div>
  </div>
);

const MinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="w-full h-full bg-white p-8" style={{ width: '794px', height: '1123px' }}>
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold">{data.personalInfo.fullName || 'Your Name'}</h1>
      <p className="text-gray-600">Minimal Template</p>
    </div>
  </div>
);

const ExecutiveTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="w-full h-full bg-white p-8" style={{ width: '794px', height: '1123px' }}>
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold">{data.personalInfo.fullName || 'Your Name'}</h1>
      <p className="text-gray-600">Executive Template</p>
    </div>
  </div>
);