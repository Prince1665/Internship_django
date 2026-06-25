'use client';

import { AdminDashboard } from '@/components/admin-dashboard';
import { AuthGuard } from '@/components/auth-guard';

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <AdminDashboard />
        </div>
      </main>
    </AuthGuard>
  );
}
