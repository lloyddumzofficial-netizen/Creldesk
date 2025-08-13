import React, { useState } from 'react';
import { Copy, Palette, Eye, Pipette } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export const ColorPicker: React.FC = () => {
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: '#14b8a6',
    rgb: { r: 20, g: 184, b: 166 },
    hsl: { h: 174, s: 80, l: 40 }
  });
  
  const [savedColors, setSavedColors] = useState<Color[]>([]);

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

  const updateColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setCurrentColor({ hex, rgb, hsl });
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${format} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const saveColor = () => {
    if (!savedColors.find(c => c.hex === currentColor.hex)) {
      setSavedColors([...savedColors, currentColor]);
    }
  };

  const removeColor = (hex: string) => {
    setSavedColors(savedColors.filter(c => c.hex !== hex));
  };

  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const generatePalette = () => {
    const baseHue = currentColor.hsl.h;
    const colors: Color[] = [];
    
    // Generate complementary and analogous colors
    const hues = [
      baseHue,
      (baseHue + 30) % 360,
      (baseHue + 60) % 360,
      (baseHue + 180) % 360, // Complementary
      (baseHue + 210) % 360,
      (baseHue + 240) % 360,
    ];

    hues.forEach(hue => {
      const hex = hslToHex(hue, currentColor.hsl.s, currentColor.hsl.l);
      const rgb = hexToRgb(hex);
      const hsl = { h: hue, s: currentColor.hsl.s, l: currentColor.hsl.l };
      colors.push({ hex, rgb, hsl });
    });

    setSavedColors(colors);
  };

  const colorFormats = [
    { label: 'HEX', value: currentColor.hex },
    { label: 'RGB', value: `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})` },
    { label: 'HSL', value: `hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)` },
    { label: 'CSS RGB', value: `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})` },
    { label: 'CSS HSL', value: `hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)` },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Color Picker</h2>
        <p className="text-slate-600 dark:text-slate-400">Pick colors, show hex values, and copy to clipboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Picker */}
        <Card padding="lg">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Pipette size={20} className="text-turquoise-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Color Picker</h3>
            </div>
            
            {/* Main Color Display */}
            <div 
              className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg mx-auto"
              style={{ backgroundColor: currentColor.hex }}
            />

            {/* Color Input */}
            <div className="flex items-center justify-center space-x-4">
              <input
                type="color"
                value={currentColor.hex}
                onChange={(e) => updateColor(e.target.value)}
                className="w-16 h-16 rounded-xl border-2 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  value={currentColor.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-lg text-center bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                />
              </div>
            </div>

            {/* RGB Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Red</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{currentColor.rgb.r}</span>
                </div>
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
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #000000, #ff0000)`
                  }}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Green</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{currentColor.rgb.g}</span>
                </div>
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
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #000000, #00ff00)`
                  }}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Blue</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{currentColor.rgb.b}</span>
                </div>
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
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #000000, #0000ff)`
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={saveColor} className="flex-1">
                Save Color
              </Button>
              <Button onClick={generatePalette} variant="outline" className="flex-1">
                <Palette size={16} className="mr-2" />
                Generate Palette
              </Button>
            </div>
          </div>
        </Card>

        {/* Color Information */}
        <Card padding="lg">
          <div className="flex items-center space-x-2 mb-6">
            <Eye size={20} className="text-turquoise-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Color Information</h3>
          </div>

          <div className="space-y-4">
            {colorFormats.map((format) => (
              <div key={format.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{format.label}</div>
                  <div className="font-mono text-slate-600 dark:text-slate-400 text-sm">{format.value}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(format.value, format.label)}
                >
                  <Copy size={14} />
                </Button>
              </div>
            ))}
          </div>

          {/* Color Preview on Different Backgrounds */}
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Preview on Backgrounds</h4>
            <div className="grid grid-cols-3 gap-2">
              {['#ffffff', '#000000', '#f1f5f9'].map((bg) => (
                <div
                  key={bg}
                  className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Saved Colors */}
      {savedColors.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Saved Colors</h3>
            <Button variant="outline" size="sm" onClick={() => setSavedColors([])}>
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {savedColors.map((color, index) => (
              <div key={index} className="group relative">
                <div
                  className="aspect-square rounded-xl cursor-pointer transition-transform hover:scale-105 border-2 border-slate-200 dark:border-slate-700"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setCurrentColor(color)}
                />
                <div className="mt-2 text-center">
                  <button
                    onClick={() => copyToClipboard(color.hex, 'HEX')}
                    className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    {color.hex}
                  </button>
                </div>
                <button
                  onClick={() => removeColor(color.hex)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Colors */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Quick Colors</h3>
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
          {[
            '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80',
            '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
            '#800000', '#804000', '#808000', '#408000', '#008000', '#008040',
            '#008080', '#004080', '#000080', '#400080', '#800080', '#800040',
          ].map((color) => (
            <button
              key={color}
              className="aspect-square rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => updateColor(color)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};