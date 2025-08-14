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
  Download,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Globe,
  BookOpen,
  Mic,
  MicOff
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      type: 'bot',
      content: "Hello! I'm CrelBot, your AI-powered communication assistant. I can help you with:\n\n🗣️ **Chat** - Have natural conversations\n📝 **Paraphrase** - Rewrite text in different styles\n✅ **Grammar** - Check and correct your writing\n🌍 **Translate** - Convert text between languages\n\nWhat would you like to do today?",
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
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

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
      return "Hello! I'm here to help you with all your communication needs. Whether you need to paraphrase text, check grammar, translate languages, or just have a conversation, I'm ready to assist!";
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
    
    return "That's an interesting point! I'm here to help with your communication needs. Feel free to ask me questions, request paraphrasing, grammar checks, or translations. What would you like to work on?";
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
      content: "Chat cleared! How can I help you today?",
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

  const backgroundVariants = {
    animate: {
      background: [
        'linear-gradient(45deg, #f0f9ff, #e0f2fe, #f0f9ff)',
        'linear-gradient(90deg, #e0f2fe, #f0f9ff, #e0f2fe)',
        'linear-gradient(135deg, #f0f9ff, #e0f2fe, #f0f9ff)',
      ],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50" : "relative"
    )}>
      {/* Animated Background */}
      <motion.div
        variants={backgroundVariants}
        animate="animate"
        className="absolute inset-0 opacity-50 dark:opacity-20"
      >
        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, -10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </motion.div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CrelBot</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI Communication Assistant</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="max-w-4xl mx-auto mt-4">
            <div className="flex flex-wrap gap-2">
              {(['chat', 'paraphrase', 'grammar', 'translate'] as const).map((mode) => {
                const Icon = getModeIcon(mode);
                const isActive = currentMode === mode;
                
                return (
                  <Button
                    key={mode}
                    onClick={() => setCurrentMode(mode)}
                    variant={isActive ? "primary" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 transition-all duration-200",
                      isActive && `bg-gradient-to-r ${getModeColor(mode)} text-white shadow-lg`
                    )}
                  >
                    <Icon size={16} />
                    <span className="capitalize">{mode}</span>
                  </Button>
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
                className="max-w-4xl mx-auto mt-4"
              >
                <Card padding="md" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Translation Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Grammar Level
                      </label>
                      <select
                        value={settings.grammarLevel}
                        onChange={(e) => setSettings(prev => ({ ...prev, grammarLevel: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                      >
                        {GRAMMAR_LEVELS.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.name} - {level.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.voiceEnabled}
                          onChange={(e) => setSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Voice Output</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoTranslate}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoTranslate: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Auto-translate</span>
                      </label>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-4">
          <div className="h-[calc(100vh-300px)] overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm",
                  message.type === 'user'
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                    : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                )}>
                  {message.type === 'bot' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {message.mode || 'chat'} mode
                      </span>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-600/50">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                      {settings.voiceEnabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Processing...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <div className="p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type your ${currentMode === 'chat' ? 'message' : `text to ${currentMode}`}...`}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:text-slate-100 transition-all duration-200"
                    rows={3}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Send size={20} className="text-white" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="w-12 h-8"
                  >
                    <RotateCcw size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>•</span>
                  <span className="capitalize">{currentMode} mode active</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentMode === 'translate' && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      → {LANGUAGES.find(l => l.code === settings.language)?.flag} {LANGUAGES.find(l => l.code === settings.language)?.name}
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