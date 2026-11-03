'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  User,
  LogIn,
  Sparkles,
  QrCode,
  Printer,
  Barcode as BarcodeIcon,
  Flame,
  Video,
  Layers,
  ShieldAlert,
  Menu,
  X,
  CreditCard,
  FileText,
  Activity,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { getUsageStats, UsageStats } from '@/lib/usage-limits';
import { getAdminSession } from '@/lib/admin-auth';
import { SocialCardsModal } from '@/components/portfolio/SocialCardsModal';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
import { StoryShareButton } from '@/components/story/StoryShareButton';

export function GlobalNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSocialCardsModal, setShowSocialCardsModal] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
        setIsMobileMenuOpen(false);
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

  // Ensure navbar is immediately visible on route changes & close mobile menu
  useEffect(() => {
    setIsVisible(true);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    const handleOpenOG = () => setShowSocialCardsModal(true);

    window.addEventListener('Nedject_usage_updated', handleUsageUpdated);
    window.addEventListener('nedject_admin_auth_changed', handleAdminChanged);
    window.addEventListener('nedject_open_og_cards', handleOpenOG);

    return () => {
      window.removeEventListener('Nedject_usage_updated', handleUsageUpdated);
      window.removeEventListener('nedject_admin_auth_changed', handleAdminChanged);
      window.removeEventListener('nedject_open_og_cards', handleOpenOG);
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

  // Primary navigation tools
  const navTools = [
    { href: '/', label: '300 DPI QR', icon: QrCode },
    { href: '/insta-clip', label: 'INSTA CLIP', icon: Video },
    { href: '/mochup', label: 'MOCKUPS', icon: Layers },
    { href: '/normal-dpi-photo', label: 'PHOTO DPI', icon: Printer },
    { href: '/barcode-pick', label: 'BARCODES', icon: BarcodeIcon },
    { href: '/fitness-glass/winter-arc-2026', label: 'WINTER ARC', icon: Flame, isHighlight: true },
  ];

  // Secondary tools for mobile drawer
  const extraLinks = [
    { href: '/fitness-glass', label: 'FITNESS GLASS HUB', icon: Activity },
    { href: '/payment', label: 'PRICING & PLANS', icon: CreditCard },
    { href: '/blog', label: 'ENGINEERING BLOG', icon: FileText },
  ];

  // Do not render global navbar inside the admin portal or standalone auth pages
  if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/auth/signin') {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-[#f5f5f0] border-b-2 border-black transition-transform duration-300 ease-in-out print:hidden select-none font-mono ${
          isVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 lg:gap-4">
          
          {/* ================================================================= */}
          {/* LEFT: SQUARE FRAMED BRAND MARK BOX + SUBTITLE                     */}
          {/* ================================================================= */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center justify-center px-3 sm:px-3.5 h-10 sm:h-12 border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all font-mono font-black text-sm sm:text-base tracking-tighter"
            >
              NEDJECT
            </Link>
            <div className="hidden sm:block">
              <div className="font-mono text-xs font-black tracking-widest text-black flex items-center gap-1.5">
                <span>GENQR_STUDIO</span>
                <span className="w-1.5 h-1.5 bg-[#ccff00] border border-black inline-block animate-pulse" />
              </div>
              <div className="font-mono text-[10px] text-zinc-600 tracking-wider">
                DEVELOPED BY NEERAJREKWAR
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CENTER: SEGMENTED NEO-BRUTALIST TOOLS NAV (DESKTOP)               */}
          {/* ================================================================= */}
          <nav className="hidden lg:flex items-center border-2 border-black bg-white p-1 shadow-[4px_4px_0px_#000000]">
            {navTools.map((tool, idx) => {
              const isActive = pathname === tool.href;
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`px-2.5 xl:px-3 py-1.5 font-mono text-xs font-black tracking-wider transition-colors flex items-center gap-1.5 ${
                    idx > 0 ? 'border-l-2 border-black' : ''
                  } ${
                    tool.isHighlight && !isActive
                      ? 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00]'
                      : isActive
                      ? 'bg-black text-[#ccff00]'
                      : 'text-black hover:bg-black hover:text-[#ccff00]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tool.isHighlight && !isActive ? 'text-orange-600 fill-orange-500' : ''}`} />
                  <span className="whitespace-nowrap">{tool.label}</span>
                </Link>
              );
            })}

            {/* OG Cards Action Button */}
            <button
              type="button"
              onClick={() => setShowSocialCardsModal(true)}
              className="px-2.5 xl:px-3 py-1.5 font-mono text-xs font-black tracking-wider text-black hover:bg-black hover:text-[#ccff00] transition-colors flex items-center gap-1 border-l-2 border-black cursor-pointer bg-white"
              title="Preview all page Twitter & OpenGraph Cards"
            >
              <span className="text-amber-500">★</span>
              <span className="whitespace-nowrap">OG CARDS</span>
            </button>
          </nav>

          {/* ================================================================= */}
          {/* RIGHT: SYSTEM STATUS / CREDITS CAPSULE + UPGRADE + AUTH           */}
          {/* ================================================================= */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* System Status / Credits Indicator */}
            {!session?.user && !isAdmin ? (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="hidden md:flex items-center gap-2 border-2 border-black bg-white hover:bg-[#ccff00] px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                title="Guest Initial Quota: 2 free uses. Click to sign in and unlock 10!"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 bg-[#16a34a] border border-black" />
                </span>
                <span className="font-mono text-[11px] font-black tracking-widest text-black whitespace-nowrap">
                  SYS_OK // 2 CREDITS
                </span>
              </button>
            ) : isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-2 border-2 border-black bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-[3px_3px_0px_#000000] transition-all whitespace-nowrap"
                title="Admin Master Privileges: Unlimited access to all tools"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                <span className="font-mono text-[11px] font-black tracking-widest text-white">
                  ADMIN // ∞
                </span>
              </Link>
            ) : usageStats.plan === 'pro' || usageStats.plan === 'enterprise' ? (
              <Link
                href={`/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`}
                className="hidden md:flex items-center gap-2 border-2 border-black bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-[3px_3px_0px_#000000] transition-all whitespace-nowrap"
                title="Pro Studio: Unlimited 300 & 600 DPI access"
              >
                <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="font-mono text-[11px] font-black tracking-widest text-black">
                  PRO // ∞
                </span>
              </Link>
            ) : (
              <Link
                href={`/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`}
                className="hidden md:flex items-center gap-2 border-2 border-black bg-white hover:bg-[#ccff00] text-black px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-[3px_3px_0px_#000000] transition-all whitespace-nowrap"
                title={`Free Plan: ${usageStats.remaining} of 10 credits remaining`}
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 bg-[#16a34a] border border-black" />
                </span>
                <span className="font-mono text-[11px] font-black tracking-widest text-black">
                  CREDITS: {usageStats.remaining}/10
                </span>
              </Link>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton className="hidden xl:inline-flex px-2 py-1.5 text-xs shrink-0 whitespace-nowrap shadow-[2px_2px_0px_#000000] border-2 border-black bg-white font-mono font-bold hover:bg-zinc-100" />

            {/* Story Share Button */}
            <div className="hidden xl:block">
              <StoryShareButton variant="pill" label="STORY" />
            </div>

            {/* Plans Link Button */}
            <Link
              href="/payment"
              className="hidden sm:flex items-center gap-1.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black px-2.5 py-1.5 sm:px-3 sm:py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all shrink-0"
              title="View Plans & Pricing"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>PLANS</span>
            </Link>

            {/* User Profile or Sign In Button */}
            {session?.user ? (
              <Link
                href={`/${encodeURIComponent((session.user as any)?.id || session.user.email?.split('@')[0] || 'profile')}`}
                className="flex items-center gap-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-2.5 py-1.5 sm:px-3 sm:py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all shrink-0"
                title="Open User Profile & Entitlements"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[70px] sm:max-w-[100px] truncate">
                  {session.user.name?.split(' ')[0] || 'PROFILE'}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 border-2 border-black bg-white hover:bg-black hover:text-[#ccff00] text-black px-2.5 py-1.5 sm:px-3 sm:py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">SIGN IN</span>
                <span className="sm:hidden">LOGIN</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 border-2 border-black bg-white hover:bg-[#ccff00] shadow-[2px_2px_0px_#000000] transition-all cursor-pointer font-mono font-black"
              aria-label="Toggle navigation tools menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* ================================================================= */}
        {/* MOBILE NAVIGATION DRAWER (SLIDES DOWN ON LG:HIDDEN SCREENS)       */}
        {/* ================================================================= */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-black bg-[#f5f5f0] px-4 py-3 shadow-[0_8px_0px_#000000] animate-in slide-in-from-top-2 duration-150">
            {/* Quick Status Pill on Mobile */}
            <div className="mb-3 flex items-center justify-between border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 bg-[#16a34a] border border-black" />
                </span>
                <span className="font-mono text-xs font-black text-black">
                  {!session?.user && !isAdmin
                    ? 'GUEST // 2 FREE USES'
                    : isAdmin
                    ? 'ADMIN // ∞ UNLIMITED'
                    : usageStats.plan === 'pro' || usageStats.plan === 'enterprise'
                    ? 'PRO STUDIO // ∞'
                    : `FREE PLAN // ${usageStats.remaining}/10 CREDITS`}
                </span>
              </div>
              {!session?.user && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="px-2 py-0.5 bg-[#ccff00] border border-black font-black text-[10px] uppercase shadow-[1px_1px_0px_#000000]"
                >
                  UNLOCK 10
                </button>
              )}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {navTools.map((tool) => {
                const isActive = pathname === tool.href;
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2 border-2 border-black font-mono text-xs font-black transition-all ${
                      tool.isHighlight && !isActive
                        ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_#000000]'
                        : isActive
                        ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                        : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tool.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Extra Links & Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/20">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowSocialCardsModal(true);
                }}
                className="flex-1 py-1.5 px-2 border-2 border-black bg-white hover:bg-black hover:text-[#ccff00] font-mono text-xs font-black shadow-[2px_2px_0px_#000000] text-center"
              >
                ★ OG CARDS (1200×630)
              </button>
              <Link
                href="/payment"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 py-1.5 px-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-mono text-xs font-black shadow-[2px_2px_0px_#000000] text-center"
              >
                UPGRADE / PLANS
              </Link>
            </div>
          </div>
        )}
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

      {/* Social Cards Modal */}
      <SocialCardsModal
        isOpen={showSocialCardsModal}
        onClose={() => setShowSocialCardsModal(false)}
      />
    </>
  );
}
