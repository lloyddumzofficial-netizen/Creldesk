import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer, 
  PenTool, 
  Square, 
  Circle, 
  Type, 
  Image as ImageIcon, 
  Brush, 
  Crop, 
  Palette, 
  Move3D,
  Layers,
  Download,
  Upload,
  Undo,
  Redo,
  Copy,
  Trash2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Grid,
  Ruler,
  Settings,
  Save,
  FolderOpen,
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Target,
  Zap,
  Sparkles,
  Wand2,
  Shapes,
  Triangle,
  Hexagon,
  ArrowRight,
  MessageCircle,
  Bookmark,
  Hash,
  Droplets,
  Scissors,
  CornerUpRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

// Types and Interfaces
interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'triangle' | 'star' | 'polygon' | 'image' | 'path' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  zIndex: number;
  
  // Style properties
  fill: string | CanvasGradient | CanvasPattern;
  stroke: string;
  strokeWidth: number;
  
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  lineHeight?: number;
  
  // Image specific
  src?: string;
  
  // Path specific
  path?: string;
  
  // Group specific
  children?: string[];
  
  // Effects
  shadow?: {
    blur: number;
    offsetX: number;
    offsetY: number;
    color: string;
  };
  
  // Animation
  animation?: {
    type: string;
    duration: number;
    delay: number;
  };
}

interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'transparent';
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: 'select' | 'draw' | 'shape' | 'text' | 'image' | 'effect';
  shortcut?: string;
  description: string;
}

interface ColorStop {
  position: number;
  color: string;
}

interface GradientData {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  stops: ColorStop[];
  centerX?: number;
  centerY?: number;
  radius?: number;
}

// Professional Tools Configuration
const TOOLS: Tool[] = [
  // Selection Tools
  { id: 'select', name: 'Selection', icon: MousePointer, category: 'select', shortcut: 'V', description: 'Select and move objects' },
  { id: 'direct-select', name: 'Direct Selection', icon: Target, category: 'select', shortcut: 'A', description: 'Select individual points' },
  
  // Drawing Tools
  { id: 'pen', name: 'Pen Tool', icon: PenTool, category: 'draw', shortcut: 'P', description: 'Draw with bezier curves' },
  { id: 'brush', name: 'Brush', icon: Brush, category: 'draw', shortcut: 'B', description: 'Paint with brushes' },
  { id: 'pencil', name: 'Pencil', icon: PenTool, category: 'draw', shortcut: 'N', description: 'Draw freehand paths' },
  
  // Shape Tools
  { id: 'rectangle', name: 'Rectangle', icon: Square, category: 'shape', shortcut: 'R', description: 'Draw rectangles' },
  { id: 'circle', name: 'Circle', icon: Circle, category: 'shape', shortcut: 'O', description: 'Draw circles and ellipses' },
  { id: 'triangle', name: 'Triangle', icon: Triangle, category: 'shape', shortcut: 'T', description: 'Draw triangles' },
  { id: 'polygon', name: 'Polygon', icon: Hexagon, category: 'shape', shortcut: 'Y', description: 'Draw polygons' },
  { id: 'star', name: 'Star', icon: Star, category: 'shape', shortcut: 'S', description: 'Draw stars' },
  { id: 'arrow', name: 'Arrow', icon: ArrowRight, category: 'shape', description: 'Draw arrows' },
  
  // Text Tools
  { id: 'text', name: 'Text', icon: Type, category: 'text', shortcut: 'T', description: 'Add and edit text' },
  { id: 'text-path', name: 'Text on Path', icon: CornerUpRight, category: 'text', description: 'Text following a path' },
  
  // Image Tools
  { id: 'image', name: 'Image', icon: ImageIcon, category: 'image', shortcut: 'I', description: 'Insert images' },
  { id: 'crop', name: 'Crop', icon: Crop, category: 'image', shortcut: 'C', description: 'Crop images' },
  
  // Effect Tools
  { id: 'gradient', name: 'Gradient', icon: Palette, category: 'effect', shortcut: 'G', description: 'Apply gradients' },
  { id: 'eyedropper', name: 'Eyedropper', icon: Droplets, category: 'effect', shortcut: 'E', description: 'Sample colors' },
];

