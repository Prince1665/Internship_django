"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, apiFetchFormData, getStoredUser, saveAuth, clearAuth, AuthUser } from './auth';
import { useRouter } from 'next/navigation';

export type UserRole = 'ADMIN' | 'SALES' | 'KAM';
export type DocumentStatus = 'Active' | 'Under Review' | 'Revised';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processed';
export type ReadAccessStatus = 'pending' | 'approved' | 'rejected';

export interface Document {
  id: string;
  accountName: string;
  specifier: string;
  sku: string;
  date: string;
  status: DocumentStatus;
  icon: 'file' | 'spreadsheet' | 'presentation' | 'image' | 'csv';
  fileName?: string;
  mimeType?: string;
  uploadedBy?: string;
  notes?: string;
}

export interface ModificationRequest {
  id: string;
  documentId?: string;
  date: string;
  employee: string;
  account: string;
  requestDetails: string;
  status: RequestStatus;
}

export interface ReadAccessRequest {
  id: string;
  documentId: string;
  requestedBy: string;
  requestedAt: string;
  status: ReadAccessStatus;
}

interface AppContextType {
  currentUserRole: UserRole | null;
  currentUser: { id: string; email: string; role: string } | null;
  documents: Document[];
  modificationRequests: ModificationRequest[];
  readAccessRequests: ReadAccessRequest[];
  login: (user: AuthUser) => void;
  addModificationRequest: (request: ModificationRequest) => Promise<void>;
  addDocument: (formData: FormData) => Promise<Document>;
  addReadAccessRequest: (req: ReadAccessRequest) => Promise<void>;
  updateReadAccessRequest: (id: string, status: ReadAccessStatus) => Promise<void>;
  deleteReadAccessRequest: (id: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  signOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [modificationRequests, setModificationRequests] = useState<ModificationRequest[]>([]);
  const [readAccessRequests, setReadAccessRequests] = useState<ReadAccessRequest[]>([]);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);
  }, []);

  // Load data when user is set
  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    const load = async () => {
      try {
        const [docsRes, reqRes, readReqRes] = await Promise.all([
          apiFetch('/api/documents/'),
          apiFetch('/api/requests/'),
          apiFetch('/api/read-requests/'),
        ]);
        if (docsRes.ok && mounted) setDocuments(await docsRes.json());
        if (reqRes.ok && mounted) setModificationRequests(await reqRes.json());
        if (readReqRes.ok && mounted) setReadAccessRequests(await readReqRes.json());
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [currentUser]);

  /** Call this after a successful login API response — saves to localStorage AND updates context state. */
  const login = (user: AuthUser) => {
    saveAuth(user);
    setCurrentUser({ id: user.id, email: user.email, role: user.role });
  };

  const signOut = () => {
    clearAuth();
    setCurrentUser(null);
    setDocuments([]);
    setModificationRequests([]);
    setReadAccessRequests([]);
    router.replace('/login');
  };

  const addModificationRequest = async (request: ModificationRequest) => {
    const res = await apiFetch('/api/requests/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? 'Unable to save request');
    }
    setModificationRequests((prev) => [request, ...prev]);
  };

  const addDocument = async (formData: FormData) => {
    const res = await apiFetchFormData('/api/documents/', formData);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? 'Unable to upload document.');
    }
    const doc = (await res.json()) as Document;
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  };

  const addReadAccessRequest = async (req: ReadAccessRequest) => {
    const res = await apiFetch('/api/read-requests/', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? 'Unable to send request.');
    }
    setReadAccessRequests((prev) => [req, ...prev]);
  };

  const updateReadAccessRequest = async (id: string, status: ReadAccessStatus) => {
    const res = await apiFetch(`/api/read-requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? 'Unable to update request.');
    }
    setReadAccessRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const deleteReadAccessRequest = async (id: string) => {
    const res = await apiFetch(`/api/read-requests/${id}/`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? 'Unable to delete request.');
    }
    setReadAccessRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    const res = await apiFetch(`/api/documents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? 'Unable to update document.');
    }
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const currentUserRole = currentUser ? (currentUser.role as UserRole) : null;

  return (
    <AppContext.Provider value={{
      currentUserRole, currentUser,
      documents, modificationRequests, readAccessRequests,
      login, addModificationRequest, addDocument,
      addReadAccessRequest, updateReadAccessRequest, deleteReadAccessRequest,
      updateDocument, signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
