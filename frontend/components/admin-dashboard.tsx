'use client';

import { useState } from 'react';
import { AdminDocumentsTab } from './admin-documents-tab';
import { AdminReadRequestsTab } from './admin-read-requests-tab';

type AdminTab = 'documents' | 'read-requests';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('documents');

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'documents', label: 'Documents' },
    { id: 'read-requests', label: 'Read Access Requests' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage documents and review read access requests.</p>
      </div>

      <div className="inline-flex w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 sm:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === 'documents' && <AdminDocumentsTab />}
        {activeTab === 'read-requests' && <AdminReadRequestsTab />}
      </div>
    </div>
  );
}
