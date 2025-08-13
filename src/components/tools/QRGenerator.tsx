import React, { useState, useRef, useEffect } from 'react';
import { Download, Copy, Settings, Palette, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface QROptions {
  text: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  includeMargin: boolean;
}

export const QRGenerator: React.FC = () => {
  const [options, setOptions] = useState<QROptions>({
    text: 'https://creldesk.com',
    size: 256,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    includeMargin: true,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple QR code generation simulation (in production, use a proper QR library)
  const generateQR = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { size, foregroundColor, backgroundColor } = options;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Simple pattern simulation
    ctx.fillStyle = foregroundColor;
    const cellSize = size / 25;
    const pattern = [
      [1,1,1,1,1,1,1,0,0,1,0,1,0,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    ];

    pattern.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          ctx.fillRect(x * cellSize, (pattern.length + 14 + y) * cellSize, cellSize, cellSize);
          ctx.fillRect((row.length + 14 + x) * cellSize, y * cellSize, cellSize, cellSize);
        }
      });
    });

    setQrDataUrl(canvas.toDataURL());
  };

  useEffect(() => {
    generateQR();
  }, [options]);

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(options.text);
      // In production, show a toast notification
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Text or URL"
            value={options.text}
            onChange={(e) => setOptions({ ...options, text: e.target.value })}
            placeholder="Enter text or URL to encode"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Size (px)"
              type="number"
              min="128"
              max="1024"
              value={options.size}
              onChange={(e) => setOptions({ ...options, size: parseInt(e.target.value) || 256 })}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Error Correction
              </label>
              <select
                value={options.errorCorrectionLevel}
                onChange={(e) => setOptions({ 
                  ...options, 
                  errorCorrectionLevel: e.target.value as QROptions['errorCorrectionLevel'] 
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Foreground Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={options.foregroundColor}
                  onChange={(e) => setOptions({ ...options, foregroundColor: e.target.value })}
                  className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <Input
                  value={options.foregroundColor}
                  onChange={(e) => setOptions({ ...options, foregroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Background Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <Input
                  value={options.backgroundColor}
                  onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="flex flex-col items-center space-y-4">
          <Card className="p-6 bg-slate-50 dark:bg-slate-800">
            <canvas
              ref={canvasRef}
              className="border border-slate-200 dark:border-slate-600 rounded-lg"
              style={{ 
                maxWidth: '300px', 
                maxHeight: '300px',
                width: '100%',
                height: 'auto'
              }}
            />
          </Card>
          
          <div className="flex space-x-2">
            <Button onClick={downloadQR} className="flex items-center space-x-2">
              <Download size={16} />
              <span>Download</span>
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <Card padding="md">
        <div className="flex items-center space-x-2 mb-4">
          <Zap size={16} className="text-turquoise-500" />
          <h3 className="font-medium text-slate-900 dark:text-slate-100">Quick Presets</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setOptions({ ...options, text: 'https://creldesk.com' })}
            className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-turquoise-500 transition-colors text-left"
          >
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">Website URL</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">https://creldesk.com</div>
          </button>
          
          <button
            onClick={() => setOptions({ ...options, text: 'WIFI:T:WPA;S:MyNetwork;P:password123;;' })}
            className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-turquoise-500 transition-colors text-left"
          >
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">WiFi Network</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Network credentials</div>
          </button>
          
          <button
            onClick={() => setOptions({ ...options, text: 'mailto:hello@creldesk.com' })}
            className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-turquoise-500 transition-colors text-left"
          >
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">Email Address</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">hello@creldesk.com</div>
          </button>
        </div>
      </Card>
    </div>
  );
};