import React, { useState, useRef, useEffect } from 'react';
import { Download, Copy, Link, CreditCard, Wifi, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'payment';

interface QRData {
  type: QRType;
  content: string;
  wifi?: {
    ssid: string;
    password: string;
    security: 'WPA' | 'WEP' | 'nopass';
  };
  email?: {
    to: string;
    subject: string;
    body: string;
  };
  payment?: {
    amount: string;
    recipient: string;
    note: string;
  };
}

export const QRCodeGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<QRData>({
    type: 'url',
    content: 'https://creldesk.com',
  });
  const [size, setSize] = useState(256);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple QR code pattern generator (in production, use a proper QR library like qrcode.js)
  const generateQRPattern = (data: string) => {
    // This is a simplified QR pattern for demonstration
    // In production, use a proper QR code library
    const size = 25;
    const pattern: number[][] = [];
    
    // Initialize pattern
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        pattern[i][j] = 0;
      }
    }
    
    // Add finder patterns (corners)
    const addFinderPattern = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (x + i < size && y + j < size) {
            if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
              pattern[x + i][y + j] = 1;
            }
          }
        }
      }
    };
    
    addFinderPattern(0, 0);
    addFinderPattern(0, size - 7);
    addFinderPattern(size - 7, 0);
    
    // Add some data pattern based on content
    const hash = data.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    for (let i = 8; i < size - 8; i++) {
      for (let j = 8; j < size - 8; j++) {
        pattern[i][j] = Math.abs(hash + i * j) % 3 === 0 ? 1 : 0;
      }
    }
    
    return pattern;
  };

  const drawQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrContent = getQRContent();
    const pattern = generateQRPattern(qrContent);
    
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR pattern
    const cellSize = size / pattern.length;
    ctx.fillStyle = foregroundColor;
    
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if (pattern[i][j] === 1) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  const getQRContent = (): string => {
    switch (qrData.type) {
      case 'url':
      case 'text':
        return qrData.content;
      case 'wifi':
        if (qrData.wifi) {
          return `WIFI:T:${qrData.wifi.security};S:${qrData.wifi.ssid};P:${qrData.wifi.password};;`;
        }
        return '';
      case 'email':
        if (qrData.email) {
          return `mailto:${qrData.email.to}?subject=${encodeURIComponent(qrData.email.subject)}&body=${encodeURIComponent(qrData.email.body)}`;
        }
        return '';
      case 'payment':
        if (qrData.payment) {
          return `PAY:${qrData.payment.recipient}:${qrData.payment.amount}:${qrData.payment.note}`;
        }
        return '';
      default:
        return qrData.content;
    }
  };

  useEffect(() => {
    drawQRCode();
  }, [qrData, size, foregroundColor, backgroundColor]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getQRContent());
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const qrTypes = [
    { id: 'url', name: 'URL/Website', icon: Link },
    { id: 'wifi', name: 'WiFi Network', icon: Wifi },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payment', name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">QR Code Generator</h2>
        <p className="text-slate-600 dark:text-slate-400">Generate QR codes for URLs, WiFi, payments, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-4">
          {/* QR Type Selection */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">QR Code Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {qrTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setQrData({ ...qrData, type: type.id as QRType })}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      qrData.type === type.id
                        ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <IconComponent size={20} className={`mx-auto mb-1 ${
                      qrData.type === type.id ? 'text-turquoise-600 dark:text-turquoise-400' : 'text-slate-500'
                    }`} />
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{type.name}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Content Input */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Content</h3>
            
            {qrData.type === 'url' && (
              <Input
                label="URL"
                value={qrData.content}
                onChange={(e) => setQrData({ ...qrData, content: e.target.value })}
                placeholder="https://example.com"
              />
            )}

            {qrData.type === 'wifi' && (
              <div className="space-y-4">
                <Input
                  label="Network Name (SSID)"
                  value={qrData.wifi?.ssid || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    wifi: { ...qrData.wifi, ssid: e.target.value, password: qrData.wifi?.password || '', security: qrData.wifi?.security || 'WPA' }
                  })}
                  placeholder="MyWiFiNetwork"
                />
                <Input
                  label="Password"
                  type="password"
                  value={qrData.wifi?.password || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    wifi: { ...qrData.wifi, ssid: qrData.wifi?.ssid || '', password: e.target.value, security: qrData.wifi?.security || 'WPA' }
                  })}
                  placeholder="WiFi password"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Security</label>
                  <select
                    value={qrData.wifi?.security || 'WPA'}
                    onChange={(e) => setQrData({
                      ...qrData,
                      wifi: { ...qrData.wifi, ssid: qrData.wifi?.ssid || '', password: qrData.wifi?.password || '', security: e.target.value as 'WPA' | 'WEP' | 'nopass' }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password</option>
                  </select>
                </div>
              </div>
            )}

            {qrData.type === 'email' && (
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={qrData.email?.to || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    email: { ...qrData.email, to: e.target.value, subject: qrData.email?.subject || '', body: qrData.email?.body || '' }
                  })}
                  placeholder="recipient@example.com"
                />
                <Input
                  label="Subject"
                  value={qrData.email?.subject || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    email: { ...qrData.email, to: qrData.email?.to || '', subject: e.target.value, body: qrData.email?.body || '' }
                  })}
                  placeholder="Email subject"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    value={qrData.email?.body || ''}
                    onChange={(e) => setQrData({
                      ...qrData,
                      email: { ...qrData.email, to: qrData.email?.to || '', subject: qrData.email?.subject || '', body: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    rows={3}
                    placeholder="Email message"
                  />
                </div>
              </div>
            )}

            {qrData.type === 'payment' && (
              <div className="space-y-4">
                <Input
                  label="Recipient"
                  value={qrData.payment?.recipient || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    payment: { ...qrData.payment, recipient: e.target.value, amount: qrData.payment?.amount || '', note: qrData.payment?.note || '' }
                  })}
                  placeholder="Payment recipient"
                />
                <Input
                  label="Amount"
                  value={qrData.payment?.amount || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    payment: { ...qrData.payment, recipient: qrData.payment?.recipient || '', amount: e.target.value, note: qrData.payment?.note || '' }
                  })}
                  placeholder="0.00"
                />
                <Input
                  label="Note"
                  value={qrData.payment?.note || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    payment: { ...qrData.payment, recipient: qrData.payment?.recipient || '', amount: qrData.payment?.amount || '', note: e.target.value }
                  })}
                  placeholder="Payment note"
                />
              </div>
            )}
          </Card>

          {/* Customization */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Customization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Size</label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{size}px</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foreground</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview & Download */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <Card padding="lg">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">QR Code Preview</h3>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button onClick={downloadQR}>
                <Download size={16} className="mr-2" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy size={16} className="mr-2" />
                Copy Content
              </Button>
            </div>
          </Card>

          {/* Content Preview */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Generated Content</h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <code className="text-sm text-slate-700 dark:text-slate-300 break-all">
                {getQRContent() || 'Enter content to generate QR code'}
              </code>
            </div>
          </Card>

          {/* Quick Presets */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Quick Presets</h3>
            <div className="space-y-2">
              <button
                onClick={() => setQrData({ type: 'url', content: 'https://creldesk.com' })}
                className="w-full p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-turquoise-500 transition-colors"
              >
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">Website URL</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">https://creldesk.com</div>
              </button>
              
              <button
                onClick={() => setQrData({ 
                  type: 'wifi', 
                  content: '',
                  wifi: { ssid: 'MyWiFi', password: 'password123', security: 'WPA' }
                })}
                className="w-full p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-turquoise-500 transition-colors"
              >
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">WiFi Network</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Share WiFi credentials</div>
              </button>
              
              <button
                onClick={() => setQrData({ 
                  type: 'email', 
                  content: '',
                  email: { to: 'hello@creldesk.com', subject: 'Hello', body: 'Hi there!' }
                })}
                className="w-full p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-turquoise-500 transition-colors"
              >
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">Email Contact</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">hello@creldesk.com</div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};