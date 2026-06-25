'use client';

import { KamDashboard } from '@/components/kam-dashboard';
import { AuthGuard } from '@/components/auth-guard';

export default function KamPage() {
  return (
    <AuthGuard requiredRole="KAM">
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <KamDashboard />
        </div>
      </main>
    </AuthGuard>
  );
}
