'use client';

import { useApp } from '@/lib/context';
import { Upload, File, FileText } from 'lucide-react';
import { useRef, useState, type DragEvent, type ChangeEvent, type FormEvent } from 'react';
import {
  acceptedDocumentExtensions,
  getDocumentTypeFromFileName,
  type DocumentUploadType,
} from '@/lib/document-types';

const documentTypeLabels: Record<DocumentUploadType, string> = {
  'PDF Document': 'PDF Document',
  'Excel Spreadsheet': 'Excel Spreadsheet',
  'PowerPoint Presentation': 'PowerPoint Presentation',
  'Word Document': 'Word Document',
  'Image': 'Image',
  'CSV File': 'CSV File',
};

export function UploadTab() {
  const { addDocument } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [accountName, setAccountName] = useState('');
  const [sku, setSku] = useState('');
  const [specifier, setSpecifier] = useState('');
  const [docType, setDocType] = useState<DocumentUploadType | ''>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDrag(e);
    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      handleSelectedFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleSelectedFile = (file: File) => {
    const detectedType = getDocumentTypeFromFileName(file.name);

    if (!detectedType) {
      setSelectedFile(null);
      setDocType('');
      setStatusMessage('Unsupported file type. Please upload a PDF, Excel, PowerPoint, or Word document.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setDocType(detectedType);
    setStatusMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setStatusMessage('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('accountName', accountName);
      formData.append('sku', sku);
      formData.append('specifier', specifier);

      await addDocument(formData);

      setAccountName('');
      setSku('');
      setSpecifier('');
      setDocType('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setStatusMessage('Document uploaded successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Upload New Document</h2>
        <p className="text-sm text-slate-600">Add new sales collateral to the repository.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <Upload className={`mx-auto h-10 w-10 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`} />
          <p className="mt-3 font-semibold text-slate-900">Drag and drop file</p>
          <p className="text-sm text-slate-500">or click to browse</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-blue-600">
              <File className="h-3 w-3" />
              PDF
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-blue-600">
              <FileText className="h-3 w-3" />
              Excel
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-blue-600">
              <FileText className="h-3 w-3" />
              PPT
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedDocumentExtensions.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
          {selectedFile && <p className="mt-4 text-sm font-medium text-slate-700">Selected: {selectedFile.name}</p>}
        </div>

        {/* Form Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Account Name</label>
            <input
              type="text"
              placeholder="e.g. Stark Industries"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">SKU</label>
            <input
              type="text"
              placeholder="e.g. ENT-2024-X1"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Specifier / Document Title</label>
            <input
              type="text"
              placeholder="e.g. Enterprise Agreement"
              value={specifier}
              onChange={(e) => setSpecifier(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Document Type</label>
            <input
              type="text"
              value={docType ? documentTypeLabels[docType] : 'Select a supported file to auto-detect the type'}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-slate-900 transition-colors focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 active:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Upload to Portal'}
        </button>

        {statusMessage && <p className="text-sm text-slate-600">{statusMessage}</p>}
      </form>
    </div>
  );
}
