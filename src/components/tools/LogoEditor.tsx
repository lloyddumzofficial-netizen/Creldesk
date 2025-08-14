import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Undo, Redo, Type, Square, Circle, Triangle, Palette, Move, RotateCw, Trash2, Copy, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';

interface Point {
  x: number;
  y: number;
}

interface Element {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  visible: boolean;
  opacity: number;
}

interface HistoryState {
  elements: Element[];
  selectedId: string | null;
}

type Tool = 'select' | 'text' | 'rectangle' | 'circle' | 'triangle';

export const LogoEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [], selectedId: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Canvas settings
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  // Tool properties
  const [fillColor, setFillColor] = useState('#14b8a6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');

  const selectedElement = elements.find(el => el.id === selectedId);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = { elements: [...elements], selectedId };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, selectedId, history, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setSelectedId(prevState.selectedId);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setSelectedId(nextState.selectedId);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Check if point is inside element
  const isPointInElement = (point: Point, element: Element): boolean => {
    return point.x >= element.x && 
           point.x <= element.x + element.width &&
           point.y >= element.y && 
           point.y <= element.y + element.height;
  };

  // Find element at point
  const findElementAtPoint = (point: Point): Element | null => {
    // Check from top to bottom (reverse order)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.visible && isPointInElement(point, element)) {
        return element;
      }
    }
    return null;
  };

  // Create new element
  const createElement = (type: Element['type'], x: number, y: number): Element => {
    const baseElement: Element = {
      id: generateId(),
      type,
      x,
      y,
      width: type === 'text' ? 100 : 100,
      height: type === 'text' ? fontSize + 10 : 100,
      rotation: 0,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      visible: true,
      opacity: 1,
    };

    if (type === 'text') {
      return {
        ...baseElement,
        text: 'Sample Text',
        fontSize,
        fontFamily,
        fontWeight,
        width: 120,
        height: fontSize + 10,
      };
    }

    return baseElement;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    setDragStart(point);

    if (currentTool === 'select') {
      const element = findElementAtPoint(point);
      if (element) {
        setSelectedId(element.id);
        setIsDrawing(true);
      } else {
        setSelectedId(null);
      }
    } else {
      // Create new element
      const newElement = createElement(currentTool, point.x, point.y);
      setElements(prev => [...prev, newElement]);
      setSelectedId(newElement.id);
      setIsDrawing(true);
      setCurrentTool('select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart) return;

    const point = getMousePos(e);
    const dx = point.x - dragStart.x;
    const dy = point.y - dragStart.y;

    if (currentTool === 'select' && selectedId) {
      // Move selected element
      setElements(prev => prev.map(el => 
        el.id === selectedId 
          ? { ...el, x: el.x + dx, y: el.y + dy }
          : el
      ));
      setDragStart(point);
    } else if (selectedId) {
      // Resize element being created
      setElements(prev => prev.map(el => 
        el.id === selectedId 
          ? { ...el, width: Math.abs(dx), height: Math.abs(dy) }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    setDragStart(null);
  };

  // Update selected element properties
  const updateSelectedElement = (updates: Partial<Element>) => {
    if (!selectedId) return;
    
    setElements(prev => prev.map(el => 
      el.id === selectedId ? { ...el, ...updates } : el
    ));
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
    saveToHistory();
  };

  // Duplicate selected element
  const duplicateSelected = () => {
    if (!selectedElement) return;
    const newElement = { 
      ...selectedElement, 
      id: generateId(), 
      x: selectedElement.x + 20, 
      y: selectedElement.y + 20 
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
    saveToHistory();
  };

  // Layer management
  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedId) return;
    
    const currentIndex = elements.findIndex(el => el.id === selectedId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= elements.length) return;
    
    const newElements = [...elements];
    [newElements[currentIndex], newElements[newIndex]] = [newElements[newIndex], newElements[currentIndex]];
    setElements(newElements);
    saveToHistory();
  };

  // Drawing functions
  const drawElement = (ctx: CanvasRenderingContext2D, element: Element) => {
    if (!element.visible) return;

    ctx.save();
    ctx.globalAlpha = element.opacity;
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-element.width / 2, -element.height / 2);

    ctx.fillStyle = element.fill;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;

    switch (element.type) {
      case 'rectangle':
        ctx.fillRect(0, 0, element.width, element.height);
        if (element.strokeWidth > 0) {
          ctx.strokeRect(0, 0, element.width, element.height);
        }
        break;

      case 'circle':
        const radius = Math.min(element.width, element.height) / 2;
        ctx.beginPath();
        ctx.arc(element.width / 2, element.height / 2, radius, 0, 2 * Math.PI);
        ctx.fill();
        if (element.strokeWidth > 0) {
          ctx.stroke();
        }
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(element.width / 2, 0);
        ctx.lineTo(0, element.height);
        ctx.lineTo(element.width, element.height);
        ctx.closePath();
        ctx.fill();
        if (element.strokeWidth > 0) {
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.fill;
        ctx.textBaseline = 'top';
        ctx.fillText(element.text || '', 0, 0);
        break;
    }

    ctx.restore();

    // Draw selection outline
    if (element.id === selectedId) {
      ctx.save();
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
      ctx.restore();
    }
  };

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    elements.forEach(element => drawElement(ctx, element));
  }, [elements, selectedId, backgroundColor]);

  // Re-render when elements change
  useEffect(() => {
    render();
  }, [render]);

  // Export canvas
  const exportLogo = (format: 'png' | 'svg' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'logo.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const tools = [
    { id: 'select' as Tool, name: 'Select', icon: Move },
    { id: 'text' as Tool, name: 'Text', icon: Type },
    { id: 'rectangle' as Tool, name: 'Rectangle', icon: Square },
    { id: 'circle' as Tool, name: 'Circle', icon: Circle },
    { id: 'triangle' as Tool, name: 'Triangle', icon: Triangle },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Logo Editor</h2>
        <p className="text-slate-600 dark:text-slate-400">Create professional logos with shapes, text, and colors</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Toolbar */}
        <div className="xl:col-span-1 space-y-4">
          {/* Tools */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Tools</h3>
            <div className="grid grid-cols-5 xl:grid-cols-1 gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={currentTool === tool.id ? 'primary' : 'outline'}
                    onClick={() => setCurrentTool(tool.id)}
                    className="flex items-center justify-center xl:justify-start space-x-2 p-3"
                  >
                    <Icon size={18} />
                    <span className="hidden xl:inline">{tool.name}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Actions */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Actions</h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={undo} disabled={historyIndex <= 0} className="flex-1">
                  <Undo size={16} />
                </Button>
                <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1">
                  <Redo size={16} />
                </Button>
              </div>
              
              {selectedElement && (
                <>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={duplicateSelected} className="flex-1">
                      <Copy size={16} />
                    </Button>
                    <Button variant="outline" onClick={deleteSelected} className="flex-1">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => moveLayer('up')} className="flex-1">
                      <ChevronUp size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => moveLayer('down')} className="flex-1">
                      <ChevronDown size={16} />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => updateSelectedElement({ visible: !selectedElement.visible })}
                    className="w-full"
                  >
                    {selectedElement.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="ml-2">{selectedElement.visible ? 'Hide' : 'Show'}</span>
                  </Button>
                </>
              )}
              
              <Button onClick={() => exportLogo('png')} className="w-full">
                <Download size={16} className="mr-2" />
                Export PNG
              </Button>
            </div>
          </Card>

          {/* Properties */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Properties</h3>
            <div className="space-y-4">
              {/* Canvas Background */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Background
                </label>
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

              {/* Fill Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Fill Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={selectedElement?.fill || fillColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setFillColor(color);
                      if (selectedElement) {
                        updateSelectedElement({ fill: color });
                      }
                    }}
                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <Input
                    value={selectedElement?.fill || fillColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setFillColor(color);
                      if (selectedElement) {
                        updateSelectedElement({ fill: color });
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Stroke */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stroke
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="color"
                    value={selectedElement?.stroke || strokeColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setStrokeColor(color);
                      if (selectedElement) {
                        updateSelectedElement({ stroke: color });
                      }
                    }}
                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <Input
                    value={selectedElement?.stroke || strokeColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setStrokeColor(color);
                      if (selectedElement) {
                        updateSelectedElement({ stroke: color });
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={selectedElement?.strokeWidth || strokeWidth}
                  onChange={(e) => {
                    const width = parseInt(e.target.value) || 0;
                    setStrokeWidth(width);
                    if (selectedElement) {
                      updateSelectedElement({ strokeWidth: width });
                    }
                  }}
                  placeholder="Stroke Width"
                />
              </div>

              {/* Text Properties */}
              {(currentTool === 'text' || selectedElement?.type === 'text') && (
                <>
                  <Input
                    type="number"
                    min="8"
                    max="200"
                    value={selectedElement?.fontSize || fontSize}
                    onChange={(e) => {
                      const size = parseInt(e.target.value) || 24;
                      setFontSize(size);
                      if (selectedElement) {
                        updateSelectedElement({ fontSize: size });
                      }
                    }}
                    label="Font Size"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={selectedElement?.fontFamily || fontFamily}
                      onChange={(e) => {
                        const family = e.target.value;
                        setFontFamily(family);
                        if (selectedElement) {
                          updateSelectedElement({ fontFamily: family });
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Impact">Impact</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Font Weight
                    </label>
                    <select
                      value={selectedElement?.fontWeight || fontWeight}
                      onChange={(e) => {
                        const weight = e.target.value;
                        setFontWeight(weight);
                        if (selectedElement) {
                          updateSelectedElement({ fontWeight: weight });
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  {selectedElement?.type === 'text' && (
                    <Input
                      value={selectedElement.text || ''}
                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                      label="Text Content"
                      placeholder="Enter text..."
                    />
                  )}
                </>
              )}

              {/* Transform Properties */}
              {selectedElement && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                      label="X"
                    />
                    <Input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                      label="Y"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) || 1 })}
                      label="Width"
                    />
                    <Input
                      type="number"
                      min="1"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) || 1 })}
                      label="Height"
                    />
                  </div>

                  <Input
                    type="number"
                    min="0"
                    max="360"
                    value={selectedElement.rotation}
                    onChange={(e) => updateSelectedElement({ rotation: parseInt(e.target.value) || 0 })}
                    label="Rotation (degrees)"
                  />

                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.opacity}
                    onChange={(e) => updateSelectedElement({ opacity: parseFloat(e.target.value) || 1 })}
                    label="Opacity"
                  />
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Canvas */}
        <div className="xl:col-span-3">
          <Card padding="md" className="bg-slate-50 dark:bg-slate-800">
            <div className="flex justify-center">
              <div className="border-2 border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden shadow-lg">
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="cursor-crosshair max-w-full h-auto"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Canvas: {canvasSize.width} × {canvasSize.height}px
              {selectedElement && (
                <span className="ml-4">
                  Selected: {selectedElement.type} ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
                </span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};