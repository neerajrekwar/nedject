'use client';

export const GUEST_GENERATION_LIMIT = 2;
export const AUTH_FREE_GENERATION_LIMIT = 10;
export const PRO_GENERATION_LIMIT = 99999; // Unlimited for Pro

export type ToolKey =
  | 'qr_studio'
  | 'photo_dpi'
  | 'insta_clip'
  | 'barcode_pick'
  | 'fitness_glass'
  | 'mockup_studio'
  | 'batch_zip'
  | 'general_generator';

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  canGenerate: boolean;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  isUnlimited?: boolean;
  plan: 'guest' | 'free' | 'pro' | 'enterprise';
  badgeColor?: 'green' | 'yellow' | 'purple';
  badgeLabel?: string;
  displayRemaining?: string;
  displayLimit?: string;
  toolBreakdown?: Record<string, number>;
}

const STORAGE_USAGE_KEY = 'Nedject_usage_count_v2';
const STORAGE_BREAKDOWN_KEY = 'Nedject_tool_breakdown_v2';

export function isClientAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('nedject_admin_session_v1');
    return Boolean(raw);
  } catch {
    return false;
  }
}

export function getLocalUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_USAGE_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function getLocalToolBreakdown(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_BREAKDOWN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalUsageCount(count: number, toolKey?: ToolKey): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USAGE_KEY, count.toString());

    if (toolKey) {
      const breakdown = getLocalToolBreakdown();
      breakdown[toolKey] = (breakdown[toolKey] || 0) + 1;
      localStorage.setItem(STORAGE_BREAKDOWN_KEY, JSON.stringify(breakdown));
    }

    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new Event('Nedject_usage_updated'));
  } catch (e) {
    console.error('Failed to set local usage count:', e);
  }
}

export const STORAGE_PLAN_KEY = 'nedject_active_plan';

export function getCachedActivePlan(): 'free' | 'pro' | 'enterprise' | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_PLAN_KEY);
    if (raw === 'enterprise' || raw === 'pro' || raw === 'free') {
      return raw as 'free' | 'pro' | 'enterprise';
    }
    return null;
  } catch {
    return null;
  }
}

export function setCachedActivePlan(plan: 'free' | 'pro' | 'enterprise'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PLAN_KEY, plan);
    window.dispatchEvent(new CustomEvent('nedject_plan_updated', { detail: { plan } }));
    window.dispatchEvent(new Event('Nedject_usage_updated'));
  } catch (e) {
    console.warn('Failed to cache plan:', e);
  }
}

