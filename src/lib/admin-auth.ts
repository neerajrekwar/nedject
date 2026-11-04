'use client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Lead Engineer' | 'Editor';
  avatar: string;
  lastLogin: string;
}

export interface AdminAuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
  isLocked?: boolean;
  remainingAttempts?: number;
  retryAfterMinutes?: number;
  retryAfterSeconds?: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  isLocked: boolean;
  totalAttempts: number;
  remainingAttempts: number;
  maxAttempts: number;
  windowHours: number;
  retryAfterMinutes: number;
  retryAfterSeconds: number;
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
    // Call server to clear httpOnly admin cookie
    fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
    window.dispatchEvent(new Event('nedject_admin_auth_changed'));
  } catch (e) {
    console.error('Failed to clear admin session:', e);
  }
}

/**
 * Returns authorization headers populated with active admin session credentials
 */
export function getAdminHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const session = getAdminSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-token': 'authorized',
    ...customHeaders,
  };
  if (session?.email) {
    headers['x-admin-email'] = session.email;
  }
  return headers;
}

/**
 * Checks the current rate limit status without consuming an attempt
 */
export async function fetchAdminRateLimitStatus(email?: string): Promise<RateLimitStatus | null> {
  try {
    const url = email
      ? `/api/admin/auth/login?email=${encodeURIComponent(email)}`
      : '/api/admin/auth/login';
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    return (await res.json()) as RateLimitStatus;
  } catch {
    return null;
  }
}

/**
 * Authenticates exclusively against the terminal-configured credentials via server API
 * Enforces strict 3-attempts-per-hour rate limiting
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminAuthResult> {
  try {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success && data.user) {
      setAdminSession(data.user);
      return {
        success: true,
        user: data.user,
        remainingAttempts: data.remainingAttempts ?? 3,
      };
    }

    const isLocked = res.status === 429 || Boolean(data.isLocked);

    return {
      success: false,
      error:
        data.error ||
        (isLocked
          ? 'Too many login attempts. Locked for 1 hour.'
          : 'Authentication failed. Check terminal credentials.'),
      isLocked,
      remainingAttempts: data.remainingAttempts,
      retryAfterMinutes: data.retryAfterMinutes,
      retryAfterSeconds: data.retryAfterSeconds,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Server connection error during authentication.',
    };
  }
}
