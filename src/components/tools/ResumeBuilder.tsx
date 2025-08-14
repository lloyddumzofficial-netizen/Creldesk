import React, { useState, useRef } from 'react';
import { Download, Upload, X, User, Mail, Phone, MapPin, Globe, Linkedin, Plus, Trash2, Eye, Palette, Calendar, Building, GraduationCap, Award, Languages, Heart } from 'lucide-react';
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
  jobTitle: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  description?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: string;
}

interface Interest {
  id: string;
  name: string;
  icon?: string;
}

interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  interests: Interest[];
  references: Reference[];
  template: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const templates = [
  { id: 'professional', name: 'Professional', description: 'Dark sidebar with teal accents' },
  { id: 'modern', name: 'Modern', description: 'Blue geometric design' },
  { id: 'creative', name: 'Creative', description: 'Curved teal design' },
  { id: 'colorful', name: 'Colorful', description: 'Dual-color modern layout' },
  { id: 'executive', name: 'Executive', description: 'Clean professional layout' }
];

export const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'Frank Graham',
      email: 'frank@novoresume.com',
      phone: '123 444 555',
      location: 'Montgomery, AL',
      website: '',
      linkedin: 'linkedin.com/in/frank.g',
      jobTitle: 'Sales Associate'
    },
    summary: 'Accomplished, growth-focused professional with 8+ years of dynamic sales experience across multiple industries. Equipped a steadfast commitment to customer service excellence to enhance customer experience, maximize satisfaction, propel retention, achieve/exceed sales goals, and increase business revenue. Possess super abilities to develop and maintain a high level of product knowledge to persuasively promote them to existing and potential customers.',
    workExperience: [
      {
        id: '1',
        company: 'ShoPerfect Deluxe Mal',
        position: 'Sales Associate',
        location: 'Montgomery, AL',
        startDate: '11/2018',
        endDate: 'Present',
        current: true,
        description: '',
        achievements: [
          'Formulate and execute compelling seasonal sales promotions, resulting in over 30% increase in-store sales for five consecutive months in the year 2019 & 2023.',
          'Proactively interact with customers to recommend products that best suit their tastes, interests, and needs, achieving a more than 98% in customer satisfaction rate.',
          'Work collaboratively with a team of 8 other sales associates to devise strategic sales solutions to achieve and exceed the department\'s monthly, quarterly, and yearly sales goals.',
          'Preserve up-to-date knowledge and information about the latest products or upcoming releases to effectively assist customers with various product-related concerns by providing accurate details.'
        ]
      },
      {
        id: '2',
        company: 'Storefront Sports Solutions',
        position: 'Retail Sales Associate',
        location: 'Auburn, AL',
        startDate: '01/2015',
        endDate: '10/2018',
        current: false,
        description: '',
        achievements: [
          'Devised and implemented an effective sales process, leading to consistently achieving the established sales goals and surpassing the monthly sales target by 12%.',
          'Conceptualized and enforced a customer loyalty program that prompted both existing and new customers to purchase twice as much merchandise, resulting in a 50% increase in the department\'s sales.',
          'Performed strategic upselling and cross-selling of women\'s apparel and other sports products based on customer\'s tastes and interests, which exceeded the yearly sales quotas by more than 10%.'
        ]
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of Alabama at Birmingham',
        degree: 'Associate of Arts in Business Administration',
        field: 'Business Administration',
        location: 'Birmingham, AL',
        graduationDate: '2014',
        description: ''
      }
    ],
    skills: [
      'Sales Management',
      'Revenue Growth',
      'Customer Service',
      'Customer Needs Analysis',
      'Conflict Resolution',
      'Work Ethic & Professionalism',
      'Effective Sales Process',
      'Persuasive Selling Approach'
    ],
    certifications: [
      {
        id: '1',
        name: 'Sales Training for High Performing Team Specialization',
        issuer: 'coursera.org',
        date: '2023',
        description: 'Online Course'
      },
      {
        id: '2',
        name: 'Practical Sales Management Training',
        issuer: 'ShoPerfect Deluxe Mall',
        date: '2022',
        description: ''
      },
      {
        id: '3',
        name: 'Sales Training: Practical Sales Techniques',
        issuer: 'udemy.com',
        date: '2021',
        description: 'Online Course'
      }
    ],
    languages: [
      { id: '1', name: 'English', proficiency: 'Native or Bilingual Proficiency' },
      { id: '2', name: 'Spanish', proficiency: 'Professional Working Proficiency' },
      { id: '3', name: 'French', proficiency: 'Professional Working Proficiency' }
    ],
    interests: [
      { id: '1', name: 'Blockchain Technologies', icon: '🔗' },
      { id: '2', name: 'Sailing', icon: '⛵' },
      { id: '3', name: 'Web 3.0', icon: '🌐' },
      { id: '4', name: 'Sustainability', icon: '🌱' }
    ],
    references: [],
    template: 'professional',
    primaryColor: '#14b8a6',
    secondaryColor: '#0d9488',
    accentColor: '#06b6d4'
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [isExporting, setIsExporting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
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

  const exportToPDF = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px';
      tempContainer.style.height = '1123px';
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
      
      const imgWidth = 210;
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

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
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
      location: '',
      graduationDate: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
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

  const addAchievement = (experienceId: string) => {
    if (!newAchievement.trim()) return;
    
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => 
        exp.id === experienceId 
          ? { ...exp, achievements: [...exp.achievements, newAchievement.trim()] }
          : exp
      )
    }));
    setNewAchievement('');
  };

  const removeAchievement = (experienceId: string, achievementIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => 
        exp.id === experienceId 
          ? { ...exp, achievements: exp.achievements.filter((_, i) => i !== achievementIndex) }
          : exp
      )
    }));
  };

  const renderTemplate = () => {
    switch (resumeData.template) {
      case 'professional':
        return <ProfessionalTemplate data={resumeData} />;
      case 'modern':
        return <ModernTemplate data={resumeData} />;
      case 'creative':
        return <CreativeTemplate data={resumeData} />;
      case 'colorful':
        return <ColorfulTemplate data={resumeData} />;
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
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={resumeData.accentColor}
                    onChange={(e) => setResumeData(prev => ({ ...prev, accentColor: e.target.value }))}
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
                { id: 'experience', label: 'Experience', icon: Building },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'skills', label: 'Skills', icon: Award },
                { id: 'certifications', label: 'Certifications', icon: Award },
                { id: 'languages', label: 'Languages', icon: Languages },
                { id: 'interests', label: 'Interests', icon: Heart }
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
                      placeholder="Frank Graham"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.jobTitle}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, jobTitle: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sales Associate"
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
                      placeholder="frank@novoresume.com"
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
                      placeholder="123 444 555"
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
                      placeholder="Montgomery, AL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin || ''}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="linkedin.com/in/frank.g"
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
                    placeholder="Write a compelling professional summary..."
                  />
                </div>
              </div>
            )}

            {/* Work Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <button
                    onClick={addWorkExperience}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </button>
                </div>
                
                {resumeData.workExperience.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          workExperience: prev.workExperience.map(item => 
                            item.id === exp.id ? { ...item, position: e.target.value } : item
                          )
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Job Position"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          workExperience: prev.workExperience.map(item => 
                            item.id === exp.id ? { ...item, company: e.target.value } : item
                          )
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Company Name"
                      />
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          workExperience: prev.workExperience.map(item => 
                            item.id === exp.id ? { ...item, location: e.target.value } : item
                          )
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Location"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            workExperience: prev.workExperience.map(item => 
                              item.id === exp.id ? { ...item, startDate: e.target.value } : item
                            )
                          }))}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Start Date"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            workExperience: prev.workExperience.map(item => 
                              item.id === exp.id ? { ...item, endDate: e.target.value } : item
                            )
                          }))}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="End Date"
                          disabled={exp.current}
                        />
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          workExperience: prev.workExperience.map(item => 
                            item.id === exp.id ? { ...item, current: e.target.checked, endDate: e.target.checked ? 'Present' : '' } : item
                          )
                        }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Currently working here</span>
                    </label>

                    {/* Achievements */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Achievements</label>
                      <div className="space-y-2">
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <textarea
                              value={achievement}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                workExperience: prev.workExperience.map(item => 
                                  item.id === exp.id 
                                    ? { ...item, achievements: item.achievements.map((ach, i) => i === achIndex ? e.target.value : ach) }
                                    : item
                                )
                              }))}
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                              placeholder="Describe your achievement..."
                            />
                            <button
                              onClick={() => removeAchievement(exp.id, achIndex)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingExperience === exp.id ? newAchievement : ''}
                            onChange={(e) => {
                              setEditingExperience(exp.id);
                              setNewAchievement(e.target.value);
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Add new achievement..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addAchievement(exp.id);
                                setEditingExperience(null);
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              addAchievement(exp.id);
                              setEditingExperience(null);
                            }}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setResumeData(prev => ({
                        ...prev,
                        workExperience: prev.workExperience.filter(item => item.id !== exp.id)
                      }))}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Experience
                    </button>
                  </div>
                ))}
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

            {/* Other sections would go here... */}
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

