'use client';

import { Document } from '@/lib/context';
import { useApp } from '@/lib/context';
import { FileText, Sheet, Presentation, X } from 'lucide-react';
import { useState } from 'react';


interface RequestModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestModal({ document, isOpen, onClose }: RequestModalProps) {
  const { addModificationRequest, currentUser } = useApp();
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'spreadsheet':
        return <Sheet className="h-8 w-8 text-green-600" />;
      case 'presentation':
        return <Presentation className="h-8 w-8 text-orange-600" />;
      default:
        return <FileText className="h-8 w-8 text-red-600" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document) {
      addModificationRequest({
        id: Math.random().toString(),
        documentId: document.id,
        date: new Date().toISOString().split('T')[0],
        employee: currentUser?.email || 'Unknown Sales Rep',
        account: document.accountName,
        requestDetails: details,
        status: 'Pending',
      });
      setSubmitted(true);
      setTimeout(() => {
        setDetails('');
        setSubmitted(false);
        onClose();
      }, 1500);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Request Modification</h2>
            <p className="text-sm text-slate-600">Submit feedback or request changes for this document. The admin team will review your request.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Document Card */}
        <div className="mb-8 flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
            {getIcon(document.icon)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">{document.accountName}</h3>
            <p className="text-sm text-slate-600">{document.specifier}</p>
            <p className="text-xs text-slate-500 mt-1">{document.sku}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Modification Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g., Update the Q3 pricing on page 4, the current numbers are outdated."
              rows={5}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitted || !details.trim()}
              className="flex-1 rounded-lg bg-slate-800 px-4 py-2.5 font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-900 disabled:opacity-50"
            >
              {submitted ? 'Submitted!' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
