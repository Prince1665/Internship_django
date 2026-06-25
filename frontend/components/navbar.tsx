"use client";

import { Building2, ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/context';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  KAM: 'KAM',
  SALES: 'Sales',
};

export function Navbar() {
  const { currentUser, signOut } = useApp();
  const email = currentUser?.email;
  const rawRole = currentUser?.role;
  const role = rawRole ? (ROLE_LABELS[rawRole.toUpperCase()] ?? rawRole) : undefined;
  const initial = email ? email.charAt(0).toUpperCase() : '?';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 shadow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-slate-900">Nexus Portal</h1>
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              System Operational
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {initial}
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="max-w-[160px] truncate text-sm font-medium text-slate-800">
                    {email ?? 'Account'}
                  </span>
                  {role && (
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {role}
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{email ?? 'Account'}</span>
                      </div>
                      {role && (
                        <span className="mt-1.5 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                          {role}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <a href="/login" className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                Sign in
              </a>
              <a href="/signup" className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
                Sign up
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
