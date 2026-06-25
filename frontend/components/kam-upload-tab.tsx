'use client';

import { useApp } from '@/lib/context';
import { Upload, File, FileText, Image, Table, CheckCircle2, AlertCircle } from 'lucide-react';
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

interface Props {
  onUploaded?: () => void;
}

export function KamUploadTab({ onUploaded }: Props) {
  const { addDocument, currentUser } = useApp();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [accountName, setAccountName] = useState('');
  const [sku, setSku] = useState('');
  const [specifier, setSpecifier] = useState('');
  const [notes, setNotes] = useState('');
  const [docType, setDocType] = useState<DocumentUploadType | ''>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDrag(e);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleSelectedFile(droppedFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) handleSelectedFile(file);
  };

  const handleSelectedFile = (file: File) => {
    const detectedType = getDocumentTypeFromFileName(file.name);
    if (!detectedType) {
      setSelectedFile(null);
      setDocType('');
      setStatusMessage('Unsupported file type.');
      setStatusType('error');
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      setStatusType('error');
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
      formData.append('notes', notes);
      formData.append('uploadedBy', (currentUser?.email ?? ''));

      await addDocument(formData);

      setAccountName('');
      setSku('');
      setSpecifier('');
      setNotes('');
      setDocType('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStatusMessage('Document uploaded successfully. Admin and sales can now view it.');
      setStatusType('success');
      onUploaded?.();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed.');
      setStatusType('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Upload New Document</h2>
        <p className="text-sm text-slate-500">Fill in the details and attach a file. It will be shared with admin and sales.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : selectedFile
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
        >
          {selectedFile ? (
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          ) : (
            <Upload className={`mx-auto h-10 w-10 ${isDragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
          )}
          <p className="mt-3 font-medium text-slate-900">
            {selectedFile ? selectedFile.name : 'Drag and drop file'}
          </p>
          <p className="text-sm text-slate-500">
            {selectedFile ? 'Click to choose a different file' : 'or click to browse'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { label: 'PDF', icon: <File className="h-3.5 w-3.5" /> },
              { label: 'Excel / CSV', icon: <Table className="h-3.5 w-3.5" /> },
              { label: 'Word', icon: <FileText className="h-3.5 w-3.5" /> },
              { label: 'Image', icon: <Image className="h-3.5 w-3.5" /> },
            ].map(({ label, icon }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600">
                {icon}
                {label}
              </span>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedDocumentExtensions.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Form Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Account Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Stark Industries"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">SKU <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. ENT-2024-X1"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Document Title / Specifier <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Enterprise Agreement"
              value={specifier}
              onChange={(e) => setSpecifier(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Document Type</label>
            <input
              type="text"
              value={docType ? documentTypeLabels[docType] : 'Auto-detected from file'}
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">Notes / Description</label>
          <textarea
            placeholder="Add any context or notes about this document for admin and sales..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Submit Document'}
        </button>

        {statusMessage && (
          <p className={`flex items-center gap-1.5 text-sm ${statusType === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {statusType === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}
