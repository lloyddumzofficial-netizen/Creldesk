import React, { useState, useRef, useEffect } from 'react';
import { Download, Type, Square, Circle, Palette, Undo, Redo } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color: string;
  selected: boolean;
}

export const LogoEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'rectangle' | 'circle'>('text');
  const [textInput, setTextInput] = useState('Your Logo');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      ctx.fillStyle = element.color;
      ctx.strokeStyle = element.selected ? '#14b8a6' : 'transparent';
      ctx.lineWidth = 2;

      if (element.type === 'text' && element.text) {
        ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        ctx.fillText(element.text, element.x, element.y);
        if (element.selected) {
          const metrics = ctx.measureText(element.text);
          ctx.strokeRect(element.x - 2, element.y - (element.fontSize || 24) - 2, 
                        metrics.width + 4, (element.fontSize || 24) + 4);
        }
      } else if (element.type === 'rectangle') {
        ctx.fillRect(element.x, element.y, element.width, element.height);
        if (element.selected) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
      } else if (element.type === 'circle') {
        ctx.beginPath();
        ctx.arc(element.x + element.width / 2, element.y + element.height / 2, 
                element.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        if (element.selected) {
          ctx.stroke();
        }
      }
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [elements]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: CanvasElement = {
      id: crypto.randomUUID(),
      type: selectedTool,
      x,
      y,
      width: selectedTool === 'text' ? 100 : 100,
      height: selectedTool === 'text' ? fontSize : 100,
      text: selectedTool === 'text' ? textInput : undefined,
      fontSize: selectedTool === 'text' ? fontSize : undefined,
      fontFamily: selectedTool === 'text' ? fontFamily : undefined,
      color,
      selected: false,
    };

    const newElements = [...elements.map(el => ({ ...el, selected: false })), newElement];
    setElements(newElements);
    addToHistory(newElements);
  };

  const selectElement = (id: string) => {
    const newElements = elements.map(el => ({ ...el, selected: el.id === id }));
    setElements(newElements);
  };

  const deleteSelected = () => {
    const newElements = elements.filter(el => !el.selected);
    setElements(newElements);
    addToHistory(newElements);
  };

  const exportCanvas = (format: 'png' | 'svg' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'svg') {
      // Simple SVG export
      let svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
      svg += `<rect width="100%" height="100%" fill="white"/>`;
      
      elements.forEach(element => {
        if (element.type === 'text' && element.text) {
          svg += `<text x="${element.x}" y="${element.y}" font-family="${element.fontFamily}" font-size="${element.fontSize}" fill="${element.color}">${element.text}</text>`;
        } else if (element.type === 'rectangle') {
          svg += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.color}"/>`;
        } else if (element.type === 'circle') {
          svg += `<circle cx="${element.x + element.width/2}" cy="${element.y + element.height/2}" r="${element.width/2}" fill="${element.color}"/>`;
        }
      });
      
      svg += '</svg>';
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logo.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const link = document.createElement('a');
      link.download = `logo.${format}`;
      link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card padding="md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex space-x-2">
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

          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <Palette size={16} className="text-slate-500" />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo size={16} />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={deleteSelected}>
            Delete Selected
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Properties Panel */}
        <div className="space-y-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2">
          {selectedTool === 'text' && (
            <Card padding="md">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Text Properties</h3>
              <div className="space-y-3">
                <Input
                  label="Text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <Input
                  label="Font Size"
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          <Card padding="md">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Export</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => exportCanvas('png')} className="w-full">
                <Download size={16} className="mr-2" />
                Export PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCanvas('jpg')} className="w-full">
                <Download size={16} className="mr-2" />
                Export JPG
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCanvas('svg')} className="w-full">
                <Download size={16} className="mr-2" />
                Export SVG
              </Button>
            </div>
          </Card>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 lg:h-fit">
          <Card className="p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="border border-slate-200 dark:border-slate-600 rounded-lg cursor-crosshair w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Card>
        </div>
      </div>

      {/* Elements List */}
      {elements.length > 0 && (
        <Card padding="md">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Elements</h3>
          <div className="space-y-2">
            {elements.map((element) => (
              <div
                key={element.id}
                onClick={() => selectElement(element.id)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  element.selected 
                    ? 'bg-turquoise-100 dark:bg-turquoise-900' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {element.type === 'text' ? element.text : element.type}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {element.type} at ({Math.round(element.x)}, {Math.round(element.y)})
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};