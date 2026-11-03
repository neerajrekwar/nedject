'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  QrCode,
  Sparkles,
  User,
  LogIn,
  Video,
  Printer,
  Barcode as BarcodeIcon,
  Flame,
  Menu,
  X,
  ShieldAlert,
  Monitor,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { getUsageStats, UsageStats } from '@/lib/usage-limits';
import { StoryShareButton } from '@/components/story/StoryShareButton';
import { SocialCardsModal } from '@/components/portfolio/SocialCardsModal';

interface PageContext {
  brandBox: string;
  brandLink: string;
  title: string;
  subtitle: string;
  statusText: string;
}

/**
 * Returns dynamic context (brand box, title, subtitle, status text)
 * based on the active route pathname.
 */
function getPageContext(pathname: string | null): PageContext {
  const path = pathname || '/';

  if (path === '/' || path === '/photo-qr') {
    return {
      brandBox: 'NEDJECT',
      brandLink: '/',
      title: 'GENQR_STUDIO',
      subtitle: 'DEVELOPED BY NEERAJREKWAR',
      statusText: 'SYS_OK // 300_DPI_READY',
    };
  }

  if (path.startsWith('/barcode-pick')) {
    return {
      brandBox: '|||||',
      brandLink: '/barcode-pick',
      title: 'BARCODE PICK & STUDIO',
      subtitle: 'INDUSTRIAL LINEAR & 2D BARCODE GENERATOR',
      statusText: 'SYS_OK // 300_DPI_PRINT',
    };
  }

  if (path.startsWith('/normal-dpi-photo') || path.startsWith('/nomral-dpi-photo')) {
    return {
      brandBox: 'NR',
      brandLink: '/normal-dpi-photo',
      title: 'PHOTO DPI MAKER & AM HALFTONE STUDIO',
      subtitle: 'RATIOS · OPTIONAL CANVAS FRAMES · 600-1200 DPI · 45-65 LPI',
      statusText: 'SYS_OK // 600_DPI_READY',
    };
  }

  if (path.startsWith('/mochup') || path.startsWith('/mockup')) {
    return {
      brandBox: 'NEDJECT',
      brandLink: '/mochup',
      title: 'WEBSITE MOCKUP STUDIO',
      subtitle: 'INTERACTIVE MULTI-DEVICE 9:16 & 16:9 4K ENGINE',
      statusText: 'SYS_OK // 4K_MOCKUP_READY',
    };
  }

  if (path.startsWith('/insta-clip')) {
    return {
      brandBox: 'NEDJECT',
      brandLink: '/insta-clip',
      title: 'INSTA CLIP STUDIO',
      subtitle: 'REELS & STORY SOCIAL VIDEO EXPORTER',
      statusText: 'SYS_OK // 1080x1920_READY',
    };
  }

  if (path.startsWith('/fitness-glass/winter-arc-2026')) {
    return {
      brandBox: '🔥',
      brandLink: '/fitness-glass/winter-arc-2026',
      title: 'WINTER ARC 2026',
      subtitle: 'ULTRA DISCIPLINE & BIO-CALIBRATION',
      statusText: 'SYS_OK // PROTOCOL_ACTIVE',
    };
  }

  if (path.startsWith('/fitness-glass')) {
    return {
      brandBox: '⚡',
      brandLink: '/fitness-glass',
      title: 'FITNESS GLASS',
      subtitle: 'HEALTH BIOMETRICS & ACTIVITY DASHBOARD',
      statusText: 'SYS_OK // BIOMETRICS_LIVE',
    };
  }

  if (path.startsWith('/payment')) {
    return {
      brandBox: 'NEDJECT',
      brandLink: '/payment',
      title: 'PLANS & PRICING',
      subtitle: 'PRO MEMBERSHIP & TOOL LICENSES',
      statusText: 'SYS_OK // LIFETIME_PRO',
    };
  }

  if (path.startsWith('/blog')) {
    return {
      brandBox: 'NEDJECT',
      brandLink: '/blog',
      title: 'ENGINEERING LOG & BLOG',
      subtitle: 'TECHNICAL ARTICLES & PRINT STANDARDS',
      statusText: 'SYS_OK // ARTICLES_READY',
    };
  }

  if (path.startsWith('/dashboard') || path.startsWith('/qr-crush')) {
    return {
      brandBox: 'NEDJECT',
      brandLink: path,
      title: 'USER DASHBOARD',
      subtitle: 'SAVED CODES, EXPORTS & CLOUD CREDITS',
      statusText: 'SYS_OK // CLOUD_SYNC',
    };
  }

  return {
    brandBox: 'NEDJECT',
    brandLink: '/',
    title: 'GENQR_STUDIO',
    subtitle: 'DEVELOPED BY NEERAJREKWAR',
    statusText: 'SYS_OK // 300_DPI_READY',
  };
}