export function getUsageStats(
  isLoggedIn: boolean,
  plan: 'free' | 'pro' | 'enterprise' | string = 'free',
  isAdminOverride?: boolean
): UsageStats {
  const used = getLocalUsageCount();
  const isAdmin = isAdminOverride ?? isClientAdmin();
  const cachedPlan = isLoggedIn ? getCachedActivePlan() : null;
  const effectivePlan =
    plan === 'enterprise' || plan === 'pro'
      ? plan
      : cachedPlan || plan;

  const normalizedPlan: 'guest' | 'free' | 'pro' | 'enterprise' = !isLoggedIn
    ? 'guest'
    : isAdmin
    ? 'enterprise'
    : (effectivePlan === 'pro' || effectivePlan === 'enterprise' ? effectivePlan : 'free');

  const isPaidPlan = normalizedPlan === 'pro' || normalizedPlan === 'enterprise';
  const isUnlimited = isAdmin || isPaidPlan;
  const limit = !isLoggedIn
    ? GUEST_GENERATION_LIMIT
    : isUnlimited
    ? PRO_GENERATION_LIMIT
    : AUTH_FREE_GENERATION_LIMIT;

  const remaining = isUnlimited ? 99999 : Math.max(0, limit - used);
  const canGenerate = isUnlimited || remaining > 0;

  // Colors based on user specifications:
  // Green: free / guest / 2-10 uses
  // Yellow: pro studio
  // Purple: enterprise pack / admin
  let badgeColor: 'green' | 'yellow' | 'purple' = 'green';
  let badgeLabel = '2 Free Uses';
  let displayRemaining = '2 Uses';
  let displayLimit = '2';

  if (!isLoggedIn) {
    badgeColor = 'green';
    badgeLabel = '2 Free Uses';
    displayRemaining = '2 Uses';
    displayLimit = '2';
  } else if (isAdmin) {
    badgeColor = 'purple';
    badgeLabel = 'Admin Unlimited';
    displayRemaining = '∞ Unlimited';
    displayLimit = 'Unlimited';
  } else if (normalizedPlan === 'enterprise') {
    badgeColor = 'purple';
    badgeLabel = 'Enterprise Pack';
    displayRemaining = '∞ Unlimited';
    displayLimit = 'Unlimited';
  } else if (normalizedPlan === 'pro') {
    badgeColor = 'yellow';
    badgeLabel = 'Pro Studio';
    displayRemaining = '∞ Unlimited';
    displayLimit = 'Unlimited';
  } else {
    badgeColor = 'green';
    badgeLabel = 'Free Tier';
    displayRemaining = `${remaining} / 10`;
    displayLimit = '10';
  }

  return {
    used,
    limit,
    remaining,
    canGenerate,
    isLoggedIn,
    isAdmin,
    isUnlimited,
    plan: normalizedPlan,
    badgeColor,
    badgeLabel,
    displayRemaining,
    displayLimit,
    toolBreakdown: getLocalToolBreakdown(),
  };
}

/**
 * Consumes 1 quota for a specific tool. If quota exhausted, dispatches limit modal event and returns false.
 */
export async function consumeToolQuota(
  toolKey: ToolKey = 'general_generator',
  isLoggedIn: boolean = false,
  plan: 'free' | 'pro' | 'enterprise' | string = 'free',
  isAdminOverride?: boolean
): Promise<{ allowed: boolean; stats: UsageStats; message?: string }> {
  const currentStats = getUsageStats(isLoggedIn, plan, isAdminOverride);

  if (!currentStats.canGenerate) {
    const message = !isLoggedIn
      ? `Initial free guest uses (${GUEST_GENERATION_LIMIT}) reached. Sign in with Google or Email to unlock 10 account credits, or upgrade to Pro for unlimited!`
      : `Account limit reached (${currentStats.limit}/${currentStats.limit}). Upgrade to Pro Studio to unlock unlimited 300 & 600 DPI generations and vector exports.`;

    // Trigger universal quota exhaustion dialog modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('Nedject_limit_exhausted', {
          detail: { toolKey, stats: currentStats, message },
        })
      );
    }

    return { allowed: false, stats: currentStats, message };
  }

  // Increment local storage counter immediately
  const nextUsed = currentStats.used + 1;
  setLocalUsageCount(nextUsed, toolKey);

  // Sync with MongoDB backend asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolKey }),
    }).catch((e) => console.warn('Usage sync warning:', e));
  }

  const updatedStats = getUsageStats(isLoggedIn, plan, isAdminOverride);
  return { allowed: true, stats: updatedStats };
}

export function resetGuestUsageForTesting(): void {
  if (typeof window === 'undefined') return;
  setLocalUsageCount(0);
  try {
    localStorage.removeItem(STORAGE_BREAKDOWN_KEY);
  } catch {}
  window.dispatchEvent(new Event('Nedject_usage_updated'));
}

export function syncUsageWithServer(): Promise<UsageStats | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return fetch('/api/usage')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && typeof data.totalUsed === 'number') {
        const local = getLocalUsageCount();
        if (data.totalUsed > local) {
          setLocalUsageCount(data.totalUsed);
        }
        return getUsageStats(Boolean(data.isLoggedIn), data.plan);
      }
      return null;
    })
    .catch(() => null);
}

// Auto-sync usage from server device footprint on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncUsageWithServer();
  }, 100);
}
