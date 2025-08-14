import React, { useState, useRef, useCallback } from 'react';
import { Download, Upload, X, Move, RotateCcw } from 'lucide-react';
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

export const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'JONATHON',
      email: 'jonathon@gmail.com',
      phone: '+852 123 456 789',
      location: 'Hong Kong',
      website: 'www.website.com',
      linkedin: 'jonathon@gmail.com',
    },
    objective: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    experience: [
      {
        id: '1',
        company: 'Company Name',
        position: 'Graphic Designer',
        startDate: '2018-01',
        endDate: '2020-12',
        current: false,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }
    ],
    education: [
      {
        id: '1',
        institution: 'Company Name',
        degree: 'B.A Graphic Design',
        field: 'Design',
        graduationDate: '2018-05',
        gpa: ''
      }
    ],
    skills: ['Graphic Design', 'Web Design', 'Print Design', 'Video Editing', 'After Effect'],
    certifications: []
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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

  const handleCropStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y
      });
    }
  };

  const handleCropMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - cropArea.width));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - cropArea.height));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handleCropEnd = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    if (!profilePhoto || !imageRef.current || !cropCanvasRef.current) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    canvas.width = 200;
    canvas.height = 200;
    
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      200,
      200
    );
    
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCroppedPhoto(croppedDataUrl);
    setShowCropModal(false);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setCroppedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const exportResume = () => {
    const resumeHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${resumeData.personalInfo.fullName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.4; color: #333; }
          .resume-container { display: flex; width: 210mm; height: 297mm; margin: 0 auto; background: white; }
          .left-column { width: 35%; background: #4a5568; color: white; padding: 40px 30px; }
          .right-column { width: 65%; padding: 40px 30px; background: white; }
          .profile-section { text-align: center; margin-bottom: 40px; }
          .profile-photo { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #f6ad55; margin: 0 auto 20px; object-fit: cover; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .title { font-size: 16px; color: #f6ad55; margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #f6ad55; }
          .contact-item { display: flex; align-items: center; margin-bottom: 10px; font-size: 12px; }
          .contact-icon { width: 16px; height: 16px; margin-right: 10px; background: #f6ad55; border-radius: 2px; }
          .award-item, .skill-item { margin-bottom: 15px; }
          .award-title { font-weight: bold; font-size: 13px; }
          .award-company { font-size: 12px; color: #cbd5e0; }
          .skill-name { font-size: 13px; margin-bottom: 5px; }
          .skill-bar { width: 100%; height: 4px; background: #2d3748; border-radius: 2px; margin-bottom: 5px; }
          .skill-fill { height: 100%; background: #f6ad55; border-radius: 2px; }
          .right-section { margin-bottom: 30px; }
          .right-section-title { font-size: 16px; font-weight: bold; color: #2d3748; margin-bottom: 15px; position: relative; }
          .right-section-title::before { content: ''; position: absolute; left: -20px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; background: #f6ad55; border-radius: 50%; }
          .experience-item, .education-item { margin-bottom: 20px; }
          .exp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
          .exp-position { font-weight: bold; font-size: 14px; }
          .exp-company { color: #666; font-size: 13px; }
          .exp-date { font-size: 12px; color: #999; }
          .exp-description { font-size: 13px; line-height: 1.5; color: #555; }
          .hobbies { display: flex; gap: 15px; margin-top: 10px; }
          .hobby-icon { width: 24px; height: 24px; background: #f6ad55; border-radius: 4px; }
          @media print { body { margin: 0; } .resume-container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="left-column">
            <div class="profile-section">
              ${croppedPhoto ? `<img src="${croppedPhoto}" alt="Profile" class="profile-photo">` : '<div class="profile-photo" style="background: #f6ad55;"></div>'}
              <div class="name">${resumeData.personalInfo.fullName}</div>
              <div class="title">GRAPHIC DESIGNER</div>
            </div>
            
            <div class="section">
              <div class="section-title">CONTACT</div>
              <div class="contact-item">
                <div class="contact-icon"></div>
                <span>${resumeData.personalInfo.phone}</span>
              </div>
              <div class="contact-item">
                <div class="contact-icon"></div>
                <span>${resumeData.personalInfo.email}</span>
              </div>
              <div class="contact-item">
                <div class="contact-icon"></div>
                <span>${resumeData.personalInfo.website || 'www.website.com'}</span>
              </div>
              <div class="contact-item">
                <div class="contact-icon"></div>
                <span>${resumeData.personalInfo.linkedin}</span>
              </div>
            </div>
            
            <div class="section" style="margin-top: 40px;">
              <div class="section-title">AWARD</div>
              <div class="award-item">
                <div class="award-title">Best Designer - Company</div>
                <div class="award-company">2020</div>
              </div>
              <div class="award-item">
                <div class="award-title">Best Freelancer - Company</div>
                <div class="award-company">2019</div>
              </div>
            </div>
            
            <div class="section" style="margin-top: 40px;">
              <div class="section-title">PRO SKILLS</div>
              ${resumeData.skills.map(skill => `
                <div class="skill-item">
                  <div class="skill-name">${skill}</div>
                  <div class="skill-bar">
                    <div class="skill-fill" style="width: 85%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="right-column">
            <div class="right-section">
              <div class="right-section-title">ABOUT ME</div>
              <p style="font-size: 13px; line-height: 1.6; color: #555;">${resumeData.objective}</p>
            </div>
            
            <div class="right-section">
              <div class="right-section-title">EXPERIENCE</div>
              ${resumeData.experience.map(exp => `
                <div class="experience-item">
                  <div class="exp-header">
                    <div>
                      <div class="exp-position">${exp.position}</div>
                      <div class="exp-company">${exp.company}</div>
                    </div>
                    <div class="exp-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  <div class="exp-description">${exp.description}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="right-section">
              <div class="right-section-title">EDUCATION</div>
              ${resumeData.education.map(edu => `
                <div class="education-item">
                  <div class="exp-header">
                    <div>
                      <div class="exp-position">${edu.degree}</div>
                      <div class="exp-company">${edu.institution}</div>
                    </div>
                    <div class="exp-date">${edu.graduationDate}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="right-section">
              <div class="right-section-title">REFERENCE</div>
              <div class="experience-item">
                <div class="exp-position">John Doe - Company Name</div>
                <div class="exp-company">Phone: +123 456 789</div>
                <div class="exp-company">Email: john@company.com</div>
              </div>
            </div>
            
            <div class="right-section">
              <div class="right-section-title">HOBBIES</div>
              <div class="hobbies">
                <div class="hobby-icon"></div>
                <div class="hobby-icon"></div>
                <div class="hobby-icon"></div>
                <div class="hobby-icon"></div>
                <div class="hobby-icon"></div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Resume Builder</h2>
        <Button onClick={exportResume}>
          <Download size={16} className="mr-2" />
          Download Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Profile Photo Upload */}
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
                    onClick={removePhoto}
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
                {croppedPhoto && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCropModal(true)}
                    className="ml-2"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Re-crop
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Personal Information</h3>
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

          {/* About Me */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">About Me</h3>
            <textarea
              value={resumeData.objective}
              onChange={(e) => setResumeData({ ...resumeData, objective: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              rows={4}
              placeholder="Write a brief summary about yourself..."
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
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-6">
          <Card padding="sm" className="bg-white">
            <h3 className="font-semibold text-slate-900 mb-4 px-4 pt-4">Resume Preview</h3>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
              <div className="flex h-full text-xs">
                {/* Left Column */}
                <div className="w-2/5 bg-slate-600 text-white p-6">
                  {/* Profile Section */}
                  <div className="text-center mb-8">
                    {croppedPhoto ? (
                      <img
                        src={croppedPhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-2 border-orange-400 mx-auto mb-3 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-2 border-orange-400 mx-auto mb-3 bg-orange-400"></div>
                    )}
                    <div className="font-bold text-lg mb-1">{resumeData.personalInfo.fullName}</div>
                    <div className="text-orange-400 text-sm">GRAPHIC DESIGNER</div>
                  </div>

                  {/* Contact */}
                  <div className="mb-8">
                    <div className="text-orange-400 font-bold mb-3">CONTACT</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-sm mr-2"></div>
                        <span>{resumeData.personalInfo.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-sm mr-2"></div>
                        <span>{resumeData.personalInfo.email}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-sm mr-2"></div>
                        <span>{resumeData.personalInfo.website || 'www.website.com'}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-sm mr-2"></div>
                        <span>{resumeData.personalInfo.linkedin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Awards */}
                  <div className="mb-8">
                    <div className="text-orange-400 font-bold mb-3">AWARD</div>
                    <div className="space-y-3">
                      <div>
                        <div className="font-bold text-xs">Best Designer - Company</div>
                        <div className="text-slate-300 text-xs">2020</div>
                      </div>
                      <div>
                        <div className="font-bold text-xs">Best Freelancer - Company</div>
                        <div className="text-slate-300 text-xs">2019</div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="text-orange-400 font-bold mb-3">PRO SKILLS</div>
                    <div className="space-y-3">
                      {resumeData.skills.slice(0, 5).map((skill, index) => (
                        <div key={index}>
                          <div className="text-xs mb-1">{skill}</div>
                          <div className="w-full h-1 bg-slate-700 rounded">
                            <div className="h-full bg-orange-400 rounded" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="w-3/5 p-6 bg-white">
                  {/* About Me */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div className="font-bold text-slate-700">ABOUT ME</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{resumeData.objective}</p>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div className="font-bold text-slate-700">EXPERIENCE</div>
                    </div>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="font-bold text-xs">{exp.position}</div>
                              <div className="text-slate-500 text-xs">{exp.company}</div>
                            </div>
                            <div className="text-slate-400 text-xs">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div className="font-bold text-slate-700">EDUCATION</div>
                    </div>
                    <div className="space-y-3">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-xs">{edu.degree}</div>
                            <div className="text-slate-500 text-xs">{edu.institution}</div>
                          </div>
                          <div className="text-slate-400 text-xs">{edu.graduationDate}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div className="font-bold text-slate-700">REFERENCE</div>
                    </div>
                    <div>
                      <div className="font-bold text-xs">John Doe - Company Name</div>
                      <div className="text-slate-500 text-xs">Phone: +123 456 789</div>
                      <div className="text-slate-500 text-xs">Email: john@company.com</div>
                    </div>
                  </div>

                  {/* Hobbies */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div className="font-bold text-slate-700">HOBBIES</div>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-4 h-4 bg-orange-400 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                onMouseMove={handleCropMove}
                onMouseUp={handleCropEnd}
                onMouseLeave={handleCropEnd}
              />
              
              <div
                className="absolute border-2 border-primary-500 bg-primary-500 bg-opacity-20 cursor-move"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                }}
                onMouseDown={handleCropStart}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Move size={24} className="text-primary-600" />
                </div>
              </div>
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
                <Button onClick={applyCrop}>
                  Apply Crop
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