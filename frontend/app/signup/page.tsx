'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SIGNUP_ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access to all features' },
  { value: 'KAM', label: 'KAM', description: 'Upload & manage documents' },
  { value: 'SALES', label: 'Sales', description: 'View documents & request access' },
];

export default function SignupPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsPending(false);
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

    const signupRes = await fetch(`${base}/api/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: selectedRole }),
    });

    setIsPending(false);

    if (!signupRes.ok) {
      const body = await signupRes.json().catch(() => null);
      setError(body?.error ?? 'Signup failed. Please try again.');
      return;
    }

    // Redirect to login — user must sign in manually after registering
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">DocReview</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SIGNUP_ROLES.map((role) => (
                  <button key={role.value} type="button" onClick={() => setSelectedRole(role.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-center transition-all relative
                      ${selectedRole === role.value
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-600 bg-slate-700/40 hover:border-slate-500'}`}>
                    <span className="text-sm font-semibold text-white">{role.label}</span>
                    <span className="text-xs text-slate-500">{role.description}</span>
                    {selectedRole === role.value && (
                      <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="••••••••"
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="••••••••"
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={isPending}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 mt-1">
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</a>
        </p>
        <p className="text-center text-slate-500 text-xs mt-3">
          Document Review System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