// Professional Template (Dark Sidebar - First Reference)
const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex" style={{ width: '794px', height: '1123px' }}>
      {/* Left Sidebar */}
      <div 
        className="w-1/3 text-white p-8 flex flex-col"
        style={{ backgroundColor: '#4a5568' }}
      >
        {/* Profile Image */}
        {data.personalInfo.profileImage && (
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full border-4 overflow-hidden"
                style={{ borderColor: data.primaryColor }}
              >
                <img
                  src={data.personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">🛠</span>
            </div>
            SKILLS
          </h3>
          <div className="space-y-3">
            {data.skills.map((skill, index) => (
              <div key={index} className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium">
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            EDUCATION
          </h3>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="text-sm">
                <div className="font-bold text-white">{edu.degree}</div>
                <div className="text-white/90">{edu.field}</div>
                <div className="text-white/80">{edu.institution}</div>
                <div className="text-white/70">{edu.location}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            LANGUAGES
          </h3>
          <div className="space-y-3">
            {data.languages.map((lang) => (
              <div key={lang.id}>
                <div className="font-medium text-white">{lang.name}</div>
                <div className="text-sm text-white/80 italic">{lang.proficiency}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            INTERESTS
          </h3>
          <div className="space-y-3">
            {data.interests.map((interest) => (
              <div key={interest.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm">{interest.icon || '📌'}</span>
                </div>
                <span className="text-sm font-medium">{interest.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          <h2 
            className="text-xl mb-4"
            style={{ color: data.primaryColor }}
          >
            {data.personalInfo.jobTitle || 'Professional Title'}
          </h2>
          
          {/* Contact Info */}
          <div 
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: '#2d3748', color: 'white' }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{data.personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                <span>{data.personalInfo.linkedin}</span>
              </div>
            </div>
          </div>

          {data.summary && (
            <p className="text-gray-700 leading-relaxed text-justify">{data.summary}</p>
          )}
        </div>

        {/* Work Experience */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: data.primaryColor }}
            >
              <Building className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">WORK EXPERIENCE</h3>
          </div>
          
          <div className="space-y-6">
            {data.workExperience.map((exp, index) => (
              <div key={exp.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-0 top-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: data.primaryColor }}
                  />
                  {index < data.workExperience.length - 1 && (
                    <div 
                      className="w-0.5 h-16 mt-2 ml-1"
                      style={{ backgroundColor: data.primaryColor }}
                    />
                  )}
                </div>
                
                <div className="ml-8">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{exp.position}</h4>
                      <p className="text-gray-700 font-medium">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div 
                        className="font-medium"
                        style={{ color: data.primaryColor }}
                      >
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                      <div 
                        className="text-sm italic"
                        style={{ color: data.primaryColor }}
                      >
                        {exp.location}
                      </div>
                    </div>
                  </div>
                  
                  {exp.achievements.length > 0 && (
                    <div>
                      <div 
                        className="text-sm font-medium mb-2 italic"
                        style={{ color: data.primaryColor }}
                      >
                        Achievements
                      </div>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                            <span 
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: data.primaryColor }}
                            />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: data.primaryColor }}
              >
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">CONFERENCES & COURSES</h3>
            </div>
            
            <div className="space-y-4">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="border-l-2 pl-4" style={{ borderColor: data.primaryColor }}>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <span className="text-blue-500 text-sm">🔗</span>
                  </div>
                  <div 
                    className="text-sm italic"
                    style={{ color: data.primaryColor }}
                  >
                    {cert.description || cert.issuer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modern Template (Blue Geometric - Second Reference)
const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white" style={{ width: '794px', height: '1123px' }}>
      {/* Header with geometric design */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: data.primaryColor }}
        />
        <div 
          className="absolute right-0 top-0 w-32 h-full"
          style={{ backgroundColor: data.secondaryColor }}
        />
        
        <div className="relative z-10 p-8 text-white">
          <div className="flex items-center gap-6">
            {data.personalInfo.profileImage && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
                <img
                  src={data.personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {data.personalInfo.fullName || 'YOUR NAME'}
              </h1>
              <h2 className="text-lg opacity-90">
                {data.personalInfo.jobTitle || 'PROFESSIONAL TITLE'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Profile Section */}
          <div>
            <div 
              className="text-white text-center py-2 px-4 rounded-lg mb-4 font-bold"
              style={{ backgroundColor: '#9ca3af' }}
            >
              PROFILE
            </div>
            <p className="text-sm text-gray-700 leading-relaxed text-justify">
              {data.summary || 'Write down a professional summary or a resume objective.'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <div 
              className="text-white text-center py-2 px-4 rounded-lg mb-4 font-bold"
              style={{ backgroundColor: '#9ca3af' }}
            >
              CONTACT
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: data.primaryColor }} />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: data.primaryColor }} />
                <span>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: data.primaryColor }} />
                <span>{data.personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: data.primaryColor }} />
                <span>{data.personalInfo.website || 'janesmith.com'}</span>
              </div>
            </div>
          </div>

          {/* Hobbies/Interests */}
          <div>
            <div 
              className="text-white text-center py-2 px-4 rounded-lg mb-4 font-bold"
              style={{ backgroundColor: '#9ca3af' }}
            >
              HOBBIES
            </div>
            <div className="grid grid-cols-3 gap-4">
              {data.interests.slice(0, 3).map((interest) => (
                <div key={interest.id} className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: data.primaryColor }}
                  >
                    <span className="text-white text-lg">{interest.icon || '📌'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns */}
        <div className="col-span-2 space-y-8">
          {/* Education */}
          <div>
            <div 
              className="text-white text-center py-2 px-4 rounded-lg mb-4 font-bold"
              style={{ backgroundColor: '#9ca3af' }}
            >
              EDUCATION
            </div>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{edu.institution.toUpperCase()}</h4>
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: data.primaryColor }}
                      />
                      <span className="font-bold">{edu.degree}</span>
                    </div>
                    <div className="text-sm text-gray-600">{edu.location}</div>
                    <div className="text-sm text-gray-500">
                      Clubs & Societies: Business Club
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{edu.graduationDate}</div>
                    <div className="text-sm text-gray-600">Graduated Summa Cum Laude</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div 
              className="text-white text-center py-2 px-4 rounded-lg mb-4 font-bold"
              style={{ backgroundColor: '#9ca3af' }}
            >
              EXPERIENCE
            </div>
            <div className="space-y-6">
              {data.workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{exp.company.toUpperCase()}</h4>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: data.primaryColor }}
                        />
                        <span className="font-bold">{exp.position}</span>
                      </div>
                      <div className="text-sm text-gray-600">{exp.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{exp.startDate}-{exp.current ? 'Present' : exp.endDate}</div>
                      <div 
                        className="text-sm"
                        style={{ color: data.primaryColor }}
                      >
                        {exp.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Describe your responsibilities and achievements
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Creative Template (Curved Teal Design - Third Reference)
const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden" style={{ width: '794px', height: '1123px' }}>
      {/* Curved Background Design */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 794 1123" preserveAspectRatio="none">
        <path
          d="M0,0 L250,0 Q300,100 250,200 L0,300 Z"
          fill={data.primaryColor}
        />
        <path
          d="M0,300 L200,300 Q250,400 200,500 L0,600 Z"
          fill={data.secondaryColor}
        />
        <path
          d="M0,900 L794,800 L794,1123 L0,1123 Z"
          fill={data.primaryColor}
        />
      </svg>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {data.personalInfo.fullName?.toUpperCase() || 'ADRIAN RAFAEL'}
          </h1>
          <h2 className="text-xl text-white/90">
            {data.personalInfo.jobTitle || 'Software Engineer'}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Profile Image */}
            {data.personalInfo.profileImage && (
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
                  <img
                    src={data.personalInfo.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">CONTACT</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: data.accentColor }}
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{data.personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: data.accentColor }}
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{data.personalInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: data.accentColor }}
                  >
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{data.personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: data.accentColor }}
                  >
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{data.personalInfo.website || 'www.helpshared.com'}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">SKILLS</h3>
              <div className="space-y-3">
                {data.skills.slice(0, 4).map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-white text-sm mb-1">
                      <span>{skill}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: data.accentColor,
                          width: `${85 + Math.random() * 15}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">LANGUAGES</h3>
              <div className="space-y-3">
                {data.languages.map((lang) => (
                  <div key={lang.id}>
                    <div className="flex justify-between text-white text-sm mb-1">
                      <span>{lang.name}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: data.accentColor,
                          width: lang.proficiency.includes('Native') ? '100%' : 
                                lang.proficiency.includes('Professional') ? '80%' : '60%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">HOBBIES</h3>
              <div className="grid grid-cols-2 gap-3">
                {data.interests.slice(0, 4).map((interest) => (
                  <div key={interest.id} className="text-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                      style={{ backgroundColor: data.accentColor }}
                    >
                      <span className="text-white text-sm">{interest.icon || '🎯'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Columns */}
          <div className="col-span-2 space-y-8">
            {/* Summary */}
            <div>
              <div 
                className="text-white font-bold text-lg mb-4 pb-2"
                style={{ 
                  background: `linear-gradient(90deg, ${data.primaryColor} 0%, ${data.accentColor} 100%)`,
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)'
                }}
              >
                <div className="px-4 py-2">SUMMARY</div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.summary}
              </p>
            </div>

            {/* Education */}
            <div>
              <div 
                className="text-white font-bold text-lg mb-4 pb-2"
                style={{ 
                  background: `linear-gradient(90deg, ${data.primaryColor} 0%, ${data.accentColor} 100%)`,
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)'
                }}
              >
                <div className="px-4 py-2">EDUCATION</div>
              </div>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{edu.institution.toUpperCase()}</h4>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: data.primaryColor }}
                        />
                        <span className="font-bold">{edu.degree}</span>
                      </div>
                      <div className="text-sm text-gray-600">{edu.location}</div>
                      <div className="text-sm text-gray-500">
                        {edu.description || 'Completed education with excellent performance'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{edu.graduationDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div>
              <div 
                className="text-white font-bold text-lg mb-4 pb-2"
                style={{ 
                  background: `linear-gradient(90deg, ${data.primaryColor} 0%, ${data.accentColor} 100%)`,
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)'
                }}
              >
                <div className="px-4 py-2">WORK EXPERIENCE</div>
              </div>
              <div className="space-y-6">
                {data.workExperience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{exp.company.toUpperCase()}</h4>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: data.primaryColor }}
                          />
                          <span className="font-bold">{exp.position}</span>
                        </div>
                        <div className="text-sm text-gray-600">{exp.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{exp.startDate}-{exp.current ? 'Present' : exp.endDate}</div>
                        <div 
                          className="text-sm"
                          style={{ color: data.primaryColor }}
                        >
                          {exp.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      Job title as Project Manager - Describe your responsibilities and achievements
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-8 text-white text-sm">
          WWW.HELPSHARED.COM
        </div>
      </div>
    </div>
  );
};

// Colorful Template (Dual Color - Fourth Reference)
const ColorfulTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const isOrange = data.primaryColor.includes('orange') || data.primaryColor === '#f59e0b';
  
  return (
    <div className="w-full h-full bg-white flex" style={{ width: '794px', height: '1123px' }}>
      {/* Left Section */}
      <div className="w-1/3 relative">
        {/* Header with photo */}
        <div 
          className="h-64 p-6 text-white relative"
          style={{ backgroundColor: data.primaryColor }}
        >
          <div className="absolute top-6 right-6">
            {data.personalInfo.profileImage && (
              <div className="w-20 h-20 rounded border-2 border-white overflow-hidden">
                <img
                  src={data.personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-2xl font-bold">{data.personalInfo.fullName?.toUpperCase() || 'YOUR NAME'}</h1>
            <h2 className="text-lg opacity-90">{data.personalInfo.jobTitle || 'CREATIVE DESIGNER'}</h2>
          </div>
        </div>

        {/* About Me */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: data.primaryColor }}
            >
              <User className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">ABOUT ME</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Work Experience */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: data.primaryColor }}
            >
              <Building className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">WORK EXPERIENCE</h3>
          </div>
          <div className="space-y-4">
            {data.workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="font-bold text-sm text-gray-900">{exp.position}</div>
                <div className="text-sm text-gray-600">{exp.company} | {exp.location}</div>
                <div className="text-xs text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: data.primaryColor }}
            >
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">EDUCATION</h3>
          </div>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="font-bold text-sm text-gray-900">{edu.institution}</div>
                <div className="text-sm text-gray-600">{edu.degree}</div>
                <div className="text-xs text-gray-500">{edu.graduationDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div 
          className="mx-6 p-4 rounded-lg"
          style={{ backgroundColor: '#2d3748', color: 'white' }}
        >
          <h3 className="font-bold text-sm mb-3">BASIC INFO</h3>
          <div className="space-y-2 text-xs">
            <div>Height: 6 feet 4 inch</div>
            <div>Weight: 143 Lbs (65 kg)</div>
            <div>Phone: {data.personalInfo.phone}</div>
            <div>Email: {data.personalInfo.email}</div>
            <div>Website: {data.personalInfo.website || 'www.helpshared.com'}</div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-2/3 p-8">
        {/* Pro Skills */}
        <div className="mb-8">
          <div 
            className="text-white font-bold text-lg mb-4 p-3 rounded-lg"
            style={{ backgroundColor: data.primaryColor }}
          >
            PRO SKILLS
          </div>
          <div className="grid grid-cols-2 gap-6">
            {data.skills.slice(0, 6).map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{skill}</span>
                  <span className="text-gray-500">90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: data.primaryColor,
                      width: `${80 + Math.random() * 20}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional sections would continue here... */}
      </div>
    </div>
  );
};

// Executive Template (Clean Professional)
const ExecutiveTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white p-8" style={{ width: '794px', height: '1123px' }}>
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: data.primaryColor }}>
        {data.personalInfo.profileImage && (
          <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden border-2" style={{ borderColor: data.primaryColor }}>
            <img
              src={data.personalInfo.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        <h2 className="text-xl" style={{ color: data.primaryColor }}>
          {data.personalInfo.jobTitle || 'Professional Title'}
        </h2>
        
        {/* Contact Info */}
        <div className="flex justify-center gap-8 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>{data.personalInfo.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span>{data.personalInfo.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{data.personalInfo.location}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Skills */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: data.primaryColor }}>
              SKILLS
            </h3>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="text-sm text-gray-700 py-1">
                  • {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: data.primaryColor }}>
              EDUCATION
            </h3>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-sm">{edu.degree}</div>
                  <div className="text-sm text-gray-600">{edu.institution}</div>
                  <div className="text-xs text-gray-500">{edu.graduationDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: data.primaryColor }}>
              PROFESSIONAL SUMMARY
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* Work Experience */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: data.primaryColor }}>
              WORK EXPERIENCE
            </h3>
            <div className="space-y-6">
              {data.workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{exp.position}</h4>
                      <p className="text-gray-600">{exp.company} • {exp.location}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.achievements.length > 0 && (
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                          <span 
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: data.primaryColor }}
                          />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};