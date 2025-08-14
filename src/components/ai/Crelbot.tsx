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
    
    // Tool-specific responses
    if (input.includes('resume') || input.includes('cv')) {
      return {
        content: "I can help you create a professional resume! The Resume Builder lets you create form-based resumes with PDF export. You can add your experience, education, skills, and certifications.",
        suggestions: ["Open Resume Builder", "Resume tips", "Export formats"]
      };
    }
    
    if (input.includes('qr') || input.includes('qr code')) {
      return {
        content: "The QR Code Generator lets you create QR codes for URLs, text, emails, and more. You can also scan existing QR codes with your camera or upload QR images to decode them.",
        suggestions: ["Open QR Generator", "Scan QR code", "QR code tips"]
      };
    }
    
    if (input.includes('logo') || input.includes('design')) {
      return {
        content: "The Logo Editor helps you create professional logos with text, shapes, and Bezier curves. Perfect for branding your business or projects.",
        suggestions: ["Open Logo Editor", "Design tips", "Logo best practices"]
      };
    }
    
    if (input.includes('invoice') || input.includes('billing')) {
      return {
        content: "The Invoice Generator creates professional invoices with auto-dates, editable fields, and PDF export. Perfect for freelancers and businesses.",
        suggestions: ["Open Invoice Generator", "Invoice templates", "Payment terms"]
      };
    }
    
    if (input.includes('proposal')) {
      return {
        content: "The Proposal Generator helps you create professional project proposals with scope, timeline, budget, and terms. Great for winning new clients!",
        suggestions: ["Open Proposal Generator", "Proposal tips", "Client communication"]
      };
    }
    
    if (input.includes('pdf') || input.includes('compress')) {
      return {
        content: "The PDF Compressor reduces PDF file sizes while maintaining quality. Upload your PDF, choose compression level, and download the optimized version.",
        suggestions: ["Open PDF Compressor", "Compression tips", "File formats"]
      };
    }
    
    if (input.includes('password') || input.includes('security')) {
      return {
        content: "The Password Generator creates secure passwords with customizable length, symbols, and numbers. Essential for online security!",
        suggestions: ["Open Password Generator", "Security tips", "Password best practices"]
      };
    }
    
    if (input.includes('color') || input.includes('picker')) {
      return {
        content: "The Color Picker lets you select colors, view hex values, and copy to clipboard. Perfect for design work and branding consistency.",
        suggestions: ["Open Color Picker", "Color theory", "Design palettes"]
      };
    }
    
    if (input.includes('timer') || input.includes('pomodoro') || input.includes('productivity')) {
      return {
        content: "The Pomodoro Timer helps you stay focused with configurable work and break intervals. Great for productivity and time management!",
        suggestions: ["Open Pomodoro Timer", "Productivity tips", "Time management"]
      };
    }
    
    if (input.includes('tools') || input.includes('all') || input.includes('show me')) {
      return {
        content: "Creldesk offers professional tools for creators and freelancers: Resume Builder, Logo Editor, Invoice Generator, QR Code Generator, PDF Compressor, Password Generator, Color Picker, Pomodoro Timer, and more!",
        suggestions: ["Resume Builder", "Logo Editor", "Invoice Generator", "QR Generator"]
      };
    }
    
    if (input.includes('help') || input.includes('how') || input.includes('guide')) {
      return {
        content: "I'm here to help! You can ask me about any tool, request step-by-step guidance, or get tips for professional work. What would you like to know?",
        suggestions: ["Show all tools", "Getting started", "Best practices", "Freelancer tips"]
      };
    }
    
    if (input.includes('freelancer') || input.includes('business') || input.includes('tips')) {
      return {
        content: "Here are some freelancer tips: 1) Use professional invoices and proposals, 2) Create a strong brand with logos and consistent colors, 3) Stay organized with productivity tools, 4) Secure your accounts with strong passwords.",
        suggestions: ["Create invoice", "Design logo", "Generate password", "Time management"]
      };
    }
    
    // Default response
    return {
      content: "I can help you with any Creldesk tool! Try asking about resumes, logos, invoices, QR codes, or any other feature. What would you like to work on?",
      suggestions: ["Show all tools", "Resume Builder", "Logo Editor", "QR Generator"]
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