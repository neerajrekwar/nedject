'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  LogIn,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { getUsageStats, UsageStats } from '@/lib/usage-limits';
import { getAdminSession } from '@/lib/admin-auth';
import { AuthModal } from './AuthModal';
import { MonetizationBanner } from './MonetizationBanner';

interface UsageBannerProps {
  showMonetization?: boolean;
  className?: string;
}

export const UsageBanner: React.FC<UsageBannerProps> = ({
  showMonetization = true,
  className = '',
}) => {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [monetizationMode, setMonetizationMode] = useState<1 | 0>(0);
  const [stats, setStats] = useState<UsageStats>(() => getUsageStats(false, 'guest', false));

  const checkAdmin = () => {
    if (!session?.user) {
      setIsAdmin(false);
      return false;
    }
    const adminSes = getAdminSession();
    const sessionUser = session?.user as any;
    const isAdm = Boolean(
      adminSes ||
      sessionUser?.role === 'admin' ||
      sessionUser?.isAdmin === true ||
      sessionUser?.email === 'admin@nedject.com' ||
      sessionUser?.email === 'neerajrekwar413@gmail.com' ||
      sessionUser?.planAssignedBy === 'admin'
    );
    setIsAdmin(isAdm);
    return isAdm;
  };

  const refresh = () => {
    const isLogged = Boolean(session?.user);
    if (!isLogged) {
      setIsAdmin(false);
      setStats(getUsageStats(false, 'guest', false));
      return;
    }
    const isAdm = checkAdmin();
    const plan = ((session?.user as any)?.plan || 'free') as string;
    setStats(getUsageStats(true, plan, isAdm));
  };

  useEffect(() => {
    refresh();

    // Fetch feature flag
    fetch('/api/feature-flags')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.monetizationMode === 0 || data?.monetizationMode === 1) {
          setMonetizationMode(data.monetizationMode);
        }
      })
      .catch((e) => console.warn('Failed to fetch feature flags:', e));

    const handleUpdate = () => refresh();
    const handleAdminChanged = () => refresh();

    window.addEventListener('Nedject_usage_updated', handleUpdate);
    window.addEventListener('nedject_admin_auth_changed', handleAdminChanged);

    return () => {
      window.removeEventListener('Nedject_usage_updated', handleUpdate);
      window.removeEventListener('nedject_admin_auth_changed', handleAdminChanged);
    };
  }, [session]);

  const isLogged = Boolean(session?.user);
  const isGuest = !isLogged;
  const isUnlimited = !isGuest && (isAdmin || stats.plan === 'pro' || stats.plan === 'enterprise');
  const isExhausted = !isUnlimited && stats.remaining === 0;

  // Determine tier styling
  // Green base: guest or free tier
  // Yellow base: pro studio
  // Purple base: enterprise pack or admin
  const tierColor = isGuest
    ? 'green'
    : isAdmin || stats.plan === 'enterprise'
    ? 'purple'
    : stats.plan === 'pro'
    ? 'yellow'
    : 'green';

  return (
    <div className={`space-y-4 font-mono select-none ${className}`}>
      {/* 1. Quota Box Styled by Tier Base */}
      <div
        className={`border-4 border-black p-4 sm:p-5 shadow-[4px_4px_0px_#000000] space-y-3.5 ${
          isExhausted
            ? 'bg-[#ffecec] text-rose-950'
            : tierColor === 'purple'
            ? 'bg-[#f6effe] text-purple-950'
            : tierColor === 'yellow'
            ? 'bg-[#fffde6] text-amber-950'
            : 'bg-[#eefbee] text-emerald-950'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 border border-black inline-block shrink-0 ${
                  isExhausted
                    ? 'bg-rose-600'
                    : tierColor === 'purple'
                    ? 'bg-purple-600'
                    : tierColor === 'yellow'
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-black text-xs sm:text-sm uppercase tracking-tight text-black">
                {isGuest
                  ? 'GUEST INITIAL GENERATION QUOTA: 2 FREE USES'
                  : isAdmin
                  ? 'ADMIN MASTER: UNLIMITED RESTRICTIONS BYPASS'
                  : stats.plan === 'enterprise'
                  ? 'ENTERPRISE PACK: UNLIMITED HIGH-VOLUME ACCESS'
                  : stats.plan === 'pro'
                  ? 'PRO STUDIO: UNLIMITED GENERATIONS ACTIVE'
                  : 'AUTHENTICATED ACCOUNT: 10 GENERATIONS QUOTA'}
              </span>
            </div>

            {/* Color-Coded Tier Badge */}
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                tierColor === 'purple'
                  ? 'bg-purple-600 text-white'
                  : tierColor === 'yellow'
                  ? 'bg-amber-400 text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              {tierColor === 'purple'
                ? 'ENTERPRISE / ADMIN BASE'
                : tierColor === 'yellow'
                ? 'PRO STUDIO BASE'
                : 'FREE / STARTER BASE'}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] font-bold text-zinc-800 leading-relaxed">
            {isGuest ? (
              /* If user is not logged in: do NOT show used credits, show initial 2 uses */
              <>
                You have <strong>2 initial free uses</strong> available for studio generations. Connect your account with Google, X, Instagram, or Email to instantly unlock 10 authenticated credits!
              </>
            ) : isAdmin ? (
              <>
                Administrator account detected with complete override permissions. All generation limits and format paywalls are set to <strong>Unlimited</strong>.
              </>
            ) : stats.plan === 'enterprise' ? (
              <>
                Enterprise matrix subscription active with <strong>Unlimited</strong> generations, dedicated press preflight profiles, and high-priority processing queue.
              </>
            ) : stats.plan === 'pro' ? (
              <>
                Pro Studio subscription active with <strong>Unlimited</strong> 300 &amp; 600 DPI generations, 4K Insta-clips, and vector PDF exports.
              </>
            ) : (
              /* Authenticated free: show clean 10 uses remaining, never 99999 */
              <>
                You have <strong>{stats.remaining} of 10</strong> generations remaining for this account. Upgrade to Pro Studio for unlimited generations and commercial licenses.
              </>
            )}
          </p>
        </div>

        {/* Action Button / Account Status Footer */}
        {isGuest ? (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="w-full py-2.5 sm:py-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs sm:text-sm uppercase transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>→] SIGN IN (UNLOCK 10 USES)</span>
          </button>
        ) : (
          <div className="flex items-center justify-between border-t border-black/30 pt-2 text-xs flex-wrap gap-2">
            <span className="font-bold text-zinc-700">
              Account status:{' '}
              <span className="font-black text-black uppercase">
                {isAdmin ? 'ADMIN (UNLIMITED)' : `${stats.plan.toUpperCase()} TIER`}
              </span>
            </span>

            {/* Clean Quota Display: Unlimited or Remaining/10 (Never 20/99999!) */}
            {isUnlimited ? (
              <span className="font-black bg-black text-[#ccff00] px-2.5 py-1 border border-black flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>∞ UNLIMITED ACCESS</span>
              </span>
            ) : (
              <span className="font-black bg-emerald-600 text-white px-2.5 py-1 border border-black">
                {stats.remaining} / 10 CREDITS REMAINING
              </span>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => refresh()}
      />
    </div>
  );
};
