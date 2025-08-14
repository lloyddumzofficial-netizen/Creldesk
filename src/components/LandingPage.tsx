import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { AuthModal } from './auth/AuthModal';

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Animated background particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  const features = [
    {
      icon: Zap,
      title: 'Professional Tools',
      description: 'Access premium editing, design, and productivity tools in one place'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your projects and data are protected with enterprise-grade security'
    },
    {
      icon: Sparkles,
      title: 'All-in-One Suite',
      description: 'Everything you need for professional work - no more switching between apps'
    }
  ];

  const tools = [
    'Photo Editor', 'Logo Designer', 'Resume Builder', 'Invoice Generator',
    'PDF Compressor', 'Screen Recorder', 'QR Generator', 'Password Manager'
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Futuristic Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-300 dark:text-primary-700"/>
                </pattern>
                <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.1"/>
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" className="text-primary-400 dark:text-primary-600"/>
            </svg>
          </div>

          {/* Floating Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-primary-400 dark:bg-primary-500 opacity-60"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, -10, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Animated Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M0,100 Q250,50 500,100 T1000,100"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path
              d="M0,200 Q300,150 600,200 T1200,200"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 4, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path
              d="M0,300 Q400,250 800,300 T1600,300"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 5, delay: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00a6fb" stopOpacity="0"/>
                <stop offset="50%" stopColor="#00a6fb" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#00a6fb" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Glowing Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary-400 dark:bg-primary-500 opacity-20 blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-primary-300 dark:bg-primary-600 opacity-15 blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 8,
              delay: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full bg-primary-500 dark:bg-primary-400 opacity-25 blur-lg"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 4,
              delay: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Header */}
        <header className="relative z-20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/Creldesk.png" 
                alt="Creldesk" 
                className="h-12 w-auto max-w-[33%]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                onClick={() => setShowAuthModal(true)}
                className="text-sm"
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  All you need.
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    In one desk.
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  The ultimate professional toolkit for creators, freelancers, and businesses. 
                  Access premium tools for design, productivity, and content creation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button 
                  size="lg" 
                  onClick={() => setShowAuthModal(true)}
                  className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Free to start • No credit card required
                </p>
              </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} hover padding="lg" className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon size={32} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </motion.div>

            {/* Tools Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mt-24"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Professional Tools at Your Fingertips
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Everything you need for professional work, from design to productivity
                </p>
              </div>

              <Card padding="lg" className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-primary-100 dark:border-primary-900">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tools.map((tool, index) => (
                    <motion.div
                      key={tool}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.2 + (index * 0.1) }}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                    >
                      <CheckCircle size={16} className="text-primary-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {tool}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-24 text-center"
            >
              <Card padding="lg" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Ready to boost your productivity?
                  </h2>
                  <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                    Join thousands of professionals who trust Creldesk for their daily workflow
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white text-primary-600 hover:bg-slate-50 text-lg px-8 py-4 shadow-xl"
                  >
                    Start Your Journey
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              © 2025 Creldesk. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};