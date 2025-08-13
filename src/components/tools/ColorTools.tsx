import React, { useState } from 'react';
import { Copy, Palette, Eye, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export const ColorTools: React.FC = () => {
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: '#14b8a6',
    rgb: { r: 20, g: 184, b: 166 },
    hsl: { h: 174, s: 80, l: 40 }
  });
  
  const [palette, setPalette] = useState<Color[]>([]);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const updateColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setCurrentColor({ hex, rgb, hsl });
  };

  const generatePalette = () => {
    const baseHue = currentColor.hsl.h;
    const colors: Color[] = [];
    
    // Generate complementary and triadic colors
    const hues = [
      baseHue,
      (baseHue + 60) % 360,
      (baseHue + 120) % 360,
      (baseHue + 180) % 360,
      (baseHue + 240) % 360,
      (baseHue + 300) % 360
    ];

    hues.forEach(hue => {
      const hex = hslToHex(hue, currentColor.hsl.s, currentColor.hsl.l);
      const rgb = hexToRgb(hex);
      const hsl = { h: hue, s: currentColor.hsl.s, l: currentColor.hsl.l };
      colors.push({ hex, rgb, hsl });
    });

    setPalette(colors);
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`Copied: ${text}`);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getContrastRatio = (color1: Color, color2: Color): number => {
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1.rgb.r, color1.rgb.g, color1.rgb.b);
    const lum2 = getLuminance(color2.rgb.r, color2.rgb.g, color2.rgb.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const whiteColor: Color = { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } };
  const blackColor: Color = { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
  
  const contrastWithWhite = getContrastRatio(currentColor, whiteColor);
  const contrastWithBlack = getContrastRatio(currentColor, blackColor);

  return (
    <div className="space-y-6">
      {/* Color Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
            <Palette size={20} className="text-turquoise-500" />
            <span>Color Picker</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={currentColor.hex}
                onChange={(e) => updateColor(e.target.value)}
                className="w-20 h-20 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={currentColor.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentColor.hex)}
                  className="w-full"
                >
                  <Copy size={14} className="mr-2" />
                  Copy HEX
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  RGB
                </label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 text-xs text-slate-500">R</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={currentColor.rgb.r}
                      onChange={(e) => {
                        const r = parseInt(e.target.value);
                        const hex = `#${r.toString(16).padStart(2, '0')}${currentColor.rgb.g.toString(16).padStart(2, '0')}${currentColor.rgb.b.toString(16).padStart(2, '0')}`;
                        updateColor(hex);
                      }}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-right">{currentColor.rgb.r}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 text-xs text-slate-500">G</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={currentColor.rgb.g}
                      onChange={(e) => {
                        const g = parseInt(e.target.value);
                        const hex = `#${currentColor.rgb.r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${currentColor.rgb.b.toString(16).padStart(2, '0')}`;
                        updateColor(hex);
                      }}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-right">{currentColor.rgb.g}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 text-xs text-slate-500">B</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={currentColor.rgb.b}
                      onChange={(e) => {
                        const b = parseInt(e.target.value);
                        const hex = `#${currentColor.rgb.r.toString(16).padStart(2, '0')}${currentColor.rgb.g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                        updateColor(hex);
                      }}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-right">{currentColor.rgb.b}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  HSL
                </label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 text-xs text-slate-500">H</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={currentColor.hsl.h}
                      onChange={(e) => {
                        const h = parseInt(e.target.value);
                        const hex = hslToHex(h, currentColor.hsl.s, currentColor.hsl.l);
                        updateColor(hex);
                      }}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-right">{currentColor.hsl.h}°</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 text-xs text-slate-500">S</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentColor.hsl.s}
                      onChange={(e) => {
                        const s = parseInt(e.target.value);
                        const hex = hslToHex(currentColor.hsl.h, s, currentColor.hsl.l);
                        updateColor(hex);
                      }}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-right">{currentColor.hsl.s}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 text-xs text-slate-500">L</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentColor.hsl.l}
                      onChange={(e) => {
                        const l = parseInt(e.target.value);
                        const hex = hslToHex(currentColor.hsl.h, currentColor.hsl.s, l);
                        updateColor(hex);
                      }}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-right">{currentColor.hsl.l}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Color Information */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
            <Eye size={20} className="text-turquoise-500" />
            <span>Color Information</span>
          </h3>

          <div className="space-y-4">
            <div 
              className="w-full h-24 rounded-lg border border-slate-300 dark:border-slate-600"
              style={{ backgroundColor: currentColor.hex }}
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">HEX</div>
                <button
                  onClick={() => copyToClipboard(currentColor.hex)}
                  className="w-full px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {currentColor.hex}
                </button>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RGB</div>
                <button
                  onClick={() => copyToClipboard(`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`)}
                  className="w-full px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {currentColor.rgb.r},{currentColor.rgb.g},{currentColor.rgb.b}
                </button>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">HSL</div>
                <button
                  onClick={() => copyToClipboard(`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`)}
                  className="w-full px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {currentColor.hsl.h},{currentColor.hsl.s},{currentColor.hsl.l}
                </button>
              </div>
            </div>

            {/* Contrast Information */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Contrast Ratios</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-slate-300 rounded"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">White</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono">{contrastWithWhite.toFixed(2)}:1</span>
                    <span className={cn("ml-2 px-2 py-1 rounded text-xs", 
                      contrastWithWhite >= 7 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      contrastWithWhite >= 4.5 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {contrastWithWhite >= 7 ? "AAA" : contrastWithWhite >= 4.5 ? "AA" : "Fail"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-black border border-slate-300 rounded"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Black</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono">{contrastWithBlack.toFixed(2)}:1</span>
                    <span className={cn("ml-2 px-2 py-1 rounded text-xs", 
                      contrastWithBlack >= 7 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      contrastWithBlack >= 4.5 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {contrastWithBlack >= 7 ? "AAA" : contrastWithBlack >= 4.5 ? "AA" : "Fail"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Palette Generator */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Palette size={20} className="text-turquoise-500" />
            <span>Color Palette</span>
          </h3>
          <Button onClick={generatePalette}>
            Generate Palette
          </Button>
        </div>

        {palette.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {palette.map((color, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-full h-20 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setCurrentColor(color)}
                />
                <button
                  onClick={() => copyToClipboard(color.hex)}
                  className="mt-2 w-full text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {color.hex}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};