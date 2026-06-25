'use client';

import { useApp } from '@/lib/context';

import { StatusBadge } from './status-badge';
import { FileText, Sheet, Presentation, Image, Table } from 'lucide-react';

export function KamDocumentsTab() {
  const { documents, currentUser } = useApp();
  const userEmail = currentUser?.email;
  
  

  const myDocs = documents.filter((doc) => doc.uploadedBy === userEmail);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'spreadsheet': return <Sheet className="h-5 w-5 text-emerald-600" />;
      case 'presentation': return <Presentation className="h-5 w-5 text-orange-600" />;
      case 'image': return <Image className="h-5 w-5 text-purple-600" />;
      case 'csv': return <Table className="h-5 w-5 text-teal-600" />;
      default: return <FileText className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">My Uploaded Documents</h2>
        <p className="text-sm text-slate-500">Documents you have submitted — visible to admin and sales.</p>
      </div>

      {myDocs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Document</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody>
              {myDocs.map((doc, idx) => (
                <tr
                  key={doc.id}
                  className={`transition-colors hover:bg-slate-50 ${idx !== myDocs.length - 1 ? 'border-b border-slate-200' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                        {getIcon(doc.icon)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.accountName}</p>
                        <p className="text-xs text-slate-500">{doc.specifier}</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
