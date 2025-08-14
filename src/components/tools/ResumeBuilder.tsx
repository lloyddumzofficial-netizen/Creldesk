import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Eye, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Palette,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Calendar,
  Building,
  GraduationCap,
  Award,
  X,
  Camera
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  profileImage: string;
}

interface Experience {
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
  gpa: string;
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
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  template: string;
  primaryColor: string;
  secondaryColor: string;
}

const TEMPLATES = [
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'Clean sidebar layout with dark theme',
    preview: 'Dark sidebar with teal accents'
  },
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'Contemporary design with geometric elements',
    preview: 'Blue accent with modern layout'
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    description: 'Vibrant colors for creative professionals',
    preview: 'Curved design with cyan theme'
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    description: 'Clean, traditional layout',
    preview: 'Simple black and white design'
  },
  { 
    id: 'executive', 
    name: 'Executive', 
    description: 'Sophisticated design for senior positions',
    preview: 'Premium layout with gold accents'
  }
];

const COLOR_PRESETS = [
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#1d4ed8' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Green', primary: '#10b981', secondary: '#059669' },
  { name: 'Orange', primary: '#f59e0b', secondary: '#d97706' },
  { name: 'Red', primary: '#ef4444', secondary: '#dc2626' },
];

export const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      profileImage: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    template: 'professional',
    primaryColor: '#14b8a6',
    secondaryColor: '#0d9488'
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [newSkill, setNewSkill] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generateId = () => crypto.randomUUID();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image too large', 'Please select an image smaller than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setResumeData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, profileImage: imageUrl }
        }));
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, profileImage: '' }
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
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
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
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
    const newCert: Certification = {
      id: generateId(),
      name: '',
      issuer: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
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

  const exportToPDF = async () => {
    if (!previewRef.current) {
      toast.error('Export failed', 'Preview not available');
      return;
    }

    setIsExporting(true);
    toast.info('Generating PDF...', 'This may take a few moments');

    try {
      // Create a temporary container for high-resolution rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.height = '1123px'; // A4 height in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      tempContainer.innerHTML = previewRef.current.innerHTML;
      
      // Apply styles to temp container
      const tempStyle = document.createElement('style');
      tempStyle.textContent = `
        .temp-resume { 
          transform: scale(1) !important; 
          width: 794px !important; 
          height: 1123px !important; 
          overflow: hidden !important;
          font-size: 14px !important;
        }
        .temp-resume * { 
          box-sizing: border-box !important; 
        }
      `;
      tempContainer.appendChild(tempStyle);
      tempContainer.className = 'temp-resume';
      
      document.body.appendChild(tempContainer);

      // Generate canvas with high quality
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0
      });

      // Clean up temp container
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);

      // Download PDF
      const fileName = `${resumeData.personalInfo.fullName || 'Resume'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      toast.success('PDF exported successfully!', `Downloaded as ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', 'Please try again or contact support');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTemplate = () => {
    const { template, primaryColor, secondaryColor } = resumeData;
    
    switch (template) {
      case 'professional':
        return renderProfessionalTemplate();
      case 'modern':
        return renderModernTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      case 'executive':
        return renderExecutiveTemplate();
      default:
        return renderProfessionalTemplate();
    }
  };

  const renderProfessionalTemplate = () => (
    <div className="w-full h-full bg-white flex" style={{ minHeight: '1123px' }}>
      {/* Left Sidebar */}
      <div className="w-1/3 p-8 text-white" style={{ backgroundColor: '#2d3748' }}>
        {/* Profile Image */}
        <div className="mb-8 text-center">
          {resumeData.personalInfo.profileImage ? (
            <img
              src={resumeData.personalInfo.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white/20"
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto bg-white/20 flex items-center justify-center">
              <User size={48} className="text-white/60" />
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <span className="text-sm">🛠</span>
            </div>
            SKILLS
          </h3>
          <div className="space-y-3">
            {resumeData.skills.map((skill, index) => (
              <div key={index} className="bg-white/10 px-3 py-2 rounded-lg text-sm font-medium">
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <GraduationCap size={16} />
            </div>
            EDUCATION
          </h3>
          {resumeData.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h4 className="font-bold text-sm">{edu.degree}</h4>
              <p className="text-sm opacity-90">{edu.institution}</p>
              <p className="text-xs opacity-75">{edu.graduationDate}</p>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <span className="text-sm">🌐</span>
            </div>
            LANGUAGES
          </h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm font-medium">English</div>
              <div className="text-xs opacity-75">Native or Bilingual Proficiency</div>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <span className="text-sm">🎯</span>
            </div>
            INTERESTS
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <span className="text-xs">📷</span>
            </div>
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <span className="text-xs">🏀</span>
            </div>
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <span className="text-xs">🎵</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {resumeData.personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">Sales Associate</p>
          
          <div className="bg-gray-800 text-white p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Mail size={16} className="mr-2" />
              {resumeData.personalInfo.email || 'email@example.com'}
            </div>
            <div className="flex items-center">
              <Phone size={16} className="mr-2" />
              {resumeData.personalInfo.phone || '123 444 555'}
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2" />
              {resumeData.personalInfo.location || 'City, State'}
            </div>
            <div className="flex items-center">
              <Linkedin size={16} className="mr-2" />
              {resumeData.personalInfo.linkedin || 'linkedin.com/in/profile'}
            </div>
          </div>
        </div>

        {/* Summary */}
        {resumeData.summary && (
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Building size={20} className="mr-2" />
            WORK EXPERIENCE
          </h2>
          {resumeData.experience.map((exp) => (
            <div key={exp.id} className="mb-6 border-l-4 border-teal-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{exp.position || 'Position'}</h3>
                  <p className="text-gray-600">{exp.company || 'Company Name'}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}</div>
                  <div className="text-teal-600">Location</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium text-teal-600 mb-2">Achievements</p>
                <ul className="list-disc list-inside space-y-1">
                  {exp.description.split('\n').filter(line => line.trim()).map((line, index) => (
                    <li key={index}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award size={20} className="mr-2" />
              CONFERENCES & COURSES
            </h2>
            {resumeData.certifications.map((cert) => (
              <div key={cert.id} className="mb-3">
                <h3 className="font-medium text-gray-800">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.issuer} - {cert.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderModernTemplate = () => (
    <div className="w-full h-full bg-white" style={{ minHeight: '1123px' }}>
      {/* Header */}
      <div className="bg-gray-100 p-8">
        <div className="flex items-center space-x-6">
          {resumeData.personalInfo.profileImage ? (
            <img
              src={resumeData.personalInfo.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={32} className="text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-3">Accountant</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📞 {resumeData.personalInfo.phone || '+123-456-890'}</span>
              <span>✉️ {resumeData.personalInfo.email || 'mail@reallysite.com'}</span>
              <span>🌐 {resumeData.personalInfo.website || 'www.realsite.com'}</span>
              <span>📍 {resumeData.personalInfo.location || '123 Anywhere St, City'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          {/* Contact Me */}
          <div className="bg-blue-900 text-white p-6 rounded-lg">
            <h3 className="font-bold mb-4">Contact Me</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Phone size={14} className="mr-2" />
                {resumeData.personalInfo.phone || '+123-456-890'}
              </div>
              <div className="flex items-center">
                <Mail size={14} className="mr-2" />
                {resumeData.personalInfo.email || 'mail@reallysite.com'}
              </div>
              <div className="flex items-center">
                <Globe size={14} className="mr-2" />
                {resumeData.personalInfo.website || 'www.realsite.com'}
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-2" />
                {resumeData.personalInfo.location || '123 Anywhere St, City'}
              </div>
            </div>
          </div>

          {/* About Me */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 bg-gray-200 px-4 py-2 rounded">About Me</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {resumeData.summary || 'Write down a professional summary or a resume objective. Note, that this part is different for every country.'}
            </p>
          </div>

          {/* Reference */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 bg-gray-200 px-4 py-2 rounded">Reference</h3>
            <div className="text-sm">
              <p className="font-medium">Mr. anyname</p>
              <p className="text-gray-600">Wardiere / CEO</p>
              <p className="text-gray-600">Phone: 123-456-789</p>
              <p className="text-gray-600">E-mail: hello@realsite.com</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-6">
          {/* Education */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-200 px-4 py-2 rounded">EDUCATION</h2>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="mb-4 flex justify-between">
                <div>
                  <h3 className="font-bold text-blue-600">{edu.institution || 'HARVARD UNIVERSITY'}</h3>
                  <p className="text-gray-700">{edu.degree || 'M.Sc. Bioengineering'}/{edu.graduationDate || '2014-present'}</p>
                  <p className="text-sm text-gray-600">{edu.field || 'Cambridge, MA'}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Clubs & Societies: Robotics Society,</p>
                  <p>Business Club</p>
                </div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-200 px-4 py-2 rounded">EXPERIENCE</h2>
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="mb-4 flex justify-between">
                <div>
                  <h3 className="font-bold text-blue-600">{exp.company || 'TESLA INC.'}</h3>
                  <p className="text-gray-700">{exp.position || 'Graphic Designer'}/{exp.startDate || '2016'}-{exp.current ? 'present' : exp.endDate || '2018'}</p>
                  <p className="text-sm text-gray-600">Location</p>
                </div>
                <div className="text-right text-sm text-gray-600 max-w-xs">
                  <p>{exp.description || 'Describe your responsibilities and achievements'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Skills Progress */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-200 px-4 py-2 rounded">Skills</h2>
            <div className="grid grid-cols-2 gap-4">
              {resumeData.skills.slice(0, 6).map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{skill}</span>
                    <span className="text-sm text-gray-500">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: resumeData.primaryColor,
                        width: `${85 + Math.random() * 15}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="w-full h-full bg-white relative overflow-hidden" style={{ minHeight: '1123px' }}>
      {/* Curved Background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 800 1123" className="w-full h-full">
          <path
            d="M0,0 L800,0 L800,1123 Q400,1000 0,1123 Z"
            fill={resumeData.primaryColor}
            opacity="0.1"
          />
          <path
            d="M0,0 L200,0 Q300,200 200,400 Q100,600 200,800 Q150,1000 0,1123 Z"
            fill={resumeData.primaryColor}
          />
        </svg>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-6 mb-6">
            {resumeData.personalInfo.profileImage ? (
              <img
                src={resumeData.personalInfo.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-xl">
                <User size={48} className="text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {resumeData.personalInfo.fullName || 'ADRIAN RAFAEL'}
              </h1>
              <p className="text-xl text-white/90">Software Engineer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="text-white space-y-6">
            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">CONTACT</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center mr-3">
                    <Mail size={14} />
                  </div>
                  {resumeData.personalInfo.email || 'adrianrafa@gmail.com'}
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center mr-3">
                    <Phone size={14} />
                  </div>
                  {resumeData.personalInfo.phone || '+65 123-456-7890'}
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center mr-3">
                    <MapPin size={14} />
                  </div>
                  {resumeData.personalInfo.location || '128 Old Choa Chu Kang Rd, Singapore 698928'}
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center mr-3">
                    <Globe size={14} />
                  </div>
                  {resumeData.personalInfo.website || 'www.helpshared.com'}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-bold mb-4">SKILLS</h3>
              <div className="space-y-3">
                {resumeData.skills.slice(0, 4).map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{skill}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-cyan-400 h-2 rounded-full"
                        style={{ width: `${85 + Math.random() * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-lg font-bold mb-4">LANGUAGES</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>English</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-cyan-400" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Chinese</span>
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-cyan-400" />
                    ))}
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>French</span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-cyan-400" />
                    ))}
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-white/30" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hobbies */}
            <div>
              <h3 className="text-lg font-bold mb-4">HOBBIES</h3>
              <div className="flex space-x-3">
                <div className="w-10 h-10 rounded bg-cyan-400 flex items-center justify-center">
                  <span>✈️</span>
                </div>
                <div className="w-10 h-10 rounded bg-cyan-400 flex items-center justify-center">
                  <span>⚽</span>
                </div>
                <div className="w-10 h-10 rounded bg-cyan-400 flex items-center justify-center">
                  <span>🎵</span>
                </div>
                <div className="w-10 h-10 rounded bg-cyan-400 flex items-center justify-center">
                  <span>📚</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-6">
            {/* Summary */}
            <div className="bg-gray-800 text-white p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-3">SUMMARY</h2>
              <p className="text-sm leading-relaxed">
                {resumeData.summary || 'Motivated Software Engineer with an exceptional educational background in computer science and technology. Proficient in essential software engineering skills, including full-stack development and network architecture.'}
              </p>
            </div>

            {/* Education */}
            <div className="bg-gray-800 text-white p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-3">EDUCATION</h2>
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-cyan-400 text-sm font-medium">{edu.graduationDate || '2012-2014'}</p>
                      <h3 className="font-bold">{edu.institution || 'FRANKLIN UNIVERSITY'}</h3>
                    </div>
                  </div>
                  <p className="text-sm mt-1">
                    {edu.degree || 'Completed his education with a Bachelor of Science in computer science with a GPA of 4.3.'}
                  </p>
                </div>
              ))}
            </div>

            {/* Work Experience */}
            <div className="bg-gray-800 text-white p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-3">WORK EXPERIENCE</h2>
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-cyan-400 text-sm font-medium">
                        {exp.startDate || '2016'}-{exp.current ? 'present' : exp.endDate || '2018'}
                      </p>
                      <h3 className="font-bold">{exp.company || 'ONE TSURUGA INC'}</h3>
                    </div>
                  </div>
                  <p className="text-sm">
                    {exp.description || 'Job title as Project Manager - Rewrite existing software programs for different operating systems.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className="w-full h-full bg-white p-8" style={{ minHeight: '1123px' }}>
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
        {resumeData.personalInfo.profileImage && (
          <img
            src={resumeData.personalInfo.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-lg text-gray-600 mb-4">Professional Title</p>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>{resumeData.personalInfo.email || 'email@example.com'}</span>
          <span>{resumeData.personalInfo.phone || '(555) 123-4567'}</span>
          <span>{resumeData.personalInfo.location || 'City, State'}</span>
        </div>
      </div>

      {/* Summary */}
      {resumeData.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-1">
          WORK EXPERIENCE
        </h2>
        {resumeData.experience.map((exp) => (
          <div key={exp.id} className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{exp.position || 'Position Title'}</h3>
                <p className="text-gray-600">{exp.company || 'Company Name'}</p>
              </div>
              <div className="text-right text-gray-500">
                <p>{exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}</p>
              </div>
            </div>
            {exp.description && (
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {exp.description.split('\n').filter(line => line.trim()).map((line, index) => (
                  <li key={index}>{line.trim()}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-1">
          EDUCATION
        </h2>
        {resumeData.education.map((edu) => (
          <div key={edu.id} className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">{edu.degree || 'Degree'}</h3>
                <p className="text-gray-600">{edu.institution || 'Institution'}</p>
                {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
              </div>
              <div className="text-right text-gray-500">
                <p>{edu.graduationDate || 'Year'}</p>
                {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-1">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-full text-white"
                style={{ backgroundColor: resumeData.primaryColor }}
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
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-1">
            CERTIFICATIONS
          </h2>
          {resumeData.certifications.map((cert) => (
            <div key={cert.id} className="mb-3">
              <h3 className="font-medium text-gray-800">{cert.name}</h3>
              <p className="text-sm text-gray-600">{cert.issuer} - {cert.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExecutiveTemplate = () => (
    <div className="w-full h-full bg-white" style={{ minHeight: '1123px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center space-x-6">
          {resumeData.personalInfo.profileImage ? (
            <img
              src={resumeData.personalInfo.profileImage}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center">
              <User size={40} className="text-white/60" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {resumeData.personalInfo.fullName || 'Executive Name'}
            </h1>
            <p className="text-xl text-gray-300 mb-4">Chief Executive Officer</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>{resumeData.personalInfo.email || 'executive@company.com'}</div>
              <div>{resumeData.personalInfo.phone || '+1 (555) 123-4567'}</div>
              <div>{resumeData.personalInfo.location || 'New York, NY'}</div>
              <div>{resumeData.personalInfo.linkedin || 'linkedin.com/in/executive'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Core Competencies */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-yellow-500 pb-2">
              CORE COMPETENCIES
            </h3>
            <div className="space-y-2">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                  <span className="text-sm text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-yellow-500 pb-2">
              EDUCATION
            </h3>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-500">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-6">
          {/* Executive Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-yellow-500 pb-2">
              EXECUTIVE SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {resumeData.summary || 'Accomplished executive with proven track record of driving organizational growth and operational excellence across diverse industries.'}
            </p>
          </div>

          {/* Professional Experience */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-yellow-500 pb-2">
              PROFESSIONAL EXPERIENCE
            </h2>
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{exp.position || 'Executive Position'}</h3>
                    <p className="text-gray-600 font-medium">{exp.company || 'Company Name'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">
                      {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                    {exp.description.split('\n').filter(line => line.trim()).map((line, index) => (
                      <li key={index}>{line.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Certifications */}
          {resumeData.certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-yellow-500 pb-2">
                CERTIFICATIONS & AWARDS
              </h2>
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="mb-3">
                  <h3 className="font-medium text-gray-800">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuer} - {cert.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'summary', name: 'Summary', icon: FileText },
    { id: 'experience', name: 'Experience', icon: Building },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Award },
    { id: 'certifications', name: 'Certifications', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Resume Builder</h1>
            <p className="text-slate-600 dark:text-slate-400">Create professional resumes with live preview</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden lg:flex"
            >
              <Eye size={16} className="mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className={cn(
          "grid gap-6",
          showPreview ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto"
        )}>
          {/* Form Section */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Choose Template
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setResumeData(prev => ({ ...prev, template: template.id }))}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all duration-200",
                      resumeData.template === template.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                    )}
                  >
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Color Customization */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                  <Palette size={16} className="mr-2" />
                  Customize Colors
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={resumeData.primaryColor}
                        onChange={(e) => setResumeData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600"
                      />
                      <Input
                        value={resumeData.primaryColor}
                        onChange={(e) => setResumeData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={resumeData.secondaryColor}
                        onChange={(e) => setResumeData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600"
                      />
                      <Input
                        value={resumeData.secondaryColor}
                        onChange={(e) => setResumeData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setResumeData(prev => ({ 
                        ...prev, 
                        primaryColor: preset.primary, 
                        secondaryColor: preset.secondary 
                      }))}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Section Navigation */}
            <Card padding="md">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                        activeSection === section.id
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Form Sections */}
            <div className="space-y-6">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    Personal Information
                  </h3>
                  
                  {/* Profile Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                      {resumeData.personalInfo.profileImage ? (
                        <div className="relative">
                          <img
                            src={resumeData.personalInfo.profileImage}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                          <Camera size={24} className="text-slate-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload size={16} className="mr-2" />
                          Upload Image
                        </Button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Recommended: Square image, max 5MB
                        </p>
                      </div>
                    </div>
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
                      placeholder="City, State"
                    />
                    <Input
                      label="Website (Optional)"
                      value={resumeData.personalInfo.website}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, website: e.target.value }
                      }))}
                      placeholder="www.yoursite.com"
                    />
                    <Input
                      label="LinkedIn (Optional)"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>
                </Card>
              )}

              {/* Professional Summary */}
              {activeSection === 'summary' && (
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Professional Summary
                  </h3>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full h-32 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 resize-none"
                    placeholder="Write a compelling professional summary that highlights your key achievements and career objectives..."
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Tip: Focus on your most relevant achievements and what you can offer to employers.
                  </p>
                </Card>
              )}

              {/* Work Experience */}
              {activeSection === 'experience' && (
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Work Experience
                    </h3>
                    <Button onClick={addExperience} size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Experience
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            Experience #{index + 1}
                          </h4>
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
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                Current Position
                              </span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Description & Achievements
                          </label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            className="w-full h-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 resize-none"
                            placeholder="• Achieved 30% increase in sales through strategic promotions&#10;• Managed customer relationships and exceeded satisfaction targets&#10;• Collaborated with team to develop innovative solutions"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {resumeData.experience.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Building size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No work experience added yet</p>
                        <p className="text-sm">Click "Add Experience" to get started</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Education
                    </h3>
                    <Button onClick={addEducation} size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Education
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            Education #{index + 1}
                          </h4>
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
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.8"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {resumeData.education.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No education added yet</p>
                        <p className="text-sm">Click "Add Education" to get started</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    Skills
                  </h3>
                  
                  <div className="flex space-x-2 mb-4">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1"
                    />
                    <Button onClick={addSkill} disabled={!newSkill.trim()}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {resumeData.skills.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Award size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No skills added yet</p>
                      <p className="text-sm">Add your professional skills above</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Certifications */}
              {activeSection === 'certifications' && (
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Certifications
                    </h3>
                    <Button onClick={addCertification} size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Certification
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {resumeData.certifications.map((cert, index) => (
                      <div key={cert.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            Certification #{index + 1}
                          </h4>
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
                    
                    {resumeData.certifications.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Award size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No certifications added yet</p>
                        <p className="text-sm">Click "Add Certification" to get started</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="xl:sticky xl:top-6 xl:h-fit">
              <Card padding="md" className="bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Live Preview
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    40% Scale
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div 
                    ref={previewRef}
                    className="transform scale-40 origin-top-left"
                    style={{ 
                      width: '794px', 
                      height: '1123px',
                      transformOrigin: 'top left'
                    }}
                  >
                    {renderTemplate()}
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};