import React, { useState, useRef } from 'react';
import { Video, Square, Download, Mic, MicOff, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const ScreenRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [recordingSource, setRecordingSource] = useState<'screen' | 'window'>('screen');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: recordingSource as any,
        },
        audio: includeAudio,
      });

      // Optionally add microphone audio
      let audioStream: MediaStream | null = null;
      if (includeAudio) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          console.warn('Could not access microphone:', error);
        }
      }

      // Combine streams if we have both
      let combinedStream = displayStream;
      if (audioStream) {
        const audioTrack = audioStream.getAudioTracks()[0];
        if (audioTrack) {
          combinedStream.addTrack(audioTrack);
        }
      }

      streamRef.current = combinedStream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        setRecordingTime(0);
        
        // Clean up streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Handle stream ending (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please make sure you grant screen sharing permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const downloadRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Screen Recorder</h2>
        <p className="text-slate-600 dark:text-slate-400">Record your screen with audio</p>
      </div>

      {/* Recording Controls */}
      <Card padding="lg">
        <div className="text-center space-y-6">
          {/* Recording Status */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {formatTime(recordingTime)}
            </div>
          </div>

          {/* Settings */}
          {!isRecording && !recordedBlob && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Recording Source
                  </label>
                  <select
                    value={recordingSource}
                    onChange={(e) => setRecordingSource(e.target.value as 'screen' | 'window')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="screen">Entire Screen</option>
                    <option value="window">Application Window</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Audio Settings
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      className="w-4 h-4 text-turquoise-600 bg-gray-100 border-gray-300 rounded focus:ring-turquoise-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Include system audio</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {!isRecording && !recordedBlob && (
              <Button onClick={startRecording} size="lg">
                <Video size={20} className="mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button onClick={stopRecording} variant="secondary" size="lg">
                <Square size={20} className="mr-2" />
                Stop Recording
              </Button>
            )}

            {recordedBlob && (
              <div className="flex space-x-2">
                <Button onClick={downloadRecording} size="lg">
                  <Download size={20} className="mr-2" />
                  Download Video
                </Button>
                <Button onClick={resetRecording} variant="outline" size="lg">
                  Record Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Preview */}
      {recordedBlob && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recording Preview</h3>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="w-full h-full"
            />
          </div>
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            File size: {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">How to Use</h3>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start space-x-2">
            <Monitor size={16} className="mt-0.5 text-turquoise-500" />
            <span>Choose between recording your entire screen or a specific application window</span>
          </li>
          <li className="flex items-start space-x-2">
            <Mic size={16} className="mt-0.5 text-turquoise-500" />
            <span>Enable audio recording to capture system sounds and microphone input</span>
          </li>
          <li className="flex items-start space-x-2">
            <Video size={16} className="mt-0.5 text-turquoise-500" />
            <span>Click "Start Recording" and select what you want to share in the browser dialog</span>
          </li>
          <li className="flex items-start space-x-2">
            <Square size={16} className="mt-0.5 text-turquoise-500" />
            <span>Click "Stop Recording" or close the sharing dialog to end the recording</span>
          </li>
          <li className="flex items-start space-x-2">
            <Download size={16} className="mt-0.5 text-turquoise-500" />
            <span>Preview your recording and download it as a WebM video file</span>
          </li>
        </ul>
      </Card>

      {/* Browser Compatibility */}
      <Card padding="md" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Browser Requirements</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Screen recording requires a modern browser with Screen Capture API support. 
          Works best in Chrome, Firefox, and Edge. Safari support may be limited.
        </p>
      </Card>
    </div>
  );
};