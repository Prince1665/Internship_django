'use client';

import { useApp } from '@/lib/context';
import { StatusBadge } from './status-badge';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

export function ModificationRequestsTab() {
  const { modificationRequests, addModificationRequest } = useApp();
  const [approving, setApproving] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApproving(id);
    setTimeout(() => setApproving(null), 1500);
  };

  const handleReject = (id: string) => {
    setApproving(id);
    setTimeout(() => setApproving(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Modification Requests</h2>
        <p className="text-sm text-slate-600">Review feedback and update requests from the sales team.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Account</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Request Details</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modificationRequests.map((request, idx) => (
              <tr
                key={request.id}
                className={`transition-colors hover:bg-gray-50 ${idx !== modificationRequests.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <td className="px-6 py-4 text-sm text-slate-600">{request.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{request.employee}</td>
                <td className="px-6 py-4 text-sm">
                  <a href="#" className="text-blue-600 hover:underline">
                    {request.account}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                  <div className="line-clamp-2">{request.requestDetails}</div>
                </td>
                <td className="px-6 py-4">
                  {request.status === 'Pending' ? (
                    <StatusBadge status={request.status} />
                  ) : request.status === 'Processed' ? (
                    <span className="text-sm text-slate-500">{request.status}</span>
                  ) : (
                    <StatusBadge status={request.status} />
                  )}
                </td>
                <td className="px-6 py-4">
                  {request.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">{request.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
