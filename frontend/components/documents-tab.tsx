'use client';

import { DocumentStatus, useApp } from '@/lib/context';
import { StatusBadge } from './status-badge';
import { FileText, Sheet, Presentation, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function DocumentsTab() {
  const { documents } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');

  const filteredDocs = documents.filter(
    (doc) =>
      ((doc.accountName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.sku ?? '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || doc.status === statusFilter)
  );

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'spreadsheet':
        return <Sheet className="h-5 w-5 text-green-600" />;
      case 'presentation':
        return <Presentation className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">All Documents</h2>
        <p className="text-sm text-slate-600">View and manage all uploaded collateral.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search accounts or SKUs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Filter className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | DocumentStatus)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Revised">Revised</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Account Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Specifier</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">SKU</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc, idx) => (
              <tr
                key={doc.id}
                className={`transition-colors hover:bg-gray-50 ${idx !== filteredDocs.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getIcon(doc.icon)}
                    <span className="font-medium text-slate-900">{doc.accountName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    {doc.specifier}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{doc.sku}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{doc.date}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
