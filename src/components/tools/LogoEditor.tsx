import React, { useState, useRef, useEffect } from 'react';
import { Download, Type, Square, Circle, Palette, Undo, Redo, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const LogoEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'rectangle' | 'circle'>('text');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentText, setCurrentText] = useState('Your Logo');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth - 32; // Account for padding
          const maxWidth = Math.min(containerWidth, 800);
          const aspectRatio = 4 / 3;
          const height = maxWidth / aspectRatio;
          
          setCanvasSize({ width: maxWidth, height: Math.min(height, 600) });
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw shapes
    shapeElements.forEach(shape => {
      ctx.fillStyle = shape.color;
      if (shape.type === 'rectangle') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw text elements
    textElements.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(element.text, element.x, element.y);
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [textElements, shapeElements, canvasSize]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedTool === 'text') {
      const newText: TextElement = {
        id: crypto.randomUUID(),
        text: currentText,
        x,
        y,
        fontSize,
        color: currentColor,
        fontFamily,
      };
      setTextElements([...textElements, newText]);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      const newShape: ShapeElement = {
        id: crypto.randomUUID(),
        type: selectedTool,
        x: x - 50,
        y: y - 25,
        width: 100,
        height: selectedTool === 'circle' ? 100 : 50,
        color: currentColor,
      };
      setShapeElements([...shapeElements, newShape]);
    }
  };

  const downloadLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'logo.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    setTextElements([]);
    setShapeElements([]);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl p-4 min-h-[400px]">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onClick={handleCanvasClick}
              className="border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-crosshair bg-white shadow-lg max-w-full h-auto"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                aspectRatio: `${canvasSize.width} / ${canvasSize.height}`
              }}
            />
          </div>
        </div>
        
        {/* Canvas Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedTool === 'text' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('text')}
            >
              <Type size={16} />
            </Button>
            <Button
              variant={selectedTool === 'rectangle' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('rectangle')}
            >
              <Square size={16} />
            </Button>
            <Button
              variant={selectedTool === 'circle' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('circle')}
            >
              <Circle size={16} />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              Clear
            </Button>
            <Button size="sm" onClick={downloadLogo}>
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-full lg:w-80 space-y-4">
        <Card padding="md">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
            <Palette size={16} />
            <span>Properties</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <Input
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            {selectedTool === 'text' && (
              <>
                <Input
                  label="Text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Enter text"
                />
                
                <Input
                  label="Font Size"
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                  min="12"
                  max="200"
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Canvas Size
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Width"
              type="number"
              value={canvasSize.width}
              onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
              min="200"
              max="2000"
            />
            <Input
              label="Height"
              type="number"
              value={canvasSize.height}
              onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
              min="150"
              max="2000"
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Quick Sizes:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Square', w: 600, h: 600 },
                { name: 'Wide', w: 800, h: 400 },
                { name: 'Standard', w: 800, h: 600 },
                { name: 'Portrait', w: 400, h: 600 },
              ].map((size) => (
                <button
                  key={size.name}
                  onClick={() => setCanvasSize({ width: size.w, height: size.h })}
                  className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  {size.name}
                  <br />
                  <span className="text-slate-500 dark:text-slate-400">{size.w}×{size.h}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Elements
          </h3>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {textElements.map((element, index) => (
              <div key={element.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <span className="text-sm truncate flex-1">{element.text}</span>
                <button
                  onClick={() => setTextElements(textElements.filter(e => e.id !== element.id))}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  ×
                </button>
              </div>
            ))}
            
            {shapeElements.map((element, index) => (
              <div key={element.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <span className="text-sm capitalize flex-1">{element.type}</span>
                <button
                  onClick={() => setShapeElements(shapeElements.filter(e => e.id !== element.id))}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {textElements.length === 0 && shapeElements.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Click on the canvas to add elements
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};