'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.replace('/login'); return; }
    const role = user.role?.toUpperCase();
    if (role === 'ADMIN') router.replace('/admin');
    else if (role === 'KAM') router.replace('/kam');
    else router.replace('/sales');
  }, [router]);

  return null;
}
