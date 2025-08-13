import React, { useState, useCallback } from 'react';
import { RefreshCw, Copy, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

export const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });

  const generatePassword = useCallback(() => {
    let charset = '';
    
    if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeNumbers) charset += '0123456789';
    if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    
    if (options.excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()\/\\'"~,;<>.]/g, '');
    }

    if (!charset) {
      setPassword('');
      return;
    }

    let result = '';
    for (let i = 0; i < options.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(result);
  }, [options]);

  React.useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const getStrengthLevel = (pwd: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 16) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 5) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 6) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrengthLevel(password);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      console.log('Password copied to clipboard');
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generated Password */}
      <Card padding="lg" className="bg-gradient-to-r from-turquoise-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Shield className="text-turquoise-500" size={20} />
            <span>Generated Password</span>
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy size={16} />
            </Button>
            <Button size="sm" onClick={generatePassword}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            readOnly
            className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
            placeholder="Generated password will appear here..."
          />
        </div>

        {/* Password Strength */}
        {password && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Password Strength</span>
              <span className={cn("text-sm font-medium", 
                strength.level <= 2 ? "text-red-600" : 
                strength.level <= 3 ? "text-yellow-600" : "text-green-600"
              )}>
                {strength.label}
              </span>
            </div>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    i < strength.level ? strength.color : "bg-slate-200 dark:bg-slate-600"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Password Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Length */}
        <Card padding="md">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Password Length</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="4"
                max="128"
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
              <div className="w-12 text-center font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {options.length}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {[8, 12, 16, 20, 24].map((len) => (
                <button
                  key={len}
                  onClick={() => setOptions({ ...options, length: len })}
                  className={cn(
                    "px-3 py-1 text-sm rounded transition-colors",
                    options.length === len
                      ? "bg-turquoise-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Character Options */}
        <Card padding="md">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Character Types</h4>
          <div className="space-y-3">
            {[
              { key: 'includeUppercase', label: 'Uppercase (A-Z)', example: 'ABCDEF' },
              { key: 'includeLowercase', label: 'Lowercase (a-z)', example: 'abcdef' },
              { key: 'includeNumbers', label: 'Numbers (0-9)', example: '123456' },
              { key: 'includeSymbols', label: 'Symbols', example: '!@#$%^' },
            ].map((option) => (
              <label key={option.key} className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {option.example}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options[option.key as keyof PasswordOptions] as boolean}
                  onChange={(e) => setOptions({ ...options, [option.key]: e.target.checked })}
                  className="w-4 h-4 text-turquoise-600 bg-gray-100 border-gray-300 rounded focus:ring-turquoise-500 dark:focus:ring-turquoise-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            ))}
          </div>
        </Card>
      </div>

      {/* Advanced Options */}
      <Card padding="md">
        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Advanced Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Exclude Similar Characters
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Avoid i, l, 1, L, o, 0, O
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
              className="w-4 h-4 text-turquoise-600 bg-gray-100 border-gray-300 rounded focus:ring-turquoise-500 dark:focus:ring-turquoise-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Exclude Ambiguous Symbols
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Avoid {`{ } [ ] ( ) / \\ ' " ~ , ; < >`}
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
              className="w-4 h-4 text-turquoise-600 bg-gray-100 border-gray-300 rounded focus:ring-turquoise-500 dark:focus:ring-turquoise-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>
        </div>
      </Card>
    </div>
  );
};