export function GlobalNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSocialCardsModal, setShowSocialCardsModal] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const lastScrollY = useRef(0);

  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    limit: 2,
    remaining: 2,
    canGenerate: true,
    isLoggedIn: false,
    plan: 'guest',
  });

  // Sticky navbar: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isMobileMenuOpen) {
        setIsVisible(true);
        return;
      }
      if (currentScrollY < 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  // Update usage stats on mount and session change
  const refreshUsage = () => {
    const isLogged = Boolean(session?.user);
    const plan = ((session?.user as any)?.plan || 'free') as 'free' | 'pro';
    setUsageStats(getUsageStats(isLogged, plan));
  };

  useEffect(() => {
    refreshUsage();

    const handleUsageUpdated = () => refreshUsage();
    window.addEventListener('Nedject_usage_updated', handleUsageUpdated);
    return () => window.removeEventListener('Nedject_usage_updated', handleUsageUpdated);
  }, [session]);

  // Intercept ?auth=signin query param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if ((params.get('auth') === 'signin' || params.has('destination')) && !session?.user) {
      setShowAuthModal(true);
    }
  }, [session]);

  // Exclude navbar inside admin or standalone login
  if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/auth/signin') {
    return null;
  }

  const context = getPageContext(pathname);
  const userProfileUrl = `/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`;
  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.email === 'neerajrekwar413@gmail.com';
  const remainingCredits = Math.max(0, usageStats.remaining);

  // Primary Tool navigation items for mobile drawer
  const navLinks = [
    { href: '/', label: '300 DPI PHOTO QR' },
    { href: '/insta-clip', label: 'INSTA CLIP STUDIO' },
    { href: '/normal-dpi-photo', label: 'NORMAL DPI' },
    { href: '/barcode-pick', label: 'BARCODE PICK' },
    { href: '/mochup', label: 'MOCKUP STUDIO' },
    { href: '/fitness-glass/winter-arc-2026', label: 'WINTER ARC 2026' },
    { href: '/fitness-glass', label: 'FITNESS GLASS' },
    { href: '/blog', label: 'BLOG' },
    { href: '/payment', label: 'PLANS & PRICING' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full font-mono select-none print:hidden transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* ========================================================================================= */}
        {/* 1. DESKTOP & LARGE SCREENS (lg & xl >= 1024px): SINGLE UNIFIED CONTEXT NAVBAR             */}
        {/* ========================================================================================= */}
        <div className="hidden lg:block w-full bg-[#f5f5f0] border-b-2 border-black">
          <div className="w-full max-w-[1750px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            
            {/* LEFT: Dynamic Brand Box + Dynamic Title & Subtitle */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={context.brandLink}
                className="border-2 border-black bg-white px-3 py-1.5 text-sm xl:text-base font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                title={`${context.brandBox} - ${context.title}`}
              >
                {context.brandBox}
              </Link>
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 text-xs xl:text-sm font-black text-black tracking-tight whitespace-nowrap">
                  <span>{context.title}</span>
                  <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold leading-none truncate max-w-[220px] xl:max-w-[340px]">
                  {context.subtitle}
                </span>
              </div>
            </div>

            {/* CENTER: Neo-Brutalist Segmented Navigation Bar */}
            <div className="flex items-center border-2 border-black bg-white shadow-[3px_3px_0px_#000000] divide-x-2 divide-black text-xs font-black shrink-0">
              {/* OG CARDS (1200x630) */}
              <button
                type="button"
                onClick={() => setShowSocialCardsModal(true)}
                className="px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 hover:bg-zinc-100 transition-colors whitespace-nowrap cursor-pointer"
                title="Launch OpenGraph 1200x630 Social Card Generator"
              >
                <span className="text-amber-500 font-bold">★</span>
                <span>OG CARDS</span>
              </button>

              {/* 300 DPI QR */}
              <Link
                href="/"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/' || pathname === '/photo-qr'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>300 DPI QR</span>
              </Link>

              {/* INSTA CLIP */}
              <Link
                href="/insta-clip"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/insta-clip'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>INSTA CLIP</span>
              </Link>

              {/* MOCKUPS */}
              <Link
                href="/mochup"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/mochup' || pathname === '/mockup'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>MOCKUPS</span>
              </Link>

              {/* PHOTO DPI */}
              <Link
                href="/normal-dpi-photo"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/normal-dpi-photo' || pathname === '/nomral-dpi-photo'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PHOTO DPI</span>
              </Link>

              {/* BARCODES */}
              <Link
                href="/barcode-pick"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/barcode-pick'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <BarcodeIcon className="w-3.5 h-3.5" />
                <span>BARCODES</span>
              </Link>

              {/* WINTER ARC 2026 */}
              <Link
                href="/fitness-glass/winter-arc-2026"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/fitness-glass/winter-arc-2026'
                    ? 'bg-black text-[#ccff00]'
                    : 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>WINTER ARC</span>
              </Link>

              {/* PLANS */}
              <Link
                href="/payment"
                className={`px-2.5 xl:px-3 py-1.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  pathname === '/payment'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PLANS</span>
              </Link>
            </div>

            {/* RIGHT: Status Badge, Credits, Story, Upgrade to Pro, Sign In */}
            <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
              
              {/* Dynamic Status badge */}
              <div className="hidden 2xl:flex items-center gap-2 border-2 border-black bg-white px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#000000] whitespace-nowrap">
                <span className="w-2.5 h-2.5 bg-emerald-500 border border-black inline-block animate-pulse" />
                <span>{context.statusText}</span>
              </div>

              {/* Credits pill */}
              {session?.user ? (
                <Link
                  href={userProfileUrl}
                  className="hidden xl:flex items-center gap-2 border-2 border-black bg-white px-2.5 py-1 text-xs font-black hover:bg-zinc-100 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] whitespace-nowrap"
                  title="View Profile and Active Plan"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
                  <span className="text-zinc-800">CREDITS: {remainingCredits}</span>
                  <span className="bg-[#00875a] text-white px-1.5 py-0.5 text-[10px] font-bold">
                    PRO
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden xl:flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 text-xs font-black hover:bg-zinc-100 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] whitespace-nowrap"
                  title="Guest initial uses. Sign in for 10!"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                  <span className="text-zinc-800">CREDITS: {remainingCredits}</span>
                  <span className="bg-[#00875a] text-white px-1.5 py-0.5 text-[10px] font-bold">
                    UNLOCK 10
                  </span>
                </button>
              )}

              {/* Story button */}
              <StoryShareButton
                variant="pill"
                label="STORY"
                className="border-2 border-black bg-white text-black px-2.5 py-1 text-xs font-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000] rounded-none whitespace-nowrap"
              />

              {/* Upgrade to Pro button */}
              <Link
                href="/payment"
                className="flex items-center gap-1 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-2.5 py-1 text-xs font-black transition-colors whitespace-nowrap shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>PRO // ∞</span>
              </Link>

              {/* Sign In / Register or User Profile */}
              {session?.user ? (
                <Link
                  href={userProfileUrl}
                  className="flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000000] transition-all whitespace-nowrap cursor-pointer"
                  title="User Profile"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="uppercase truncate max-w-[100px]">
                    {session.user.name?.split(' ')[0] || 'PROFILE'}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000000] transition-all whitespace-nowrap cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </button>
              )}

              {/* Admin badge if active */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 border-2 border-black bg-rose-500 text-white px-2 py-1 text-xs font-black hover:bg-black transition-colors shadow-[2px_2px_0px_#000000]"
                  title="Admin Portal"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ADMIN</span>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================================= */}
        {/* 2. TABLET & MOBILE NAVBAR (< lg: md, sm, xs): DYNAMIC CONTEXT BAR                         */}
        {/* ========================================================================================= */}
        <div className="lg:hidden w-full bg-[#f5f5f0] border-b-2 border-black">
          <div className="w-full px-3 py-2 flex items-center justify-between gap-2">
            
            {/* Left: Dynamic Brand Box & Title */}
            <div className="flex items-center gap-2.5">
              <Link
                href={context.brandLink}
                className="border-2 border-black bg-white px-2.5 py-1 text-xs sm:text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
              >
                {context.brandBox}
              </Link>

              {/* Dynamic Title: visible on sm & md, hidden on xs < 480px */}
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-black text-black">
                  <span>{context.title}</span>
                  <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                </div>
                <span className="text-[9px] text-zinc-500 tracking-wider uppercase leading-none truncate max-w-[200px]">
                  {context.subtitle}
                </span>
              </div>
            </div>

            {/* Right: Dynamic buttons depending on screen size */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Tablet only: Status & credits */}
              <div className="hidden md:flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                <span className="w-2.5 h-2.5 bg-emerald-500 border border-black inline-block" />
                <span>{remainingCredits} CREDITS</span>
              </div>

              {/* Standard Mobile & Tablet: ✨ PLANS (Neon #ccff00) */}
              <Link
                href="/payment"
                className="hidden sm:flex items-center gap-1 border-2 border-black bg-[#ccff00] text-black px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-[#ccff00] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PLANS</span>
              </Link>

              {/* Auth / Profile Button */}
              {session?.user ? (
                <Link
                  href={userProfileUrl}
                  className="flex items-center gap-1.5 border-2 border-black bg-white text-black px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-all whitespace-nowrap cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline uppercase truncate max-w-[80px]">
                    {session.user.name?.split(' ')[0] || 'PROFILE'}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 border-2 border-black bg-white text-black px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-all whitespace-nowrap cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </button>
              )}

              {/* Neo-brutalist Hamburger Button (☰) with 3px shadow */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="border-2 border-black bg-white text-black p-1.5 shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Menu className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>

            </div>

          </div>
        </div>

        {/* ========================================================================================= */}
        {/* 3. MOBILE & TABLET DRAWER OVERLAY (When Hamburger ☰ is opened)                            */}
        {/* ========================================================================================= */}
        {isMobileMenuOpen && (
          <div className="lg:hidden w-full bg-white border-b-4 border-black p-4 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            {/* Header info in drawer */}
            <div className="flex items-center justify-between p-2 border-2 border-black bg-[#f5f5f0]">
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="border border-black bg-black text-[#ccff00] px-1.5 py-0.5 text-[10px]">
                  {context.brandBox}
                </span>
                <span className="truncate max-w-[180px]">{context.title}</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-600">
                {context.statusText}
              </span>
            </div>

            {/* Quick Actions & Credits */}
            <div className="flex items-center justify-between gap-2 p-2.5 border-2 border-black bg-zinc-50">
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                <span>CREDITS: {remainingCredits} AVAILABLE</span>
              </div>
              {!session?.user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="bg-[#00875a] text-white px-2 py-0.5 text-[10px] font-bold border border-black cursor-pointer"
                >
                  UNLOCK 10
                </button>
              ) : (
                <span className="bg-[#00875a] text-white px-2 py-0.5 text-[10px] font-bold border border-black">
                  PRO
                </span>
              )}
            </div>

            {/* Quick Action buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <StoryShareButton
                variant="button"
                label="STORY"
                className="w-full justify-center text-xs py-2"
              />
              <Link
                href="/payment"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 border-2 border-black bg-black text-[#ccff00] p-2 font-black shadow-[2px_2px_0px_#000000]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>UPGRADE PRO</span>
              </Link>
            </div>

            {/* Primary Tool Links */}
            <div>
              <div className="text-xs font-black uppercase text-zinc-500 border-b-2 border-black pb-1 mb-2">
                Studio Tools & Generators
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href === '/' && pathname === '/photo-qr');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-2 border-2 border-black font-black uppercase text-left transition-all ${
                        isActive
                          ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                          : 'bg-zinc-50 text-black hover:bg-zinc-200'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Secondary Studio Bar Links */}
            <div>
              <div className="text-xs font-black uppercase text-zinc-500 border-b-2 border-black pb-1 mb-2">
                Social & OG Badges
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowSocialCardsModal(true);
                  }}
                  className="p-2 border-2 border-black bg-white font-black flex items-center justify-center gap-1.5 hover:bg-[#ccff00] shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  <span className="text-amber-500 font-bold">★</span>
                  <span>OG CARDS</span>
                </button>

                <Link
                  href="/fitness-glass/winter-arc-2026"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 border-2 border-black bg-[#ccff00] text-black font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                >
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  <span>WINTER ARC</span>
                </Link>
              </div>
            </div>

            {/* Status Line */}
            <div className="pt-2 border-t border-black flex items-center justify-between text-[11px] text-zinc-600 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 border border-black inline-block" />
                <span>{context.statusText}</span>
              </div>
              <span>BUILD 2026.4</span>
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

      {/* OpenGraph 1200x630 Social Cards Modal */}
      <SocialCardsModal
        isOpen={showSocialCardsModal}
        onClose={() => setShowSocialCardsModal(false)}
      />
    </>
  );
}