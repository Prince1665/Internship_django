'use client';

import { SalesCollateral } from '@/components/sales-collateral';
import { RequestModal } from '@/components/request-modal';
import { AuthGuard } from '@/components/auth-guard';
import { useState } from 'react';
import { Document } from '@/lib/context';

export default function SalesPage() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  return (
    <AuthGuard requiredRole="SALES">
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <SalesCollateral onRequestEdit={handleRequestEdit} />
        </div>
        <RequestModal
          document={selectedDocument}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocument(null);
          }}
        />
      </main>
    </AuthGuard>
  );
}
