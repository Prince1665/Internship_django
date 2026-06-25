// ─── Shared type definitions for Django JWT backend ───────────────────────────

export type UserRole = 'ADMIN' | 'KAM' | 'SALES';

// Shape returned by Django /api/auth/login/
export interface LoginResponse {
  access: string;
  refresh: string;
  role: UserRole;
  email: string;
  id: string;
}

// Form-level error state used in login & signup pages
export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    role?: string[];
  };
  message?: string;
} | undefined;

// Modification / change request form
export type ChangeRequestFormState = {
  errors?: {
    description?: string[];
  };
  message?: string;
} | undefined;

// NOTE: SessionPayload / getUserId / getLatestChangeRequest belonged to the
// old TypeScript (NextAuth / Prisma) backend and have been removed.
// Auth state is now managed entirely via JWT tokens in localStorage — see lib/auth.ts.
