import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Timer, Coffee, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [totalWorkTime, setTotalWorkTime] = useState(0); // in seconds

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          
          // Track work time
          if (currentMode === 'work') {
            setTotalWorkTime(total => total + 1);
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(`${currentMode === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: currentMode === 'work' ? 'Time for a break!' : 'Time to get back to work!',
        icon: '/favicon.ico'
      });
    }

    // Switch modes
    if (currentMode === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setCurrentMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setCurrentMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setCurrentMode('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const toggleTimer = () => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentMode('work');
    setTimeLeft(settings.workDuration * 60);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleTimerComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgress = (): number => {
    const totalTime = currentMode === 'work' 
      ? settings.workDuration * 60
      : currentMode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeInfo = () => {
    switch (currentMode) {
      case 'work':
        return { name: 'Work Session', icon: Target, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' };
      case 'shortBreak':
        return { name: 'Short Break', icon: Coffee, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900' };
      case 'longBreak':
        return { name: 'Long Break', icon: Coffee, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900' };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Pomodoro Timer</h2>
        <p className="text-slate-600 dark:text-slate-400">Stay focused with the Pomodoro Technique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card padding="lg" className={`text-center ${modeInfo.bgColor}`}>
            <div className="space-y-6">
              {/* Mode Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <ModeIcon size={24} className={modeInfo.color} />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {modeInfo.name}
                </h3>
              </div>

              {/* Timer Display */}
              <div className="relative">
                <div className="w-48 h-48 mx-auto relative">
                  {/* Progress Circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                      className={modeInfo.color}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Time Display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {Math.round(getProgress())}% complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button onClick={toggleTimer} size="lg">
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                  <span className="ml-2">{isRunning ? 'Pause' : 'Start'}</span>
                </Button>
                
                <Button variant="outline" onClick={resetTimer} size="lg">
                  <RotateCcw size={20} />
                </Button>
                
                <Button variant="outline" onClick={skipSession} size="lg">
                  Skip
                </Button>
              </div>

              {/* Session Info */}
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Session {completedSessions + 1} • 
                Next: {completedSessions % settings.sessionsUntilLongBreak === settings.sessionsUntilLongBreak - 1 ? 'Long Break' : 'Short Break'}
              </div>
            </div>
          </Card>
        </div>

        {/* Stats & Settings */}
        <div className="space-y-6">
          {/* Stats */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Completed Sessions</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{completedSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Work Time</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatDuration(totalWorkTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Current Streak</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {completedSessions % settings.sessionsUntilLongBreak}
                </span>
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={16} />
              </Button>
            </div>

            {showSettings && (
              <div className="space-y-4">
                <Input
                  label="Work Duration (minutes)"
                  type="number"
                  value={settings.workDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 25;
                    setSettings({ ...settings, workDuration: value });
                    if (currentMode === 'work' && !isRunning) {
                      setTimeLeft(value * 60);
                    }
                  }}
                  min="1"
                  max="60"
                />
                
                <Input
                  label="Short Break (minutes)"
                  type="number"
                  value={settings.shortBreakDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 5;
                    setSettings({ ...settings, shortBreakDuration: value });
                    if (currentMode === 'shortBreak' && !isRunning) {
                      setTimeLeft(value * 60);
                    }
                  }}
                  min="1"
                  max="30"
                />
                
                <Input
                  label="Long Break (minutes)"
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 15;
                    setSettings({ ...settings, longBreakDuration: value });
                    if (currentMode === 'longBreak' && !isRunning) {
                      setTimeLeft(value * 60);
                    }
                  }}
                  min="1"
                  max="60"
                />
                
                <Input
                  label="Sessions until Long Break"
                  type="number"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 4;
                    setSettings({ ...settings, sessionsUntilLongBreak: value });
                  }}
                  min="2"
                  max="10"
                />
              </div>
            )}
          </Card>

          {/* Tips */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Pomodoro Tips</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Focus on one task during work sessions</li>
              <li>• Take breaks away from your screen</li>
              <li>• Use breaks for light physical activity</li>
              <li>• Turn off notifications during work time</li>
              <li>• Track what you accomplish each session</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};