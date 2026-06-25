'use client';

import { useApp, Document, DocumentStatus } from '@/lib/context';
import { StatusBadge } from './status-badge';
import { FileText, Sheet, Presentation, Image, Table, Filter, LayoutGrid, List, Tablet, Eye, EyeOff, Download } from 'lucide-react';
import { useState, type ReactNode } from 'react';


interface SalesCollateralProps {
  onRequestEdit?: (doc: Document) => void;
}

type ViewMode = 'grid' | 'tablet' | 'details';

function ReadAccessButton({ doc }: { doc: Document }) {
  const { readAccessRequests, addReadAccessRequest, currentUser } = useApp();
  const userEmail = currentUser?.email ?? '';
  
  

  const existing = readAccessRequests.find(
    (r) => r.documentId === doc.id && r.requestedBy === userEmail
  );

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [downloadingId, setDownloadingId] = useState(false);

  const handleRequest = async () => {
    setSending(true);
    try {
      await addReadAccessRequest({
        id: Math.random().toString(36).slice(2),
        documentId: doc.id,
        requestedBy: userEmail,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      });
      setSent(true);
    } catch {}
    setSending(false);
  };

  const handleDownload = () => {
    setDownloadingId(true);
    const anchor = document.createElement('a');
    anchor.href = `/api/documents/${doc.id}/download`;
    anchor.rel = 'noreferrer';
    anchor.download = '';
    anchor.click();
    setTimeout(() => setDownloadingId(false), 1500);
  };

  if (existing) {
    if (existing.status === 'approved') {
      return (
        <button
          onClick={handleDownload}
          disabled={downloadingId}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {downloadingId ? 'Downloading...' : 'Download File'}
        </button>
      );
    }

    if (existing.status === 'rejected') {
      return (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <EyeOff className="h-4 w-4" />
          Access Rejected
        </div>
      );
    }

    // pending
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
        <Eye className="h-4 w-4" />
        Access Requested
      </div>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={sending || sent}
      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
    >
      <Eye className="h-4 w-4" />
      {sending ? 'Sending...' : sent ? 'Requested' : 'Request Read Access'}
    </button>
  );
}

export function SalesCollateral({ onRequestEdit }: SalesCollateralProps) {
  const { documents } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredDocuments = documents.filter((doc) => statusFilter === 'all' || doc.status === statusFilter);

  const viewOptions: Array<{ id: ViewMode; label: string; icon: ReactNode }> = [
    { id: 'grid', label: 'Grid', icon: <LayoutGrid className="h-4 w-4" /> },
    { id: 'tablet', label: 'Tablet', icon: <Tablet className="h-4 w-4" /> },
    { id: 'details', label: 'Details', icon: <List className="h-4 w-4" /> },
  ];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'spreadsheet': return <Sheet className="h-6 w-6 text-emerald-600" />;
      case 'presentation': return <Presentation className="h-6 w-6 text-orange-600" />;
      case 'image': return <Image className="h-6 w-6 text-purple-600" />;
      case 'csv': return <Table className="h-6 w-6 text-teal-600" />;
      default: return <FileText className="h-6 w-6 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sales Collateral</h1>
        <p className="mt-1 text-sm text-slate-500">View document details and request read access from admin.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xs">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | DocumentStatus)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Revised">Revised</option>
          </select>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setViewMode(option.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'details' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Document</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Updated</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, idx) => (
                <tr
                  key={doc.id}
                  className={`transition-colors hover:bg-slate-50 ${idx !== filteredDocuments.length - 1 ? 'border-b border-slate-200' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">{getIcon(doc.icon)}</div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.accountName}</p>
                        <p className="text-sm text-slate-500">{doc.specifier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className="font-mono text-xs text-slate-600">{doc.sku}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{doc.date}</td>
                  <td className="px-5 py-4"><StatusBadge status={doc.status} /></td>
                  <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                    <div className="line-clamp-2">{doc.notes || <span className="text-slate-400">No notes</span>}</div>
                  </td>
                  <td className="px-5 py-4">
                    <ReadAccessButton doc={doc} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'tablet' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md ${viewMode === 'tablet' ? 'p-4' : 'p-6'}`}
            >
              <div className={`flex items-start justify-between ${viewMode === 'tablet' ? 'mb-3' : 'mb-4'}`}>
                <div className={`flex ${viewMode === 'tablet' ? 'h-10 w-10' : 'h-12 w-12'} items-center justify-center rounded-lg bg-slate-50`}>
                  {getIcon(doc.icon)}
                </div>
                <StatusBadge status={doc.status} />
              </div>

              <p className={`font-mono font-medium text-slate-400 ${viewMode === 'tablet' ? 'mb-1 text-[11px]' : 'mb-2 text-xs'}`}>{doc.sku}</p>
              <h3 className={`${viewMode === 'tablet' ? 'mb-1 text-base' : 'mb-2 text-lg'} font-semibold text-slate-900`}>{doc.accountName}</h3>
              <p className={`${viewMode === 'tablet' ? 'mb-3 text-xs' : 'mb-4 text-sm'} text-slate-500`}>{doc.specifier}</p>
              {doc.notes && (
                <p className={`${viewMode === 'tablet' ? 'mb-3 text-[11px]' : 'mb-4 text-xs'} text-slate-500 line-clamp-2`}>{doc.notes}</p>
              )}
              <p className={`${viewMode === 'tablet' ? 'mb-4 text-[11px]' : 'mb-6 text-xs'} font-medium uppercase tracking-wide text-slate-400`}>Updated {doc.date}</p>

              <ReadAccessButton doc={doc} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
