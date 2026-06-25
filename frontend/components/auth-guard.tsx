'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';

interface AuthGuardProps {
  requiredRole: string;
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.replace('/login'); return; }
    const role = user.role?.toUpperCase();
    if (role !== requiredRole.toUpperCase()) {
      if (role === 'ADMIN') router.replace('/admin');
      else if (role === 'KAM') router.replace('/kam');
      else router.replace('/sales');
      return;
    }
    setReady(true);
  }, [requiredRole, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verifying session…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
