'use client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Lead Engineer' | 'Editor';
  avatar: string;
  lastLogin: string;
}

const ADMIN_STORAGE_KEY = 'nedject_admin_session_v1';

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch (e) {
    console.warn('Error reading admin session:', e);
    return null;
  }
}

export function setAdminSession(user: AdminUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('nedject_admin_auth_changed'));
  } catch (e) {
    console.error('Failed to set admin session:', e);
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event('nedject_admin_auth_changed'));
  } catch (e) {
    console.error('Failed to clear admin session:', e);
  }
}

/**
 * Authenticates exclusively against the terminal-configured credentials via server API
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success && data.user) {
      setAdminSession(data.user);
      return { success: true, user: data.user };
    }

    return {
      success: false,
      error: data.error || 'Authentication failed. Check terminal credentials.',
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Server connection error during authentication.',
    };
  }
}
