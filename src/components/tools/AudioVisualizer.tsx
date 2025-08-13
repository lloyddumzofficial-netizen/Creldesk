import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Play, Pause, Music } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const AudioVisualizer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [visualizationType, setVisualizationType] = useState<'bars' | 'waveform' | 'circular'>('bars');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setupAudio(file);
    } else {
      alert('Please select an audio file (MP3, WAV, etc.)');
    }
  };

  const setupAudio = (file: File) => {
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(file);
    }
  };

  const initializeAudioContext = async () => {
    if (!audioRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyserNode = ctx.createAnalyser();
      
      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);

      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      setAudioContext(ctx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (!audioContext) {
      await initializeAudioContext();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
      draw();
    }
  };

  const draw = () => {
    if (!analyser || !dataArray || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(15, 23, 42)'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (visualizationType === 'bars') {
      drawBars(ctx, canvas, dataArray);
    } else if (visualizationType === 'waveform') {
      drawWaveform(ctx, canvas, dataArray);
    } else if (visualizationType === 'circular') {
      drawCircular(ctx, canvas, dataArray);
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  const drawBars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#14b8a6'); // turquoise-500
      gradient.addColorStop(1, '#0d9488'); // turquoise-600

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#14b8a6';
    ctx.beginPath();

    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.6;

    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2;

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * 2 * Math.PI;
      const barHeight = (dataArray[i] / 255) * radius * 0.8;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#14b8a6';
    ctx.fill();
  };

  const exportVisualization = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `audio-visualization-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <>
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Audio Visualizer</h2>
        <p className="text-slate-600 dark:text-slate-400">Upload MP3 and create animated visualizations</p>
      </div>

      {/* Upload Section */}
      <Card padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-turquoise-100 dark:bg-turquoise-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-turquoise-600 dark:text-turquoise-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Upload Audio File
          </h3>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 mb-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="cursor-pointer block"
            >
              <Upload size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Click to select audio file or drag and drop
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Supports MP3, WAV, OGG, and other audio formats
              </p>
            </label>
          </div>

          {audioFile && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{audioFile.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <div className="text-turquoise-600 dark:text-turquoise-400">
                  ✓
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {audioFile && (
        <div>
          {/* Controls */}
          <Card padding="md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button onClick={togglePlayback}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>
                
                <Button variant="outline" onClick={exportVisualization}>
                  <Download size={16} className="mr-2" />
                  Export PNG
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Visualization:
                </label>
                <select
                  value={visualizationType}
                  onChange={(e) => setVisualizationType(e.target.value as any)}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="bars">Bars</option>
                  <option value="waveform">Waveform</option>
                  <option value="circular">Circular</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Visualizer */}
          <Card padding="md">
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full"
              />
            </div>
          </Card>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            onEnded={() => {
              setIsPlaying(false);
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
              }
            }}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Features */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Visualization Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-turquoise-100 dark:bg-turquoise-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <div className="w-6 h-6 bg-turquoise-600 dark:bg-turquoise-400 rounded"></div>
            </div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Bars</h4>
            <p className="text-slate-600 dark:text-slate-400">Classic frequency bars visualization</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-turquoise-100 dark:bg-turquoise-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <div className="w-6 h-1 bg-turquoise-600 dark:bg-turquoise-400 rounded-full"></div>
            </div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Waveform</h4>
            <p className="text-slate-600 dark:text-slate-400">Smooth waveform representation</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-turquoise-100 dark:bg-turquoise-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <div className="w-6 h-6 border-2 border-turquoise-600 dark:border-turquoise-400 rounded-full"></div>
            </div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Circular</h4>
            <p className="text-slate-600 dark:text-slate-400">Radial frequency visualization</p>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};