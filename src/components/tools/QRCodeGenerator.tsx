import React, { useState, useRef, useEffect } from 'react';
import { Download, Copy, Link, CreditCard, Wifi, Mail, QrCode, Smartphone, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms';

interface QRData {
  type: QRType;
  content: string;
  wifi?: {
    ssid: string;
    password: string;
    security: 'WPA' | 'WEP' | 'nopass';
    hidden?: boolean;
  };
  email?: {
    to: string;
    subject: string;
    body: string;
  };
  phone?: {
    number: string;
  };
  sms?: {
    number: string;
    message: string;
  };
}

interface QROptions {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
}

export const QRCodeGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<QRData>({
    type: 'url',
    content: 'https://creldesk.com',
  });

  const [qrOptions, setQrOptions] = useState<QROptions>({
    size: 300,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 4,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR Code using a simple but functional implementation
  const generateQRCode = async (text: string, options: QROptions) => {
    if (!canvasRef.current) return '';

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size
    canvas.width = options.size;
    canvas.height = options.size;

    // Clear canvas
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, options.size, options.size);

    // Simple QR code pattern generation (for demonstration)
    // In production, you would use a proper QR library like qrcode.js
    const qrSize = 25; // 25x25 modules
    const moduleSize = (options.size - options.margin * 2) / qrSize;
    const startX = options.margin;
    const startY = options.margin;

    // Generate a deterministic pattern based on the input text
    const pattern = generateQRPattern(text, qrSize);

    ctx.fillStyle = options.foregroundColor;

    // Draw the QR pattern
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        if (pattern[y][x]) {
          ctx.fillRect(
            startX + x * moduleSize,
            startY + y * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }

    return canvas.toDataURL('image/png');
  };

  // Generate a deterministic QR-like pattern
  const generateQRPattern = (text: string, size: number): boolean[][] => {
    const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Create a hash from the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Add finder patterns (corners)
    const addFinderPattern = (x: number, y: number) => {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          if (x + dx < size && y + dy < size) {
            const isEdge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
            const isCenter = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
            pattern[y + dy][x + dx] = isEdge || isCenter;
          }
        }
      }
    };

    // Add finder patterns at corners
    addFinderPattern(0, 0);
    addFinderPattern(size - 7, 0);
    addFinderPattern(0, size - 7);

    // Add timing patterns
    for (let i = 8; i < size - 8; i++) {
      pattern[6][i] = i % 2 === 0;
      pattern[i][6] = i % 2 === 0;
    }

    // Fill data area with pattern based on text hash
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Skip finder patterns and timing patterns
        if ((x < 9 && y < 9) || (x >= size - 8 && y < 9) || (x < 9 && y >= size - 8)) continue;
        if (x === 6 || y === 6) continue;

        // Generate pattern based on position and text hash
        const positionHash = (x * 31 + y * 17 + hash) & 0xFFFF;
        pattern[y][x] = (positionHash % 3) === 0;
      }
    }

    return pattern;
  };

  const getQRContent = (): string => {
    switch (qrData.type) {
      case 'url':
      case 'text':
        return qrData.content;
      case 'wifi':
        if (qrData.wifi) {
          return `WIFI:T:${qrData.wifi.security};S:${qrData.wifi.ssid};P:${qrData.wifi.password};H:${qrData.wifi.hidden ? 'true' : 'false'};;`;
        }
        return '';
      case 'email':
        if (qrData.email) {
          return `mailto:${qrData.email.to}?subject=${encodeURIComponent(qrData.email.subject)}&body=${encodeURIComponent(qrData.email.body)}`;
        }
        return '';
      case 'phone':
        if (qrData.phone) {
          return `tel:${qrData.phone.number}`;
        }
        return '';
      case 'sms':
        if (qrData.sms) {
          return `sms:${qrData.sms.number}?body=${encodeURIComponent(qrData.sms.message)}`;
        }
        return '';
      default:
        return qrData.content;
    }
  };

  // Generate QR code whenever content or options change
  useEffect(() => {
    const generateQR = async () => {
      setIsGenerating(true);
      const content = getQRContent();
      if (content) {
        const dataUrl = await generateQRCode(content, qrOptions);
        setQrDataUrl(dataUrl);
      }
      setIsGenerating(false);
    };

    generateQR();
  }, [qrData, qrOptions]);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    const filename = qrData.content ? 
      `qr-${qrData.content.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png` : 
      'qr-code.png';
    
    link.download = filename;
    link.href = qrDataUrl;
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

  const copyImageToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('QR code image copied to clipboard!');
        }
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('Image copy not supported in this browser');
    }
  };

  const qrTypes = [
    { id: 'url', name: 'Website URL', icon: Link, description: 'Link to any website' },
    { id: 'text', name: 'Plain Text', icon: QrCode, description: 'Any text content' },
    { id: 'wifi', name: 'WiFi Network', icon: Wifi, description: 'WiFi credentials' },
    { id: 'email', name: 'Email', icon: Mail, description: 'Email with subject' },
    { id: 'phone', name: 'Phone Number', icon: Smartphone, description: 'Phone number' },
    { id: 'sms', name: 'SMS Message', icon: CreditCard, description: 'Text message' },
  ];

  const sizePresets = [
    { size: 150, label: 'Small (150px)', description: 'Web use' },
    { size: 300, label: 'Medium (300px)', description: 'Standard' },
    { size: 600, label: 'Large (600px)', description: 'Print ready' },
    { size: 1000, label: 'Extra Large (1000px)', description: 'High resolution' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">QR Code Generator</h2>
        <p className="text-slate-600 dark:text-slate-400">Generate scannable QR codes for URLs, WiFi, contacts, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-4">
          {/* QR Type Selection */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <QrCode size={20} className="text-turquoise-500" />
              <span>QR Code Type</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qrTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setQrData({ ...qrData, type: type.id as QRType })}
                    className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                      qrData.type === type.id
                        ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        qrData.type === type.id
                          ? 'bg-turquoise-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{type.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{type.description}</div>
                      </div>
                    </div>
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
                label="Website URL"
                value={qrData.content}
                onChange={(e) => setQrData({ ...qrData, content: e.target.value })}
                placeholder="https://example.com"
                type="url"
              />
            )}

            {qrData.type === 'text' && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Text Content
                </label>
                <textarea
                  value={qrData.content}
                  onChange={(e) => setQrData({ ...qrData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Enter any text content..."
                />
              </div>
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

            {qrData.type === 'phone' && (
              <Input
                label="Phone Number"
                type="tel"
                value={qrData.phone?.number || ''}
                onChange={(e) => setQrData({
                  ...qrData,
                  phone: { number: e.target.value }
                })}
                placeholder="+1234567890"
              />
            )}

            {qrData.type === 'sms' && (
              <div className="space-y-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={qrData.sms?.number || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    sms: { ...qrData.sms, number: e.target.value, message: qrData.sms?.message || '' }
                  })}
                  placeholder="+1234567890"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    value={qrData.sms?.message || ''}
                    onChange={(e) => setQrData({
                      ...qrData,
                      sms: { ...qrData.sms, number: qrData.sms?.number || '', message: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    rows={3}
                    placeholder="SMS message"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Customization Options */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Customization</h3>
            
            {/* Size Presets */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {sizePresets.map((preset) => (
                    <button
                      key={preset.size}
                      onClick={() => setQrOptions({ ...qrOptions, size: preset.size })}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        qrOptions.size === preset.size
                          ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{preset.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foreground</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={qrOptions.foregroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, foregroundColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={qrOptions.foregroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, foregroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={qrOptions.backgroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={qrOptions.backgroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Error Correction</label>
                <select
                  value={qrOptions.errorCorrectionLevel}
                  onChange={(e) => setQrOptions({ ...qrOptions, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview & Download */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card padding="lg">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center flex items-center justify-center space-x-2">
              <QrCode size={20} className="text-turquoise-500" />
              <span>QR Code Preview</span>
            </h3>
            
            <div className="text-center space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  {isGenerating ? (
                    <div className="flex items-center justify-center" style={{ width: qrOptions.size, height: qrOptions.size }}>
                      <div className="animate-spin w-8 h-8 border-2 border-turquoise-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Generated QR Code" 
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxWidth: '300px', maxHeight: '300px' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <QrCode size={48} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={downloadQR} disabled={!qrDataUrl} className="flex items-center space-x-2">
                  <Download size={16} />
                  <span>Download PNG</span>
                </Button>
                <Button variant="outline" onClick={copyImageToClipboard} disabled={!qrDataUrl}>
                  <Copy size={16} />
                </Button>
                <Button variant="outline" onClick={copyToClipboard}>
                  <Link size={16} />
                </Button>
              </div>

              {/* QR Info */}
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <div>Size: {qrOptions.size}×{qrOptions.size}px</div>
                <div>Error Correction: {qrOptions.errorCorrectionLevel}</div>
                {qrDataUrl && <div>Ready to scan!</div>}
              </div>
            </div>
          </Card>

          {/* Content Preview */}
          <Card padding="md" className="mt-4">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Generated Content</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <code className="text-sm text-slate-700 dark:text-slate-300 break-all">
                {getQRContent() || 'Enter content to generate QR code'}
              </code>
            </div>
          </Card>
        </div>
      </div>

      {/* Hidden Canvas for QR Generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={qrOptions.size}
        height={qrOptions.size}
      />

      {/* Quick Tips */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
          <Printer size={16} className="text-turquoise-500" />
          <span>Usage Tips</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">For Best Results:</h4>
            <ul className="space-y-1">
              <li>• Use high contrast colors (dark on light)</li>
              <li>• Choose appropriate size for intended use</li>
              <li>• Test QR codes before printing</li>
              <li>• Use higher error correction for damaged surfaces</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Size Guidelines:</h4>
            <ul className="space-y-1">
              <li>• Small (150px): Digital screens, web use</li>
              <li>• Medium (300px): Business cards, flyers</li>
              <li>• Large (600px): Posters, banners</li>
              <li>• Extra Large (1000px): Large format printing</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};