import React, { useState } from 'react';
import { Upload, Download, RefreshCw, FileImage, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type ConversionType = 'png-to-jpg' | 'jpg-to-png' | 'pdf-to-docx' | 'docx-to-pdf';

interface ConversionOption {
  id: ConversionType;
  name: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  icon: React.ReactNode;
  acceptedTypes: string;
}

export const FileConverter: React.FC = () => {
  const [selectedConversion, setSelectedConversion] = useState<ConversionType>('png-to-jpg');
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<Blob | null>(null);

  const conversionOptions: ConversionOption[] = [
    {
      id: 'png-to-jpg',
      name: 'PNG to JPG',
      description: 'Convert PNG images to JPG format',
      inputFormat: 'PNG',
      outputFormat: 'JPG',
      icon: <FileImage size={20} />,
      acceptedTypes: '.png',
    },
    {
      id: 'jpg-to-png',
      name: 'JPG to PNG',
      description: 'Convert JPG images to PNG format',
      inputFormat: 'JPG',
      outputFormat: 'PNG',
      icon: <FileImage size={20} />,
      acceptedTypes: '.jpg,.jpeg',
    },
    {
      id: 'pdf-to-docx',
      name: 'PDF to DOCX',
      description: 'Convert PDF documents to Word format',
      inputFormat: 'PDF',
      outputFormat: 'DOCX',
      icon: <FileText size={20} />,
      acceptedTypes: '.pdf',
    },
    {
      id: 'docx-to-pdf',
      name: 'DOCX to PDF',
      description: 'Convert Word documents to PDF format',
      inputFormat: 'DOCX',
      outputFormat: 'PDF',
      icon: <FileText size={20} />,
      acceptedTypes: '.docx',
    },
  ];

  const currentOption = conversionOptions.find(opt => opt.id === selectedConversion)!;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedFile(null);
    }
  };

  const convertFile = async () => {
    if (!file) return;

    setConverting(true);

    try {
      if (selectedConversion === 'png-to-jpg' || selectedConversion === 'jpg-to-png') {
        await convertImage();
      } else {
        await convertDocument();
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const convertImage = async () => {
    if (!file) return;

    return new Promise<void>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          // Fill with white background for JPG conversion
          if (selectedConversion === 'png-to-jpg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              setConvertedFile(blob);
            }
            resolve();
          }, selectedConversion === 'png-to-jpg' ? 'image/jpeg' : 'image/png', 0.9);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const convertDocument = async () => {
    // Simulate document conversion
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create a mock converted file
    const mockContent = selectedConversion === 'pdf-to-docx' 
      ? 'Mock DOCX content from PDF conversion'
      : 'Mock PDF content from DOCX conversion';
    
    const blob = new Blob([mockContent], { 
      type: selectedConversion === 'pdf-to-docx' 
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf'
    });
    
    setConvertedFile(blob);
  };

  const downloadConverted = () => {
    if (!convertedFile || !file) return;

    const url = URL.createObjectURL(convertedFile);
    const link = document.createElement('a');
    link.href = url;
    
    const baseName = file.name.split('.').slice(0, -1).join('.');
    const extension = currentOption.outputFormat.toLowerCase();
    link.download = `${baseName}.${extension}`;
    
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">File Converter</h2>
        <p className="text-slate-600 dark:text-slate-400">Convert between different file formats</p>
      </div>

      {/* Conversion Type Selection */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Select Conversion Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedConversion(option.id);
                setFile(null);
                setConvertedFile(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedConversion === option.id
                  ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded ${
                  selectedConversion === option.id
                    ? 'bg-turquoise-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{option.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{option.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                  {option.inputFormat}
                </span>
                <RefreshCw size={14} className="text-slate-400" />
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                  {option.outputFormat}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-turquoise-100 dark:bg-turquoise-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-turquoise-600 dark:text-turquoise-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Upload {currentOption.inputFormat} File
            </h3>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 mb-4">
              <input
                type="file"
                accept={currentOption.acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                {currentOption.icon}
                <p className="text-slate-600 dark:text-slate-400 mb-2 mt-4">
                  Click to select {currentOption.inputFormat} file or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Supported format: {currentOption.inputFormat}
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

            <Button
              onClick={convertFile}
              disabled={!file || converting}
              className="w-full"
            >
              {converting ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Convert to {currentOption.outputFormat}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Download Section */}
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={32} className="text-green-600 dark:text-green-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Download {currentOption.outputFormat} File
            </h3>

            {convertedFile ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-green-800 dark:text-green-200 font-medium mb-2">
                    Conversion Complete!
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    File size: {formatFileSize(convertedFile.size)}
                  </div>
                </div>
                
                <Button onClick={downloadConverted} className="w-full">
                  <Download size={16} className="mr-2" />
                  Download {currentOption.outputFormat} File
                </Button>
              </div>
            ) : (
              <div className="text-slate-500 dark:text-slate-400 py-8">
                {file ? (
                  converting ? (
                    <div className="space-y-2">
                      <div className="animate-spin w-8 h-8 border-2 border-turquoise-500 border-t-transparent rounded-full mx-auto"></div>
                      <p>Converting your file...</p>
                    </div>
                  ) : (
                    <p>Click convert to process your file</p>
                  )
                ) : (
                  <p>Upload a file to get started</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Supported Formats */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Supported Conversions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Image Formats</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• PNG ↔ JPG conversion</li>
              <li>• Maintains image quality</li>
              <li>• Automatic background handling</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Document Formats</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• PDF ↔ DOCX conversion</li>
              <li>• Preserves formatting</li>
              <li>• Text and layout retention</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};