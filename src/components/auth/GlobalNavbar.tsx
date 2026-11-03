'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  User,
  LogIn,
  Zap,
  Layers,
  Sparkles,
  QrCode,
  Dumbbell,
  Barcode as BarcodeIcon,
  ShieldAlert,
  Image as ImageIcon,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { getUsageStats, UsageStats } from '@/lib/usage-limits';
import { getAdminSession } from '@/lib/admin-auth';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
import { StoryShareButton } from '@/components/story/StoryShareButton';

export function GlobalNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [monetizationMode, setMonetizationMode] = useState<1 | 0>(1);
  const [usageStats, setUsageStats] = useState<UsageStats>(() => getUsageStats(false, 'guest', false));
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);

  // Sticky on scroll: hide on down-scroll and show on up-scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near the very top of the page
      if (currentScrollY <= 30) {
        setIsVisible(true);
        lastScrollY.current = Math.max(0, currentScrollY);
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Use a threshold to avoid jitter on small trackpad oscillations
      if (diff > 8) {
        // Scrolling down -> hide
        setIsVisible(false);
      } else if (diff < -8) {
        // Scrolling up -> show
        setIsVisible(true);
      }

      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Ensure navbar is immediately visible on route changes
  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);

  // Load feature flag from API
  useEffect(() => {
    fetch('/api/feature-flags')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.monetizationMode === 0 || data?.monetizationMode === 1) {
          setMonetizationMode(data.monetizationMode);
        }
      })
      .catch((e) => console.warn('Failed to load feature flags:', e));
  }, []);

  // Check admin privileges
  const checkAdminStatus = () => {
    const adminSes = getAdminSession();
    const sessionUser = session?.user as any;
    const isAdm = Boolean(
      adminSes ||
      sessionUser?.role === 'admin' ||
      sessionUser?.isAdmin === true ||
      sessionUser?.email === 'admin@nedject.com' ||
      sessionUser?.planAssignedBy === 'admin'
    );
    setIsAdmin(isAdm);
    return isAdm;
  };

  // Update usage stats on mount and session change
  const refreshUsage = () => {
    const isAdm = checkAdminStatus();
    const isLogged = Boolean(session?.user);
    const plan = ((session?.user as any)?.plan || 'free') as string;
    setUsageStats(getUsageStats(isLogged, plan, isAdm));
  };

  useEffect(() => {
    refreshUsage();

    const handleUsageUpdated = () => refreshUsage();
    const handleAdminChanged = () => refreshUsage();

    window.addEventListener('Nedject_usage_updated', handleUsageUpdated);
    window.addEventListener('nedject_admin_auth_changed', handleAdminChanged);

    return () => {
      window.removeEventListener('Nedject_usage_updated', handleUsageUpdated);
      window.removeEventListener('nedject_admin_auth_changed', handleAdminChanged);
    };
  }, [session]);

  // Open auth modal if user was intercepted and redirected with ?auth=signin or ?destination=
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if ((params.get('auth') === 'signin' || params.has('destination')) && !session?.user) {
      setShowAuthModal(true);
    }
  }, [session]);

  const handleToggleMonetizationMode = async (newMode: 1 | 0) => {
    setMonetizationMode(newMode);
    try {
      await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monetizationMode: newMode }),
      });
    } catch (e) {
      console.warn('Failed to update feature flag in database:', e);
    }
  };

  const navLinks = [
    { href: '/', label: '300 DPI Photo QR' },
    { href: '/insta-clip', label: 'Insta Clip Studio' },
    { href: '/normal-dpi-photo', label: 'Normal DPI' },
    { href: '/barcode-pick', label: 'Barcode Pick' },
    { href: '/mochup', label: 'Mockup Studio' },
    { href: '/fitness-glass/winter-arc-2026', label: 'Winter Arc 2026' },
    { href: '/fitness-glass', label: 'Fitness Glass' },
    { href: '/blog', label: 'Blog' },
    { href: '/payment', label: 'Plans & Pricing' },
  ];

  // Do not render global navbar inside the admin portal or on standalone login page (only form shown)
  if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/auth/signin') {
    return null;
  }

  return (
    <>
      <header
        className={`border-b-4 border-black bg-white sticky top-0 z-30 print:hidden select-none font-mono transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 shadow-sm' : '-translate-y-full pointer-events-none'
        }`}
      >
        {/* MAIN NAVBAR ROW: STRICTLY INLINE SINGLE ROW ON DESKTOP */}
        <div className="w-full max-w-[100rem] mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2 lg:gap-3 flex-nowrap">
          
          {/* Brand & Nav links inline side-by-side */}
          <div className="flex items-center gap-2 xl:gap-3 flex-nowrap min-w-0 shrink">
            <Link
              href="/"
              className="shrink-0 flex items-center gap-1.5 bg-black text-[#ccff00] px-2.5 py-1 border-2 border-black font-black text-xs sm:text-sm tracking-tight hover:bg-[#ccff00] hover:text-black transition-colors whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Nedject // genQRstudio</span>
            </Link>

            {/* Nav links inline with brand */}
            <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 text-xs flex-nowrap overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap min-w-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`shrink-0 px-2 py-1 border border-black font-bold uppercase text-[11px] xl:text-xs transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-black text-[#ccff00] shadow-[1px_1px_0px_#000000]'
                        : 'bg-zinc-50 text-black hover:bg-zinc-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar: Quota Counter + Plans Button + User Profile / Auth */}
          <div className="shrink-0 flex items-center gap-1.5 xl:gap-2 flex-nowrap">
            
            {/* 1. Quota Limit Counter Pill with Green / Yellow / Purple Color Tier Bases */}
            {!session?.user && !isAdmin ? (
              /* Guest: Green Base, 2 Initial Uses, NO used count */
              <div
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 border-2 border-black bg-emerald-50 hover:bg-emerald-100 px-2 py-1 text-xs cursor-pointer shadow-[1px_1px_0px_#000000] transition-colors shrink-0 whitespace-nowrap"
                title="Guest Initial Quota: 2 free uses. Click to sign in and unlock 10!"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-bold text-emerald-900 text-[11px]">CREDITS:</span>
                <span className="font-black text-xs text-emerald-950">2 USES</span>
                <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 font-black rounded-sm uppercase hidden sm:inline">
                  UNLOCK 10
                </span>
              </div>
            ) : isAdmin ? (
              /* Admin: Purple Base, Unlimited */
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 border-2 border-black bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs cursor-pointer shadow-[1px_1px_0px_#000000] transition-colors shrink-0 whitespace-nowrap"
                title="Admin Master Privileges: Unlimited access to all tools"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                <span className="font-bold text-[11px] text-purple-200">ADMIN:</span>
                <span className="font-black text-xs text-white">∞ UNLIMITED</span>
              </Link>
            ) : usageStats.plan === 'enterprise' ? (
              /* Enterprise: Purple Base, Unlimited */
              <Link
                href={`/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`}
                className="flex items-center gap-1.5 border-2 border-black bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs cursor-pointer shadow-[1px_1px_0px_#000000] transition-colors shrink-0 whitespace-nowrap"
                title="Enterprise Pack: Unlimited high-volume access"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                <span className="font-bold text-[11px] text-purple-200">ENTERPRISE:</span>
                <span className="font-black text-xs text-white">∞ UNLIMITED</span>
              </Link>
            ) : usageStats.plan === 'pro' ? (
              /* Pro: Yellow Base, Unlimited */
              <Link
                href={`/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`}
                className="flex items-center gap-1.5 border-2 border-black bg-amber-400 hover:bg-amber-300 text-black px-2 py-1 text-xs cursor-pointer shadow-[1px_1px_0px_#000000] transition-colors shrink-0 whitespace-nowrap"
                title="Pro Studio: Unlimited 300 & 600 DPI access"
              >
                <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="font-bold text-[11px] text-zinc-900">PRO:</span>
                <span className="font-black text-xs text-black">∞ UNLIMITED</span>
              </Link>
            ) : (
              /* Authenticated Free Tier: Green Base, 10 Uses (NO 99999!) */
              <Link
                href={`/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`}
                className="flex items-center gap-1.5 border-2 border-black bg-emerald-50 hover:bg-emerald-100 px-2 py-1 text-xs cursor-pointer shadow-[1px_1px_0px_#000000] transition-colors shrink-0 whitespace-nowrap"
                title={`Authenticated Free Plan: ${usageStats.remaining} of 10 credits remaining. Click to view profile.`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-bold text-emerald-900 text-[11px]">CREDITS:</span>
                <span className="font-black text-xs text-emerald-950">
                  {usageStats.remaining} / 10
                </span>
              </Link>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton className="px-2 py-1 text-xs shrink-0 whitespace-nowrap shadow-[1px_1px_0px_#000000]" />

            {/* Story Share Button (Instagram / Web Story) */}
            <StoryShareButton
              variant="pill"
              label="STORY"
            />

            {/* 2. Upgrade Pro Action Link */}
            <Link
              href="/payment"
              className="border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-2 py-1 text-xs font-black flex items-center gap-1 transition-all shadow-[1px_1px_0px_#000000] cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />
              <span className="text-[11px]">UPGRADE</span>
            </Link>

            {/* 3. User Authentication Button / Direct Link to /[userid] */}
            {session?.user ? (
              <Link
                href={`/${encodeURIComponent((session.user as any)?.id || session.user.email?.split('@')[0] || 'profile')}`}
                className="border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-2 py-1 text-xs font-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 whitespace-nowrap"
                title="Open User Profile & Entitlements"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[80px] xl:max-w-[110px]">
                  {session.user.name?.split(' ')[0] || 'Profile'}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black px-2.5 py-1 text-xs font-black flex items-center gap-1 transition-all shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">SIGN IN</span>
                <span className="sm:hidden">LOGIN</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Strip (ONLY visible on small mobile screens <md) */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto no-scrollbar px-3 py-1 border-t border-black bg-zinc-100 text-[11px]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-0.5 border border-black font-bold uppercase whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-black text-[#ccff00]'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          refreshUsage();
        }}
        onSuccess={() => {
          refreshUsage();
        }}
      />
    </>
  );
}
