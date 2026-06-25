// ─── JWT auth utilities — Django backend ─────────────────────────────────────
// All auth state lives in localStorage (client-only).
// No NextAuth, no server actions, no Prisma — pure JWT via Django SimpleJWT.

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'KAM' | 'SALES';
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY   = 'auth_access';
const REFRESH_KEY = 'auth_refresh';
const USER_KEY    = 'auth_user';

export function saveAuth(user: AuthUser) {
  localStorage.setItem(TOKEN_KEY,   user.accessToken);
  localStorage.setItem(REFRESH_KEY, user.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: user.id, email: user.email, role: user.role,
  }));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getStoredUser(): { id: string; email: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** Returns Authorization header object if a token is present, else empty object. */
export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Fetch wrapper that automatically attaches the JWT Bearer token. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
  });
}

/** Multipart/form-data fetch (file uploads) — omits Content-Type so browser sets boundary. */
export async function apiFetchFormData(path: string, body: FormData): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body,
  });
}
