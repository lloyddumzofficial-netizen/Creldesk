import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Send, Sparkles, Zap, FileText, Palette } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface CrelbotProps {
  onToolSelect?: (toolId: string) => void;
}

export const Crelbot: React.FC<CrelbotProps> = ({ onToolSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCurrentTool } = useAppStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show greeting when component mounts
  useEffect(() => {
    if (!hasGreeted) {
      setTimeout(() => {
        setIsOpen(true);
        addBotMessage(
          "Hello! I'm Crelbot, your Creldesk assistant. I can help you navigate tools, create professional documents, and answer questions about the platform. How can I assist you today?",
          [
            "Show me all tools",
            "Help with Resume Builder",
            "Create a QR code",
            "Generate an invoice"
          ]
        );
        setHasGreeted(true);
      }, 2000);
    }
  }, [hasGreeted]);

  const addBotMessage = (content: string, suggestions?: string[]) => {
    const message: Message = {
      id: crypto.randomUUID(),
      type: 'bot',
      content,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = async (duration: number = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const getAIResponse = async (userInput: string): Promise<{ content: string; suggestions?: string[] }> => {
    const input = userInput.toLowerCase();
    
    // Enhanced greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return {
        content: "Hello! I'm Crelbot, your intelligent Creldesk assistant. I can help you navigate tools, answer questions about features, provide tips for productivity, and guide you through any task. What would you like to work on today?",
        suggestions: ["Show me all tools", "Help with productivity", "Design assistance", "Business tools"]
      };
    }

    // Enhanced help responses
    if (input.includes('what can you do') || input.includes('capabilities') || input.includes('features')) {
      return {
        content: "I'm here to make your Creldesk experience seamless! I can:\n\n• Guide you through any tool or feature\n• Provide step-by-step tutorials\n• Suggest workflows for your projects\n• Answer questions about file formats and compatibility\n• Help with troubleshooting\n• Recommend tools based on your needs\n• Share productivity tips and best practices\n\nJust ask me anything!",
        suggestions: ["Tool recommendations", "Productivity tips", "File format help", "Troubleshooting"]
      };
    }

    // Enhanced tool recommendations
    if (input.includes('recommend') || input.includes('suggest') || input.includes('best tool') || input.includes('which tool')) {
      if (input.includes('design') || input.includes('logo') || input.includes('graphic')) {
        return {
          content: "For design work, I recommend:\n\n🎨 **Logo Editor** - Perfect for creating professional logos with shapes, text, and Bezier curves\n🖼️ **Photopea Editor** - Full-featured photo editing with Photoshop-like capabilities\n🎨 **Color Picker** - Essential for maintaining brand consistency\n\nWhat type of design project are you working on?",
          suggestions: ["Open Logo Editor", "Open Photopea Editor", "Color Picker", "Design tips"]
        };
      }
      
      if (input.includes('business') || input.includes('professional') || input.includes('client')) {
        return {
          content: "For business and client work, these tools are essential:\n\n📄 **Resume Builder** - Create professional resumes with PDF export\n💼 **Proposal Generator** - Win more clients with professional proposals\n🧾 **Invoice Generator** - Streamline billing with auto-calculations\n📊 **Task Board** - Organize projects with Kanban-style management\n\nWhich aspect of your business needs attention?",
          suggestions: ["Open Invoice Generator", "Open Proposal Generator", "Task Board", "Business tips"]
        };
      }
      
      if (input.includes('productivity') || input.includes('organize') || input.includes('efficient')) {
        return {
          content: "Boost your productivity with these powerful tools:\n\n⏰ **Pomodoro Timer** - Stay focused with time management techniques\n📋 **Task Board** - Organize work with drag-and-drop simplicity\n🔐 **Password Generator** - Secure your accounts efficiently\n📁 **File Converter** - Streamline file format conversions\n\nWhat's your biggest productivity challenge?",
          suggestions: ["Open Pomodoro Timer", "Open Task Board", "File management", "Time management tips"]
        };
      }
      
      return {
        content: "I'd be happy to recommend the perfect tools for you! Could you tell me more about what you're trying to accomplish? Are you working on:\n\n• Design and creative projects\n• Business and client work\n• Productivity and organization\n• Technical tasks and utilities",
        suggestions: ["Design projects", "Business work", "Productivity tools", "Technical utilities"]
      };
    }

    // Tool-specific responses
    if (input.includes('resume') || input.includes('cv')) {
      return {
        content: "The Resume Builder is perfect for creating professional resumes! Here's what makes it powerful:\n\n✅ **Form-based interface** - Easy step-by-step process\n✅ **Professional templates** - Clean, ATS-friendly designs\n✅ **PDF export** - High-quality downloads\n✅ **Auto-save** - Never lose your progress\n\n**Pro tip:** Focus on quantifiable achievements and use action verbs to make your experience stand out!",
        suggestions: ["Open Resume Builder", "Resume writing tips", "ATS optimization", "Export options"]
      };
    }
    
    if (input.includes('qr') || input.includes('qr code')) {
      return {
        content: "The QR Code Generator is incredibly versatile! You can create QR codes for:\n\n🔗 **URLs** - Direct links to websites\n📧 **Email addresses** - Auto-compose emails\n📱 **Phone numbers** - One-tap calling\n📶 **WiFi networks** - Instant connection sharing\n📝 **Plain text** - Any message or info\n\n**Customization options:** Adjust size, colors, error correction levels, and add logos!",
        suggestions: ["Open QR Generator", "WiFi QR codes", "Business card QR", "Custom styling"]
      };
    }
    
    if (input.includes('logo') || input.includes('design')) {
      return {
        content: "The Logo Editor is a powerful design tool for creating professional logos! Features include:\n\n🎨 **Vector graphics** - Scalable, crisp designs\n✏️ **Text tools** - Custom fonts and styling\n🔷 **Shape library** - Geometric and organic shapes\n📐 **Bezier curves** - Precise custom paths\n🎯 **Alignment tools** - Perfect positioning\n\n**Design tip:** Keep it simple, memorable, and scalable. Great logos work in both color and black & white!",
        suggestions: ["Open Logo Editor", "Design principles", "Color theory", "Brand identity"]
      };
    }
    
    if (input.includes('invoice') || input.includes('billing')) {
      return {
        content: "The Invoice Generator streamlines your billing process with professional features:\n\n📅 **Auto-dates** - Current date and 30-day due dates\n🧮 **Auto-calculations** - Subtotals, taxes, and totals\n📄 **PDF export** - Professional, printable invoices\n💼 **Client management** - Save client details\n📊 **Item tracking** - Detailed line items\n\n**Business tip:** Always include clear payment terms and due dates to ensure faster payments!",
        suggestions: ["Open Invoice Generator", "Payment terms guide", "Tax calculations", "Client management"]
      };
    }
    
    if (input.includes('proposal')) {
      return {
        content: "The Proposal Generator helps you win more clients with professional proposals! Key sections include:\n\n📋 **Project overview** - Clear problem and solution\n🎯 **Scope of work** - Detailed deliverables\n📅 **Timeline** - Realistic milestones\n💰 **Investment** - Transparent pricing\n📜 **Terms** - Clear expectations\n\n**Winning tip:** Focus on the client's benefits and outcomes, not just what you'll do. Show the value you bring!",
        suggestions: ["Open Proposal Generator", "Proposal writing tips", "Pricing strategies", "Client psychology"]
      };
    }
    
    if (input.includes('pdf') || input.includes('compress')) {
      return {
        content: "The PDF Compressor optimizes your files without sacrificing quality! Here's how it works:\n\n📁 **Smart compression** - Reduces file size intelligently\n⚖️ **Quality control** - Choose your balance of size vs quality\n⚡ **Fast processing** - Quick compression in your browser\n🔒 **Privacy-first** - Files processed locally, not uploaded\n\n**Use cases:** Email attachments, web uploads, storage optimization, and faster sharing!",
        suggestions: ["Open PDF Compressor", "Compression levels", "File size limits", "Quality comparison"]
      };
    }
    
    if (input.includes('password') || input.includes('security')) {
      return {
        content: "The Password Generator creates ultra-secure passwords to protect your accounts! Features:\n\n🔐 **Customizable length** - 4 to 128 characters\n🔤 **Character types** - Letters, numbers, symbols\n🚫 **Exclusion options** - Avoid similar or ambiguous characters\n📊 **Strength meter** - Real-time security assessment\n💾 **Quick copy** - One-click clipboard copying\n\n**Security tip:** Use unique passwords for every account and consider a password manager!",
        suggestions: ["Open Password Generator", "Password security", "Two-factor auth", "Password managers"]
      };
    }
    
    if (input.includes('color') || input.includes('picker')) {
      return {
        content: "The Color Picker is essential for designers and brand consistency! Powerful features:\n\n🎨 **Multiple formats** - HEX, RGB, HSL values\n🎯 **Precise selection** - Fine-tune with sliders\n📋 **One-click copy** - Instant clipboard copying\n🌈 **Palette generation** - Create harmonious color schemes\n✅ **Accessibility** - WCAG contrast ratio checking\n\n**Design tip:** Use the 60-30-10 rule: 60% primary, 30% secondary, 10% accent colors!",
        suggestions: ["Open Color Picker", "Color theory basics", "Accessibility guidelines", "Brand colors"]
      };
    }
    
    if (input.includes('timer') || input.includes('pomodoro') || input.includes('productivity')) {
      return {
        content: "The Pomodoro Timer boosts focus and productivity using the proven Pomodoro Technique! Features:\n\n⏰ **Customizable intervals** - Work and break durations\n📊 **Session tracking** - Monitor your productivity\n🔔 **Smart notifications** - Browser alerts and sounds\n📈 **Progress visualization** - See your focus streaks\n⚙️ **Flexible settings** - Adapt to your workflow\n\n**Productivity tip:** During breaks, step away from screens and do light physical activity to recharge!",
        suggestions: ["Open Pomodoro Timer", "Focus techniques", "Break activities", "Productivity hacks"]
      };
    }

    // File format and technical help
    if (input.includes('file format') || input.includes('convert') || input.includes('export')) {
      return {
        content: "I can help with file formats and conversions! Creldesk supports:\n\n🖼️ **Images:** PNG, JPG, SVG, WebP\n📄 **Documents:** PDF, HTML, DOCX\n🎵 **Audio:** MP3, WAV, OGG\n🎥 **Video:** WebM, MP4\n📊 **Data:** JSON, CSV\n\nThe File Converter handles PNG↔JPG and PDF↔DOCX conversions seamlessly!",
        suggestions: ["Open File Converter", "Supported formats", "Quality settings", "Batch conversion"]
      };
    }

    // Troubleshooting help
    if (input.includes('not working') || input.includes('error') || input.includes('problem') || input.includes('issue')) {
      return {
        content: "I'm here to help troubleshoot! Common solutions:\n\n🔄 **Refresh the page** - Solves most temporary issues\n🌐 **Check browser compatibility** - Chrome, Firefox, Safari, Edge\n📱 **Try different device** - Desktop vs mobile\n🔒 **Allow permissions** - Camera, microphone, clipboard access\n💾 **Clear browser cache** - Remove stored data\n\nWhat specific issue are you experiencing?",
        suggestions: ["Browser compatibility", "Permission settings", "Clear cache", "Contact support"]
      };
    }

    // Workflow and tips
    if (input.includes('workflow') || input.includes('process') || input.includes('how to')) {
      return {
        content: "I love helping optimize workflows! Here are some proven strategies:\n\n📋 **Plan first** - Use Task Board to organize projects\n⏰ **Time block** - Use Pomodoro Timer for focused work\n🎨 **Design system** - Create consistent colors and fonts\n📁 **File organization** - Use clear naming conventions\n🔄 **Iterate quickly** - Make small improvements continuously\n\nWhat type of workflow would you like to optimize?",
        suggestions: ["Project planning", "Design workflows", "Time management", "File organization"]
      };
    }
    
    if (input.includes('tools') || input.includes('all') || input.includes('show me')) {
      return {
        content: "Creldesk is your complete professional toolkit! Here's what's available:\n\n🎨 **Creative Tools:**\n• Logo Editor - Professional logo design\n• Photopea Editor - Advanced photo editing\n• Color Picker - Perfect color selection\n\n💼 **Business Tools:**\n• Resume Builder - Professional resumes\n• Invoice Generator - Streamlined billing\n• Proposal Generator - Win more clients\n\n⚡ **Productivity Tools:**\n• Task Board - Project organization\n• Pomodoro Timer - Focus enhancement\n• Password Generator - Security management\n\n🔧 **Utility Tools:**\n• QR Code Generator - Quick sharing\n• PDF Compressor - File optimization\n• File Converter - Format flexibility\n• Screen Recorder - Capture workflows\n• Audio Visualizer - Creative audio\n\nWhich category interests you most?",
        suggestions: ["Creative tools", "Business tools", "Productivity tools", "Utility tools"]
      };
    }
    
    if (input.includes('help') || input.includes('how') || input.includes('guide')) {
      return {
        content: "I'm your comprehensive Creldesk guide! I can provide:\n\n📚 **Step-by-step tutorials** - Detailed walkthroughs for any tool\n💡 **Pro tips** - Advanced techniques and shortcuts\n🎯 **Best practices** - Industry-standard approaches\n🔧 **Troubleshooting** - Quick solutions to common issues\n📈 **Workflow optimization** - Streamline your processes\n🎨 **Design guidance** - Create professional-quality work\n\nWhat specific help do you need today?",
        suggestions: ["Tool tutorials", "Design guidance", "Workflow tips", "Troubleshooting"]
      };
    }
    
    if (input.includes('freelancer') || input.includes('business') || input.includes('tips')) {
      return {
        content: "Essential freelancer success strategies:\n\n💼 **Professional Presentation:**\n• Create branded proposals and invoices\n• Design a memorable logo and consistent colors\n• Build a professional portfolio\n\n⏰ **Time & Project Management:**\n• Use Pomodoro Technique for focus\n• Organize projects with Task Board\n• Set clear deadlines and milestones\n\n🔒 **Security & Organization:**\n• Generate strong, unique passwords\n• Backup important files regularly\n• Use professional email signatures\n\n💰 **Business Growth:**\n• Track time and expenses accurately\n• Follow up on proposals promptly\n• Ask for testimonials and referrals\n\nWhich area would you like to focus on?",
        suggestions: ["Professional branding", "Time management", "Client communication", "Business security"]
      };
    }

    // Thank you responses
    if (input.includes('thank') || input.includes('thanks')) {
      return {
        content: "You're very welcome! I'm always here to help you make the most of Creldesk. Whether you need guidance on tools, workflow optimization, or creative inspiration, just ask. Is there anything else I can assist you with?",
        suggestions: ["Explore more tools", "Productivity tips", "Design help", "Business guidance"]
      };
    }

    // Goodbye responses
    if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      return {
        content: "Goodbye! It was great helping you today. Remember, I'm always here whenever you need assistance with Creldesk. Keep creating amazing work! 🚀",
        suggestions: ["Quick tool access", "Productivity tips", "Design inspiration", "Come back anytime"]
      };
    }
    
    // Default response
    return {
      content: "I'm here to help with anything Creldesk-related! You can ask me about:\n\n🛠️ **Specific tools** - How to use any feature\n💡 **Creative guidance** - Design tips and inspiration\n📈 **Productivity advice** - Workflow optimization\n🎯 **Best practices** - Professional standards\n🔧 **Technical support** - Troubleshooting help\n\nWhat would you like to explore today?",
      suggestions: ["Show all tools", "Creative guidance", "Productivity tips", "Technical help"]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    
    await simulateTyping();
    
    const response = await getAIResponse(userMessage);
    addBotMessage(response.content, response.suggestions);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle tool opening suggestions
    const toolMappings: Record<string, string> = {
      'Open Resume Builder': 'resume-builder',
      'Resume Builder': 'resume-builder',
      'Open Logo Editor': 'logo-editor',
      'Logo Editor': 'logo-editor',
      'Open Invoice Generator': 'invoice-generator',
      'Invoice Generator': 'invoice-generator',
      'Open Proposal Generator': 'proposal-generator',
      'Open QR Generator': 'qr-code-generator',
      'QR Generator': 'qr-code-generator',
      'Open PDF Compressor': 'pdf-compressor',
      'Open Password Generator': 'password-generator',
      'Open Color Picker': 'color-picker',
      'Open Pomodoro Timer': 'pomodoro-timer',
    };
    
    if (toolMappings[suggestion]) {
      setCurrentTool(toolMappings[suggestion]);
      addUserMessage(suggestion);
      addBotMessage(`Great! I've opened the ${suggestion.replace('Open ', '')} for you. You can start creating right away!`);
      return;
    }
    
    // Handle other suggestions as regular messages
    addUserMessage(suggestion);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={toggleChat}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageCircle size={24} className="text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]",
              isMinimized && "h-16"
            )}
          >
            <Card className="h-full shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Crelbot</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your Creldesk Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={minimizeChat}>
                    <Minimize2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closeChat}>
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <div className="flex flex-col h-96">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={cn(
                        "flex",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}>
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          message.type === 'user'
                            ? "bg-primary-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        )}>
                          <p>{message.content}</p>
                          
                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="mt-3 space-y-1">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block w-full text-left px-3 py-1.5 text-xs rounded-lg bg-white/20 hover:bg-white/30 dark:bg-slate-600/50 dark:hover:bg-slate-600/70 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about Creldesk..."
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        size="sm"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};