const CANVAS_PRESETS = [
  { name: 'Logo Square', width: 500, height: 500 },
  { name: 'Logo Horizontal', width: 800, height: 400 },
  { name: 'Logo Vertical', width: 400, height: 800 },
  { name: 'Business Card', width: 1050, height: 600 },
  { name: 'Social Media', width: 1200, height: 1200 },
  { name: 'Web Header', width: 1920, height: 400 },
  { name: 'Print A4', width: 2480, height: 3508 },
  { name: 'Custom', width: 800, height: 600 },
];

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
  'Raleway', 'Poppins', 'Nunito', 'Playfair Display', 'Merriweather',
  'Oswald', 'Lora', 'Ubuntu', 'Crimson Text', 'Libre Baskerville'
];

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
  'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion'
];

export const LogoEditor: React.FC = () => {
  // Core State
  const [activeTool, setActiveTool] = useState<string>('select');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: false,
    showRulers: true,
    snapToGrid: true,
    gridSize: 20,
  });
  
  // UI State
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [showAssetPanel, setShowAssetPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // History Management
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Current Style State
  const [currentFill, setCurrentFill] = useState('#3b82f6');
  const [currentStroke, setCurrentStroke] = useState('#000000');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);
  const [currentFontSize, setCurrentFontSize] = useState(24);
  const [currentFontFamily, setCurrentFontFamily] = useState('Inter');
  const [currentOpacity, setCurrentOpacity] = useState(100);
  
  // Gradient State
  const [gradientData, setGradientData] = useState<GradientData>({
    type: 'linear',
    angle: 0,
    stops: [
      { position: 0, color: '#3b82f6' },
      { position: 100, color: '#8b5cf6' }
    ]
  });

  // Canvas Drawing Functions
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan
    ctx.save();
    ctx.scale(canvasState.zoom, canvasState.zoom);
    ctx.translate(canvasState.panX, canvasState.panY);

    // Draw background
    if (canvasState.backgroundType === 'solid') {
      ctx.fillStyle = canvasState.backgroundColor;
      ctx.fillRect(0, 0, canvasState.width, canvasState.height);
    }

    // Draw grid
    if (canvasState.showGrid) {
      drawGrid(ctx);
    }

    // Sort elements by z-index
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    // Draw elements
    sortedElements.forEach(element => {
      if (!element.visible) return;
      drawElement(ctx, element);
    });

    // Draw selection handles
    selectedElements.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        drawSelectionHandles(ctx, element);
      }
    });

    ctx.restore();
  }, [elements, selectedElements, canvasState]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { gridSize, width, height } = canvasState;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.save();
    
    // Apply transformations
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.globalAlpha = element.opacity;
    
    // Apply shadow
    if (element.shadow) {
      ctx.shadowColor = element.shadow.color;
      ctx.shadowBlur = element.shadow.blur;
      ctx.shadowOffsetX = element.shadow.offsetX;
      ctx.shadowOffsetY = element.shadow.offsetY;
    }

    // Set fill and stroke
    ctx.fillStyle = element.fill as string;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;

    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;

    switch (element.type) {
      case 'rectangle':
        ctx.fillRect(-halfWidth, -halfHeight, element.width, element.height);
        if (element.strokeWidth > 0) {
          ctx.strokeRect(-halfWidth, -halfHeight, element.width, element.height);
        }
        break;

      case 'circle':
        ctx.beginPath();
        ctx.ellipse(0, 0, halfWidth, halfHeight, 0, 0, 2 * Math.PI);
        ctx.fill();
        if (element.strokeWidth > 0) {
          ctx.stroke();
        }
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -halfHeight);
        ctx.lineTo(-halfWidth, halfHeight);
        ctx.lineTo(halfWidth, halfHeight);
        ctx.closePath();
        ctx.fill();
        if (element.strokeWidth > 0) {
          ctx.stroke();
        }
        break;

      case 'star':
        drawStar(ctx, 0, 0, 5, halfWidth, halfWidth * 0.5);
        ctx.fill();
        if (element.strokeWidth > 0) {
          ctx.stroke();
        }
        break;

      case 'text':
        if (element.text) {
          ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'} ${element.fontSize || 24}px ${element.fontFamily || 'Inter'}`;
          ctx.textAlign = element.textAlign || 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.text, 0, 0);
          if (element.strokeWidth > 0) {
            ctx.strokeText(element.text, 0, 0);
          }
        }
        break;

      case 'image':
        if (element.src) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, -halfWidth, -halfHeight, element.width, element.height);
          };
          img.src = element.src;
        }
        break;
    }

    ctx.restore();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      const x = cx + Math.cos(rot) * outerRadius;
      const y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      const x2 = cx + Math.cos(rot) * innerRadius;
      const y2 = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x2, y2);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const handleSize = 8 / canvasState.zoom;
    
    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2 / canvasState.zoom;
    ctx.setLineDash([]);

    // Selection border
    ctx.strokeRect(element.x, element.y, element.width, element.height);

    // Corner handles
    const handles = [
      { x: element.x, y: element.y }, // Top-left
      { x: element.x + element.width, y: element.y }, // Top-right
      { x: element.x + element.width, y: element.y + element.height }, // Bottom-right
      { x: element.x, y: element.y + element.height }, // Bottom-left
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });

    ctx.restore();
  };

  // Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasState.zoom - canvasState.panX;
    const y = (e.clientY - rect.top) / canvasState.zoom - canvasState.panY;

    setDragStart({ x, y });
    setIsDrawing(true);

    if (activeTool === 'select') {
      handleSelection(x, y, e.shiftKey);
    } else if (['rectangle', 'circle', 'triangle', 'star'].includes(activeTool)) {
      startDrawingShape(x, y);
    } else if (activeTool === 'text') {
      addTextElement(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasState.zoom - canvasState.panX;
    const y = (e.clientY - rect.top) / canvasState.zoom - canvasState.panY;

    if (activeTool === 'select' && selectedElements.length > 0) {
      // Move selected elements
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      setElements(prev => prev.map(el => 
        selectedElements.includes(el.id) 
          ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
          : el
      ));
      
      setDragStart({ x, y });
    } else if (['rectangle', 'circle', 'triangle', 'star'].includes(activeTool)) {
      updateDrawingShape(x, y);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    setDragStart(null);
    
    if (['rectangle', 'circle', 'triangle', 'star'].includes(activeTool)) {
      finishDrawingShape();
    }
  };

  const handleSelection = (x: number, y: number, addToSelection: boolean) => {
    const clickedElement = elements
      .slice()
      .reverse()
      .find(el => 
        x >= el.x && x <= el.x + el.width &&
        y >= el.y && y <= el.y + el.height &&
        el.visible && !el.locked
      );

    if (clickedElement) {
      if (addToSelection) {
        setSelectedElements(prev => 
          prev.includes(clickedElement.id) 
            ? prev.filter(id => id !== clickedElement.id)
            : [...prev, clickedElement.id]
        );
      } else {
        setSelectedElements([clickedElement.id]);
      }
    } else if (!addToSelection) {
      setSelectedElements([]);
    }
  };

  const startDrawingShape = (x: number, y: number) => {
    const newElement: CanvasElement = {
      id: `element_${Date.now()}`,
      type: activeTool as any,
      x,
      y,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: currentOpacity / 100,
      visible: true,
      locked: false,
      selected: false,
      zIndex: elements.length,
      fill: currentFill,
      stroke: currentStroke,
      strokeWidth: currentStrokeWidth,
    };

    setElements(prev => [...prev, newElement]);
  };

  const updateDrawingShape = (x: number, y: number) => {
    if (!dragStart) return;

    setElements(prev => prev.map(el => {
      if (el.id === prev[prev.length - 1]?.id) {
        const width = Math.abs(x - dragStart.x);
        const height = Math.abs(y - dragStart.y);
        const newX = Math.min(x, dragStart.x);
        const newY = Math.min(y, dragStart.y);

        return {
          ...el,
          x: newX,
          y: newY,
          width,
          height,
        };
      }
      return el;
    }));
  };

  const finishDrawingShape = () => {
    // Add to history
    addToHistory();
  };

  const addTextElement = (x: number, y: number) => {
    const newElement: CanvasElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: x - 50,
      y: y - 12,
      width: 100,
      height: 24,
      rotation: 0,
      opacity: currentOpacity / 100,
      visible: true,
      locked: false,
      selected: false,
      zIndex: elements.length,
      fill: currentFill,
      stroke: currentStroke,
      strokeWidth: 0,
      text: 'Text',
      fontSize: currentFontSize,
      fontFamily: currentFontFamily,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElements([newElement.id]);
    addToHistory();
  };

  // History Management
  const addToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      setSelectedElements([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      setSelectedElements([]);
    }
  };

  // Element Operations
  const duplicateSelected = () => {
    const newElements = selectedElements.map(id => {
      const element = elements.find(el => el.id === id);
      if (!element) return null;

      return {
        ...element,
        id: `${element.type}_${Date.now()}_${Math.random()}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: elements.length + selectedElements.indexOf(id),
      };
    }).filter(Boolean) as CanvasElement[];

    setElements(prev => [...prev, ...newElements]);
    setSelectedElements(newElements.map(el => el.id));
    addToHistory();
  };

  const deleteSelected = () => {
    setElements(prev => prev.filter(el => !selectedElements.includes(el.id)));
    setSelectedElements([]);
    addToHistory();
  };

  const groupSelected = () => {
    if (selectedElements.length < 2) return;

    const groupId = `group_${Date.now()}`;
    const selectedEls = elements.filter(el => selectedElements.includes(el.id));
    
    // Calculate group bounds
    const minX = Math.min(...selectedEls.map(el => el.x));
    const minY = Math.min(...selectedEls.map(el => el.y));
    const maxX = Math.max(...selectedEls.map(el => el.x + el.width));
    const maxY = Math.max(...selectedEls.map(el => el.y + el.height));

    const groupElement: CanvasElement = {
      id: groupId,
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      selected: false,
      zIndex: Math.max(...selectedEls.map(el => el.zIndex)),
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      children: selectedElements,
    };

    setElements(prev => [
      ...prev.filter(el => !selectedElements.includes(el.id)),
      groupElement
    ]);
    setSelectedElements([groupId]);
    addToHistory();
  };

  // Canvas Operations
  const zoomIn = () => {
    setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 10) }));
  };

  const zoomOut = () => {
    setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.1) }));
  };

  const resetZoom = () => {
    setCanvasState(prev => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
  };

  const fitToScreen = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth - 300; // Account for panels
    const containerHeight = container.clientHeight - 100;
    
    const scaleX = containerWidth / canvasState.width;
    const scaleY = containerHeight / canvasState.height;
    const scale = Math.min(scaleX, scaleY, 1);

    setCanvasState(prev => ({
      ...prev,
      zoom: scale,
      panX: (containerWidth - canvasState.width * scale) / 2 / scale,
      panY: (containerHeight - canvasState.height * scale) / 2 / scale,
    }));
  };

  // Export Functions
  const exportCanvas = (format: 'png' | 'jpg' | 'svg' | 'pdf') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'svg') {
      exportAsSVG();
    } else if (format === 'pdf') {
      exportAsPDF();
    } else {
      const link = document.createElement('a');
      link.download = `logo.${format}`;
      link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.9);
      link.click();
    }
  };

  const exportAsSVG = () => {
    let svg = `<svg width="${canvasState.width}" height="${canvasState.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    if (canvasState.backgroundType === 'solid' && canvasState.backgroundColor !== 'transparent') {
      svg += `<rect width="100%" height="100%" fill="${canvasState.backgroundColor}"/>`;
    }
    
    // Elements
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    sortedElements.forEach(element => {
      if (!element.visible) return;
      
      const transform = `translate(${element.x + element.width/2}, ${element.y + element.height/2}) rotate(${element.rotation})`;
      const style = `fill:${element.fill};stroke:${element.stroke};stroke-width:${element.strokeWidth};opacity:${element.opacity}`;
      
      switch (element.type) {
        case 'rectangle':
          svg += `<rect x="${-element.width/2}" y="${-element.height/2}" width="${element.width}" height="${element.height}" transform="${transform}" style="${style}"/>`;
          break;
        case 'circle':
          svg += `<ellipse cx="0" cy="0" rx="${element.width/2}" ry="${element.height/2}" transform="${transform}" style="${style}"/>`;
          break;
        case 'text':
          if (element.text) {
            svg += `<text x="0" y="0" transform="${transform}" style="${style};font-family:${element.fontFamily};font-size:${element.fontSize}px;text-anchor:middle;dominant-baseline:middle">${element.text}</text>`;
          }
          break;
      }
    });
    
    svg += '</svg>';
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logo.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    // This would require a PDF library like jsPDF
    console.log('PDF export would be implemented with jsPDF library');
  };

  // File Operations
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      
      const newElement: CanvasElement = {
        id: `image_${Date.now()}`,
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        selected: false,
        zIndex: elements.length,
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        src,
      };

      setElements(prev => [...prev, newElement]);
      setSelectedElements([newElement.id]);
      addToHistory();
    };
    
    reader.readAsDataURL(file);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            // Copy functionality would go here
            break;
          case 'v':
            e.preventDefault();
            // Paste functionality would go here
            break;
          case 'd':
            e.preventDefault();
            duplicateSelected();
            break;
          case 'g':
            e.preventDefault();
            groupSelected();
            break;
          case 's':
            e.preventDefault();
            // Save functionality would go here
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            deleteSelected();
            break;
          case 'v':
            setActiveTool('select');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'o':
            setActiveTool('circle');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'p':
            setActiveTool('pen');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, elements, historyIndex]);

  // Canvas Drawing Effect
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasState.width;
    canvas.height = canvasState.height;
    drawCanvas();
  }, [canvasState.width, canvasState.height, drawCanvas]);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Top Menu Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg">Logo Studio Pro</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              <FolderOpen size={16} className="mr-1" />
              Open
            </Button>
            <Button variant="ghost" size="sm">
              <Save size={16} className="mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportCanvas('png')}>
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo size={16} />
          </Button>
          
          <div className="w-px h-6 bg-slate-600 mx-2" />
          
          <Button variant="ghost" size="sm" onClick={zoomOut}>
            <ZoomOut size={16} />
          </Button>
          <span className="text-sm font-mono min-w-[60px] text-center">
            {Math.round(canvasState.zoom * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={zoomIn}>
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetZoom}>
            <Target size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tool Palette */}
        <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                  activeTool === tool.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`${tool.name} (${tool.shortcut || ''})`}
              >
                <Icon size={18} />
              </motion.button>
            );
          })}
          
          <div className="w-8 h-px bg-slate-600 my-2" />
          
          <motion.button
            onClick={() => setCanvasState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
              canvasState.showGrid
                ? "bg-slate-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle Grid"
          >
            <Grid size={18} />
          </motion.button>
          
          <motion.button
            onClick={() => setCanvasState(prev => ({ ...prev, showRulers: !prev.showRulers }))}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
              canvasState.showRulers
                ? "bg-slate-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle Rulers"
          >
            <Ruler size={18} />
          </motion.button>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <select
                value={`${canvasState.width}x${canvasState.height}`}
                onChange={(e) => {
                  const preset = CANVAS_PRESETS.find(p => `${p.width}x${p.height}` === e.target.value);
                  if (preset) {
                    setCanvasState(prev => ({ ...prev, width: preset.width, height: preset.height }));
                  }
                }}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
              >
                {CANVAS_PRESETS.map(preset => (
                  <option key={preset.name} value={`${preset.width}x${preset.height}`}>
                    {preset.name} ({preset.width}×{preset.height})
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={canvasState.width}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                  className="w-20 h-8 text-sm bg-slate-700 border-slate-600"
                />
                <span className="text-slate-400">×</span>
                <Input
                  type="number"
                  value={canvasState.height}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                  className="w-20 h-8 text-sm bg-slate-700 border-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={fitToScreen}>
                Fit to Screen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAssetPanel(!showAssetPanel)}>
                <Shapes size={16} className="mr-1" />
                Assets
              </Button>
            </div>
          </div>

          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="flex-1 bg-slate-700 overflow-auto relative"
            style={{ 
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="relative bg-white shadow-2xl"
                style={{
                  width: canvasState.width * canvasState.zoom,
                  height: canvasState.height * canvasState.zoom,
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasState.width}
                  height={canvasState.height}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="absolute inset-0 cursor-crosshair"
                  style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {showPropertiesPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-800 border-l border-slate-700 overflow-hidden"
            >
              <div className="w-[300px] h-full overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* Fill & Stroke */}
                  <Card className="bg-slate-700 border-slate-600">
                    <div className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Palette size={16} className="mr-2" />
                        Fill & Stroke
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Fill Color</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={currentFill}
                              onChange={(e) => setCurrentFill(e.target.value)}
                              className="w-12 h-8 rounded border border-slate-600 cursor-pointer"
                            />
                            <Input
                              value={currentFill}
                              onChange={(e) => setCurrentFill(e.target.value)}
                              className="flex-1 bg-slate-600 border-slate-500 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Stroke Color</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={currentStroke}
                              onChange={(e) => setCurrentStroke(e.target.value)}
                              className="w-12 h-8 rounded border border-slate-600 cursor-pointer"
                            />
                            <Input
                              value={currentStroke}
                              onChange={(e) => setCurrentStroke(e.target.value)}
                              className="flex-1 bg-slate-600 border-slate-500 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Stroke Width</label>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            value={currentStrokeWidth}
                            onChange={(e) => setCurrentStrokeWidth(parseInt(e.target.value) || 0)}
                            className="bg-slate-600 border-slate-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Opacity</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={currentOpacity}
                              onChange={(e) => setCurrentOpacity(parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-sm w-12 text-right">{currentOpacity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Typography */}
                  {activeTool === 'text' && (
                    <Card className="bg-slate-700 border-slate-600">
                      <div className="p-4">
                        <h3 className="font-semibold mb-4 flex items-center">
                          <Type size={16} className="mr-2" />
                          Typography
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Font Family</label>
                            <select
                              value={currentFontFamily}
                              onChange={(e) => setCurrentFontFamily(e.target.value)}
                              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm"
                            >
                              {FONT_FAMILIES.map(font => (
                                <option key={font} value={font}>{font}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Font Size</label>
                            <Input
                              type="number"
                              min="8"
                              max="200"
                              value={currentFontSize}
                              onChange={(e) => setCurrentFontSize(parseInt(e.target.value) || 24)}
                              className="bg-slate-600 border-slate-500"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="flex-1">
                              <Bold size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <Italic size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <Underline size={16} />
                            </Button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="flex-1">
                              <AlignLeft size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <AlignCenter size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <AlignRight size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <AlignJustify size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Transform */}
                  {selectedElements.length > 0 && (
                    <Card className="bg-slate-700 border-slate-600">
                      <div className="p-4">
                        <h3 className="font-semibold mb-4 flex items-center">
                          <Move3D size={16} className="mr-2" />
                          Transform
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">X</label>
                              <Input
                                type="number"
                                value={elements.find(el => el.id === selectedElements[0])?.x || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setElements(prev => prev.map(el => 
                                    selectedElements.includes(el.id) ? { ...el, x: value } : el
                                  ));
                                }}
                                className="bg-slate-600 border-slate-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Y</label>
                              <Input
                                type="number"
                                value={elements.find(el => el.id === selectedElements[0])?.y || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setElements(prev => prev.map(el => 
                                    selectedElements.includes(el.id) ? { ...el, y: value } : el
                                  ));
                                }}
                                className="bg-slate-600 border-slate-500 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">Width</label>
                              <Input
                                type="number"
                                value={elements.find(el => el.id === selectedElements[0])?.width || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setElements(prev => prev.map(el => 
                                    selectedElements.includes(el.id) ? { ...el, width: value } : el
                                  ));
                                }}
                                className="bg-slate-600 border-slate-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Height</label>
                              <Input
                                type="number"
                                value={elements.find(el => el.id === selectedElements[0])?.height || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setElements(prev => prev.map(el => 
                                    selectedElements.includes(el.id) ? { ...el, height: value } : el
                                  ));
                                }}
                                className="bg-slate-600 border-slate-500 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Rotation</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={elements.find(el => el.id === selectedElements[0])?.rotation || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  setElements(prev => prev.map(el => 
                                    selectedElements.includes(el.id) ? { ...el, rotation: value } : el
                                  ));
                                }}
                                className="flex-1"
                              />
                              <span className="text-sm w-12 text-right">
                                {elements.find(el => el.id === selectedElements[0])?.rotation || 0}°
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={duplicateSelected} className="flex-1">
                              <Copy size={16} className="mr-1" />
                              Duplicate
                            </Button>
                            <Button variant="ghost" size="sm" onClick={deleteSelected} className="flex-1">
                              <Trash2 size={16} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="flex-1">
                              <FlipHorizontal size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <FlipVertical size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1">
                              <RotateCw size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Export Options */}
                  <Card className="bg-slate-700 border-slate-600">
                    <div className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Download size={16} className="mr-2" />
                        Export
                      </h3>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportCanvas('png')}
                          className="w-full justify-start"
                        >
                          PNG (Transparent)
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportCanvas('jpg')}
                          className="w-full justify-start"
                        >
                          JPG (Compressed)
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportCanvas('svg')}
                          className="w-full justify-start"
                        >
                          SVG (Vector)
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportCanvas('pdf')}
                          className="w-full justify-start"
                        >
                          PDF (Print)
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Layers Panel */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800 border-t border-slate-700 overflow-hidden"
          >
            <div className="h-[200px] flex">
              {/* Layers */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <Layers size={16} className="mr-2" />
                    Layers ({elements.length})
                  </h3>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={groupSelected}>
                      Group
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...elements].reverse().map((element, index) => (
                    <motion.div
                      key={element.id}
                      onClick={() => setSelectedElements([element.id])}
                      className={cn(
                        "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                        selectedElements.includes(element.id)
                          ? "bg-blue-500/20 border border-blue-500/50"
                          : "hover:bg-slate-700"
                      )}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-slate-600 rounded flex items-center justify-center">
                          {element.type === 'text' && <Type size={10} />}
                          {element.type === 'rectangle' && <Square size={10} />}
                          {element.type === 'circle' && <Circle size={10} />}
                          {element.type === 'triangle' && <Triangle size={10} />}
                          {element.type === 'star' && <Star size={10} />}
                          {element.type === 'image' && <ImageIcon size={10} />}
                        </div>
                        <span className="text-sm">
                          {element.type === 'text' ? element.text || 'Text' : 
                           element.type.charAt(0).toUpperCase() + element.type.slice(1)} {elements.length - index}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setElements(prev => prev.map(el => 
                              el.id === element.id ? { ...el, visible: !el.visible } : el
                            ));
                          }}
                          className="p-1 hover:bg-slate-600 rounded"
                        >
                          {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setElements(prev => prev.map(el => 
                              el.id === element.id ? { ...el, locked: !el.locked } : el
                            ));
                          }}
                          className="p-1 hover:bg-slate-600 rounded"
                        >
                          {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Assets */}
              <div className="w-64 border-l border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <Shapes size={16} className="mr-2" />
                    Assets
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {/* Quick Shape Buttons */}
                  <button
                    onClick={() => {
                      setActiveTool('rectangle');
                      const newElement: CanvasElement = {
                        id: `rect_${Date.now()}`,
                        type: 'rectangle',
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                        rotation: 0,
                        opacity: 1,
                        visible: true,
                        locked: false,
                        selected: false,
                        zIndex: elements.length,
                        fill: currentFill,
                        stroke: currentStroke,
                        strokeWidth: currentStrokeWidth,
                      };
                      setElements(prev => [...prev, newElement]);
                      addToHistory();
                    }}
                    className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
                  >
                    <Square size={16} />
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTool('circle');
                      const newElement: CanvasElement = {
                        id: `circle_${Date.now()}`,
                        type: 'circle',
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                        rotation: 0,
                        opacity: 1,
                        visible: true,
                        locked: false,
                        selected: false,
                        zIndex: elements.length,
                        fill: currentFill,
                        stroke: currentStroke,
                        strokeWidth: currentStrokeWidth,
                      };
                      setElements(prev => [...prev, newElement]);
                      addToHistory();
                    }}
                    className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
                  >
                    <Circle size={16} />
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTool('triangle');
                      const newElement: CanvasElement = {
                        id: `triangle_${Date.now()}`,
                        type: 'triangle',
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                        rotation: 0,
                        opacity: 1,
                        visible: true,
                        locked: false,
                        selected: false,
                        zIndex: elements.length,
                        fill: currentFill,
                        stroke: currentStroke,
                        strokeWidth: currentStrokeWidth,
                      };
                      setElements(prev => [...prev, newElement]);
                      addToHistory();
                    }}
                    className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
                  >
                    <Triangle size={16} />
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTool('star');
                      const newElement: CanvasElement = {
                        id: `star_${Date.now()}`,
                        type: 'star',
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                        rotation: 0,
                        opacity: 1,
                        visible: true,
                        locked: false,
                        selected: false,
                        zIndex: elements.length,
                        fill: currentFill,
                        stroke: currentStroke,
                        strokeWidth: currentStrokeWidth,
                      };
                      setElements(prev => [...prev, newElement]);
                      addToHistory();
                    }}
                    className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
                  >
                    <Star size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};