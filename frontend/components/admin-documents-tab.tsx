'use client';

import { useApp, Document, DocumentStatus } from '@/lib/context';
import { StatusBadge } from './status-badge';
import { FileText, Sheet, Presentation, Image, Table, Download, Pencil, X, Check, RefreshCw, Search, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

type FileTypeFilter = 'all' | Document['icon'];

const FILE_TYPE_LABELS: Record<Document['icon'], string> = {
  file: 'Document',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  image: 'Image',
  csv: 'CSV',
};

export function AdminDocumentsTab() {
  const { documents, updateDocument } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<Document>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const filteredDocs = documents
    .filter(
      (doc) =>
        ((doc.accountName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.sku ?? '').toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'all' || doc.status === statusFilter) &&
        (fileTypeFilter === 'all' || doc.icon === fileTypeFilter)
    )
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'spreadsheet': return <Sheet className="h-5 w-5 text-emerald-600" />;
      case 'presentation': return <Presentation className="h-5 w-5 text-orange-600" />;
      case 'image': return <Image className="h-5 w-5 text-purple-600" />;
      case 'csv': return <Table className="h-5 w-5 text-teal-600" />;
      default: return <FileText className="h-5 w-5 text-red-600" />;
    }
  };

  const handleDownload = (docId: string) => {
    setDownloadingId(docId);
    const anchor = document.createElement('a');
    anchor.href = `/api/documents/${docId}/download`;
    anchor.rel = 'noreferrer';
    anchor.download = '';
    anchor.click();
    setTimeout(() => setDownloadingId(null), 1500);
  };

  const startEdit = (doc: Document) => {
    setEditingId(doc.id);
    setEditFields({
      accountName: doc.accountName,
      specifier: doc.specifier,
      sku: doc.sku,
      status: doc.status,
      notes: doc.notes ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateDocument(id, editFields);
      setEditingId(null);
      setEditFields({});
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">All Documents</h2>
        <p className="text-sm text-slate-500">View, download, and edit documents submitted by KAM.</p>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      {savedId && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Document updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts or SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | DocumentStatus)}
          className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Under Review">Under Review</option>
          <option value="Revised">Revised</option>
        </select>
        <select
          value={fileTypeFilter}
          onChange={(e) => setFileTypeFilter(e.target.value as FileTypeFilter)}
          className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All file types</option>
          {Object.entries(FILE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortOrder((order) => (order === 'newest' ? 'oldest' : 'newest'))}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Document</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Uploaded By</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc, idx) => {
              const isEditing = editingId === doc.id;
              return (
                <tr
                  key={doc.id}
                  className={`transition-colors hover:bg-slate-50 ${idx !== filteredDocs.length - 1 ? 'border-b border-slate-200' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                        {getIcon(doc.icon)}
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            className="mb-1 block w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={editFields.accountName ?? ''}
                            onChange={(e) => setEditFields((f) => ({ ...f, accountName: e.target.value }))}
                          />
                        ) : (
                          <p className="font-medium text-slate-900">{doc.accountName}</p>
                        )}
                        {isEditing ? (
                          <input
                            className="block w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={editFields.specifier ?? ''}
                            onChange={(e) => setEditFields((f) => ({ ...f, specifier: e.target.value }))}
                          />
                        ) : (
                          <p className="text-xs text-slate-500">{doc.specifier}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input
                        className="w-28 rounded border border-slate-300 px-2 py-1 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editFields.sku ?? ''}
                        onChange={(e) => setEditFields((f) => ({ ...f, sku: e.target.value }))}
                      />
                    ) : (
                      <span className="font-mono text-xs text-slate-600">{doc.sku}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {doc.uploadedBy ?? <span className="text-slate-400">Not assigned</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{doc.date}</td>
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        className="rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editFields.status ?? doc.status}
                        onChange={(e) => setEditFields((f) => ({ ...f, status: e.target.value as DocumentStatus }))}
                      >
                        <option value="Active">Active</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Revised">Revised</option>
                      </select>
                    ) : (
                      <StatusBadge status={doc.status} />
                    )}
                  </td>
                  <td className="max-w-[160px] px-5 py-4 text-sm text-slate-500">
                    {isEditing ? (
                      <textarea
                        rows={2}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editFields.notes ?? ''}
                        onChange={(e) => setEditFields((f) => ({ ...f, notes: e.target.value }))}
                      />
                    ) : (
                      <div className="line-clamp-2">{doc.notes || <span className="text-slate-400">No notes</span>}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(doc.id)}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                          >
                            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDownload(doc.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingId === doc.id ? 'Downloaded' : 'Download'}
                          </button>
                          <button
                            onClick={() => startEdit(doc)}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
