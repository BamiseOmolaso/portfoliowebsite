// Re-export client auth utilities
export {
  createBrowserClient,
  signIn,
  signOut,
  refreshSession,
  getSession as getClientSession
} from './client-auth';

// Re-export server auth utilities
export {
  createClient,
  getSession as getServerSession,
  getProfile,
  checkAdminAccess
} from './server-auth';

// Common auth types
export interface AuthSession {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Common auth utilities
export function isAuthenticated(session: AuthSession | null): boolean {
  return !!session && session.expires_at > Date.now() / 1000;
}

export function hasRole(session: AuthSession | null, role: string): boolean {
  return isAuthenticated(session) && session?.user.role === role;
}

export function isAdmin(session: AuthSession | null): boolean {
  return hasRole(session, 'admin');
} 