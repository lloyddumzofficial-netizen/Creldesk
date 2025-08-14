import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Languages, 
  CheckCircle, 
  RefreshCw, 
  MessageSquare,
  Copy,
  Volume2,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Mic,
  MicOff,
  Bot,
  User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  mode?: 'chat' | 'paraphrase' | 'grammar' | 'translate';
  originalText?: string;
  language?: string;
}

interface CrelBotSettings {
  language: string;
  voiceEnabled: boolean;
  autoTranslate: boolean;
  grammarLevel: 'basic' | 'advanced' | 'professional';
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

const GRAMMAR_LEVELS = [
  { id: 'basic', name: 'Basic', description: 'Fix spelling and basic grammar' },
  { id: 'advanced', name: 'Advanced', description: 'Improve clarity and style' },
  { id: 'professional', name: 'Professional', description: 'Business-ready writing' },
];

export const CrelBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<'chat' | 'paraphrase' | 'grammar' | 'translate'>('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CrelBotSettings>({
    language: 'en',
    voiceEnabled: true,
    autoTranslate: false,
    grammarLevel: 'advanced',
  });
  const [apiConnected, setApiConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Check for API key on component mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    setApiConnected(!!apiKey);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      type: 'bot',
      content: "Hello! I'm CrelBot, your AI-powered communication assistant. I can help you with:\n\n🗣️ **Chat** - Have natural conversations and get answers\n📝 **Paraphrase** - Rewrite text in different styles\n✅ **Grammar** - Check and correct your writing\n🌍 **Translate** - Convert text between languages\n\nWhat would you like to do today?",
      timestamp: new Date(),
      mode: 'chat'
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (content: string, type: 'user' | 'bot', mode?: typeof currentMode, originalText?: string, language?: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
      mode: mode || currentMode,
      originalText,
      language
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateAIResponse = async (userInput: string, mode: typeof currentMode): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey && apiConnected) {
      try {
        return await callOpenAI(userInput, mode, apiKey);
      } catch (error) {
        console.error('OpenAI API error:', error);
        toast.error('API Error', 'Falling back to offline mode');
        // Fall back to simulation
      }
    }
    
    // Enhanced simulation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    switch (mode) {
      case 'paraphrase':
        return generateParaphrase(userInput);
      case 'grammar':
        return generateGrammarCorrection(userInput);
      case 'translate':
        return generateTranslation(userInput, settings.language);
      case 'chat':
      default:
        return generateChatResponse(userInput);
    }
  };

  const callOpenAI = async (userInput: string, mode: typeof currentMode, apiKey: string): Promise<string> => {
    const systemPrompts = {
      chat: "You are CrelBot, an AI assistant for CrelDesk productivity suite. Be helpful, concise, and professional.",
      paraphrase: "Rewrite the following text in multiple styles (professional, casual, formal). Provide clear alternatives.",
      grammar: "Check the following text for grammar errors and provide corrections with explanations.",
      translate: `Translate the following text to ${LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}. Provide context and confidence level.`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompts[mode] },
          { role: 'user', content: userInput }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not process your request.';
  };

  const generateParaphrase = (text: string): string => {
    const styles = [
      { name: 'Professional', result: `Here's a professional version:\n\n"${text.replace(/\b\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))}"` },
      { name: 'Casual', result: `Here's a more casual version:\n\n"${text.toLowerCase().replace(/\./g, '!')}"` },
      { name: 'Formal', result: `Here's a formal version:\n\n"${text.replace(/can't/g, 'cannot').replace(/won't/g, 'will not')}"` }
    ];
    
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    return `I've paraphrased your text in a ${randomStyle.name.toLowerCase()} style:\n\n${randomStyle.result}\n\n**Alternative versions:**\n• Concise: "${text.split(' ').slice(0, Math.max(5, text.split(' ').length - 3)).join(' ')}..."\n• Expanded: "${text} This approach offers several advantages and considerations worth exploring."`;
  };

  const generateGrammarCorrection = (text: string): string => {
    const corrections = [
      { original: /\bi\b/g, corrected: 'I' },
      { original: /\bdont\b/g, corrected: "don't" },
      { original: /\bcant\b/g, corrected: "can't" },
      { original: /\bwont\b/g, corrected: "won't" },
      { original: /\bteh\b/g, corrected: 'the' },
      { original: /\brecieve\b/g, corrected: 'receive' },
    ];

    let correctedText = text;
    const foundErrors: string[] = [];

    corrections.forEach(correction => {
      if (correction.original.test(text)) {
        correctedText = correctedText.replace(correction.original, correction.corrected);
        foundErrors.push(`"${correction.original.source.replace(/\\b/g, '').replace(/\\/g, '')}" → "${correction.corrected}"`);
      }
    });

    if (foundErrors.length === 0) {
      return `✅ **Great job!** Your text looks grammatically correct.\n\n**Original:** "${text}"\n\n**Suggestions for improvement:**\n• Consider varying sentence length for better flow\n• Use active voice when possible\n• Check for consistent tense usage`;
    }

    return `✅ **Grammar Check Complete**\n\n**Corrected text:** "${correctedText}"\n\n**Corrections made:**\n${foundErrors.map(error => `• ${error}`).join('\n')}\n\n**Writing tips:**\n• Always capitalize "I"\n• Use apostrophes in contractions\n• Double-check commonly misspelled words`;
  };

  const generateTranslation = (text: string, targetLang: string): string => {
    const language = LANGUAGES.find(lang => lang.code === targetLang);
    const translations: Record<string, string> = {
      'hello': { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao' }[targetLang] || 'hello',
      'thank you': { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie' }[targetLang] || 'thank you',
      'goodbye': { es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', it: 'arrivederci' }[targetLang] || 'goodbye',
    };

    // Simple word replacement for demo
    let translatedText = text.toLowerCase();
    Object.entries(translations).forEach(([english, foreign]) => {
      translatedText = translatedText.replace(new RegExp(english, 'gi'), foreign);
    });

    return `🌍 **Translation to ${language?.name || 'Unknown'}** ${language?.flag || ''}\n\n**Original (English):** "${text}"\n\n**Translated:** "${translatedText}"\n\n**Language Info:**\n• Target: ${language?.name || 'Unknown'}\n• Confidence: 95%\n• Context: General`;
  };

  const generateChatResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm CrelBot, your AI communication assistant. I'm here to help you with conversations, paraphrasing, grammar checking, and translations. How can I assist you today?";
    }
    
    if (lowerInput.includes('help')) {
      return "I'd be happy to help! Here's what I can do:\n\n🗣️ **Chat Mode** - Have natural conversations and get answers\n📝 **Paraphrase Mode** - Rewrite text in different styles\n✅ **Grammar Mode** - Check and correct writing\n🌍 **Translate Mode** - Convert between languages\n\nJust switch modes using the buttons above, or ask me anything!";
    }
    
    if (lowerInput.includes('paraphrase') || lowerInput.includes('rewrite')) {
      return "To paraphrase text, switch to Paraphrase mode using the button above, then paste or type the text you'd like me to rewrite. I can create professional, casual, or formal versions!";
    }
    
    if (lowerInput.includes('grammar') || lowerInput.includes('correct')) {
      return "For grammar checking, switch to Grammar mode and I'll analyze your text for errors, suggest improvements, and provide writing tips to make your communication more effective!";
    }
    
    if (lowerInput.includes('translate') || lowerInput.includes('language')) {
      return "I can translate text between multiple languages! Switch to Translate mode, select your target language in settings, and I'll provide accurate translations with context information.";
    }

    if (lowerInput.includes('creldesk') || lowerInput.includes('tools')) {
      return "CrelDesk is an amazing productivity suite! It includes tools for logo design, resume building, invoice generation, PDF compression, screen recording, and much more. I'm part of this ecosystem to help with your communication needs. What would you like to know about CrelDesk's tools?";
    }
    
    return "That's an interesting point! I'm here to help with your communication needs. Feel free to ask me questions, request paraphrasing, grammar checks, or translations. I can also chat about CrelDesk's tools and features. What would you like to work on?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await simulateAIResponse(userMessage, currentMode);
      addMessage(response, 'bot', currentMode, currentMode !== 'chat' ? userMessage : undefined);
    } catch (error) {
      addMessage("I apologize, but I encountered an error processing your request. Please try again.", 'bot');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const clearChat = () => {
    setMessages([]);
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      type: 'bot',
      content: "Chat cleared! I'm ready to help you again. What would you like to do?",
      timestamp: new Date(),
      mode: 'chat'
    };
    setMessages([welcomeMessage]);
  };

  const getModeIcon = (mode: typeof currentMode) => {
    switch (mode) {
      case 'chat': return MessageSquare;
      case 'paraphrase': return RefreshCw;
      case 'grammar': return CheckCircle;
      case 'translate': return Languages;
    }
  };

  const getModeColor = (mode: typeof currentMode) => {
    switch (mode) {
      case 'chat': return 'from-blue-500 to-blue-600';
      case 'paraphrase': return 'from-purple-500 to-purple-600';
      case 'grammar': return 'from-green-500 to-green-600';
      case 'translate': return 'from-orange-500 to-orange-600';
    }
  };

  // Animated background variants
  const backgroundVariants = {
    animate: {
      background: [
        'linear-gradient(45deg, #f0f9ff, #e0f2fe, #f0f9ff)',
        'linear-gradient(90deg, #e0f2fe, #f0f9ff, #e0f2fe)',
        'linear-gradient(135deg, #f0f9ff, #e0f2fe, #f0f9ff)',
        'linear-gradient(180deg, #e0f2fe, #f0f9ff, #e0f2fe)',
        'linear-gradient(225deg, #f0f9ff, #e0f2fe, #f0f9ff)',
      ],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        variants={backgroundVariants}
        animate="animate"
        className="absolute inset-0 opacity-60 dark:opacity-30"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute border border-primary-300 dark:border-primary-600 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 p-4 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/Creldesk.png" 
                  alt="CrelDesk Logo" 
                  className="h-10 w-auto max-w-[180px] object-contain"
                  width="180"
                  height="40"
                />
                <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CrelBot</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">AI Communication Assistant</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings size={18} />
              </Button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="max-w-6xl mx-auto mt-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {(['chat', 'paraphrase', 'grammar', 'translate'] as const).map((mode) => {
                const Icon = getModeIcon(mode);
                const isActive = currentMode === mode;
                
                return (
                  <motion.button
                    key={mode}
                    onClick={() => setCurrentMode(mode)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 shadow-sm",
                      isActive 
                        ? `bg-gradient-to-r ${getModeColor(mode)} text-white shadow-lg` 
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium capitalize">{mode}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-6xl mx-auto mt-6"
              >
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          Translation Language
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 transition-all duration-200"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          Grammar Level
                        </label>
                        <select
                          value={settings.grammarLevel}
                          onChange={(e) => setSettings(prev => ({ ...prev, grammarLevel: e.target.value as any }))}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 transition-all duration-200"
                        >
                          {GRAMMAR_LEVELS.map(level => (
                            <option key={level.id} value={level.id}>
                              {level.name} - {level.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.voiceEnabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                            className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 transition-all duration-200"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice Output</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoTranslate}
                            onChange={(e) => setSettings(prev => ({ ...prev, autoTranslate: e.target.checked }))}
                            className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 transition-all duration-200"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-translate</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-6">
          <div className="h-[calc(100vh-280px)] overflow-y-auto space-y-6 mb-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                  "flex items-start space-x-4",
                  message.type === 'user' ? "flex-row-reverse space-x-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0",
                  message.type === 'user' 
                    ? "bg-gradient-to-br from-slate-500 to-slate-600" 
                    : "bg-gradient-to-br from-primary-500 to-primary-600"
                )}>
                  {message.type === 'user' ? (
                    <User size={20} className="text-white" />
                  ) : (
                    <Bot size={20} className="text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  "flex-1 max-w-[80%]",
                  message.type === 'user' ? "text-right" : ""
                )}>
                  <div className={cn(
                    "rounded-3xl px-6 py-4 shadow-sm backdrop-blur-sm border",
                    message.type === 'user'
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-400"
                      : "bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border-slate-200/50 dark:border-slate-700/50"
                  )}>
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-200/50 dark:border-slate-600/50">
                        <Bot size={16} className="text-primary-500" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {message.mode || 'chat'} mode
                        </span>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/30 dark:border-slate-600/30">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                        >
                          <Copy size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        </button>
                        {settings.voiceEnabled && (
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                            <Volume2 size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl px-6 py-4 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      CrelBot is thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="p-6">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message CrelBot${currentMode !== 'chat' ? ` (${currentMode} mode)` : ''}...`}
                    className="w-full px-4 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 transition-all duration-200 text-sm leading-relaxed"
                    rows={3}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} className="text-white" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="w-14 h-10 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>•</span>
                  <span className={cn(
                    "flex items-center space-x-1",
                    apiConnected ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", apiConnected ? "bg-green-500" : "bg-amber-500")} />
                    <span>{apiConnected ? "AI Connected" : "Offline Mode"}</span>
                  </span>
                  <span>•</span>
                  <span className="capitalize font-medium text-primary-600 dark:text-primary-400">
                    {currentMode} mode active
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {currentMode === 'translate' && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <Languages size={12} />
                      <span>→ {LANGUAGES.find(l => l.code === settings.language)?.flag} {LANGUAGES.find(l => l.code === settings.language)?.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};