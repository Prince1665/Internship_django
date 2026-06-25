'use client';

import { useState } from 'react';
import { KamUploadTab } from './kam-upload-tab';
import { KamDocumentsTab } from './kam-documents-tab';

type KamTab = 'upload' | 'documents';

export function KamDashboard() {
  const [activeTab, setActiveTab] = useState<KamTab>('upload');

  const tabs: { id: KamTab; label: string }[] = [
    { id: 'upload', label: 'Upload Document' },
    { id: 'documents', label: 'My Documents' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">KAM Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Upload documents and track submissions sent to admin and sales.</p>
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
        {activeTab === 'upload' && <KamUploadTab onUploaded={() => setActiveTab('documents')} />}
        {activeTab === 'documents' && <KamDocumentsTab />}
      </div>
    </div>
  );
}
