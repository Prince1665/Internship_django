'use client';

import { useApp } from '@/lib/context';
import { Check, X, RefreshCw, Inbox, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

const statusDots: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

export function AdminReadRequestsTab() {
  const { readAccessRequests, documents, updateReadAccessRequest, deleteReadAccessRequest } = useApp();
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requesterFilter, setRequesterFilter] = useState<'all' | string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const getDocName = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    return doc ? `${doc.accountName} — ${doc.specifier}` : docId;
  };

  const requesters = useMemo(
    () => Array.from(new Set(readAccessRequests.map((r) => r.requestedBy))).sort(),
    [readAccessRequests]
  );

  const sortedRequests = useMemo(
    () =>
      [...readAccessRequests].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      ),
    [readAccessRequests]
  );

  const visibleRequests = useMemo(
    () =>
      requesterFilter === 'all'
        ? sortedRequests
        : sortedRequests.filter((r) => r.requestedBy === requesterFilter),
    [sortedRequests, requesterFilter]
  );

  const resolvedCount = visibleRequests.filter((r) => r.status !== 'pending').length;

  const handle = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    setError(null);
    try {
      await updateReadAccessRequest(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request. Please try again.');
    }
    setProcessing(null);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === visibleRequests.length ? new Set() : new Set(visibleRequests.map((r) => r.id))
    );
  };

  const clearRequests = async (ids: string[]) => {
    if (ids.length === 0) return;
    setClearing(true);
    setError(null);
    try {
      for (const id of ids) {
        await deleteReadAccessRequest(id);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear requests. Please try again.');
    }
    setClearing(false);
  };

  const clearResolved = () =>
    clearRequests(visibleRequests.filter((r) => r.status !== 'pending').map((r) => r.id));

  const clearSelected = () => clearRequests(Array.from(selectedIds));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Read Access Requests</h2>
        <p className="text-sm text-slate-500">Sales users who want to view a document file request access here. Approve or reject below.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {readAccessRequests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          No read access requests yet.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select
              value={requesterFilter}
              onChange={(e) => {
                setRequesterFilter(e.target.value);
                setSelectedIds(new Set());
              }}
              className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All requesters</option>
              {requesters.map((email) => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearSelected}
                disabled={selectedIds.size === 0 || clearing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Clear selected{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
              </button>
              <button
                type="button"
                onClick={clearResolved}
                disabled={resolvedCount === 0 || clearing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Clear resolved{resolvedCount > 0 ? ` (${resolvedCount})` : ''}
              </button>
            </div>
          </div>

          {visibleRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              No requests match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-10 px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === visibleRequests.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Document</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Requested By</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Requested At</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((req, idx) => (
                    <tr
                      key={req.id}
                      className={`transition-colors hover:bg-slate-50 ${idx !== visibleRequests.length - 1 ? 'border-b border-slate-200' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(req.id)}
                          onChange={() => toggleSelected(req.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">{getDocName(req.documentId)}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{req.requestedBy}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(req.requestedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[req.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {processing === req.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDots[req.status] ?? 'bg-slate-400'}`} />
                          )}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {req.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handle(req.id, 'approved')}
                              disabled={processing === req.id}
                              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing === req.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handle(req.id, 'rejected')}
                              disabled={processing === req.id}
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing === req.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
