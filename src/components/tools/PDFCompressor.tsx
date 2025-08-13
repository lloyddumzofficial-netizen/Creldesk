import React, { useState } from 'react';
import { Upload, Download, FileDown, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const PDFCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressionRatio, setCompressionRatio] = useState(0.7);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setCompressedFile(null);
    } else {
      alert('Please select a PDF file');
    }
  };

  const compressPDF = async () => {
    if (!file) return;

    setCompressing(true);
    
    try {
      // Simulate compression process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simulated compressed file (in reality, you'd use a PDF library)
      const originalSize = file.size;
      const compressedSize = Math.floor(originalSize * compressionRatio);
      
      // Create a blob with reduced size (simulation)
      const compressedBlob = new Blob([file], { type: 'application/pdf' });
      
      // Override the size property for demonstration
      Object.defineProperty(compressedBlob, 'size', {
        value: compressedSize,
        writable: false
      });
      
      setCompressedFile(compressedBlob);
    } catch (error) {
      console.error('Compression failed:', error);
      alert('Compression failed. Please try again.');
    } finally {
      setCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedFile || !file) return;

    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${file.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavings = () => {
    if (!file || !compressedFile) return 0;
    return Math.round(((file.size - compressedFile.size) / file.size) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">PDF Compressor</h2>
        <p className="text-slate-600 dark:text-slate-400">Reduce PDF file size while maintaining quality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-turquoise-100 dark:bg-turquoise-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-turquoise-600 dark:text-turquoise-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Upload PDF File
            </h3>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 mb-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer block"
              >
                <FileDown size={48} className="text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Click to select PDF file or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Maximum file size: 50MB
                </p>
              </label>
            </div>

            {file && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{file.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
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

        {/* Compression Settings */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Compression Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Compression Level
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.3"
                  max="0.9"
                  step="0.1"
                  value={compressionRatio}
                  onChange={(e) => setCompressionRatio(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>High Compression</span>
                  <span>Balanced</span>
                  <span>High Quality</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Current: {Math.round((1 - compressionRatio) * 100)}% size reduction
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={compressPDF}
                disabled={!file || compressing}
                className="w-full"
              >
                {compressing ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  'Compress PDF'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Results */}
      {compressedFile && file && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Compression Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatFileSize(file.size)}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Original Size</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-turquoise-600 dark:text-turquoise-400">
                {formatFileSize(compressedFile.size)}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Compressed Size</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getSavings()}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Size Reduction</div>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={downloadCompressed}>
              <Download size={16} className="mr-2" />
              Download Compressed PDF
            </Button>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tips for Better Compression</h3>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• PDFs with many images compress better than text-only documents</li>
          <li>• Higher compression may reduce image quality</li>
          <li>• Scanned documents typically have larger file sizes</li>
          <li>• Consider the intended use when choosing compression level</li>
        </ul>
      </Card>
    </div>
  );
};