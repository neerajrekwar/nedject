'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  QrCode,
  Sparkles,
  User,
  LogIn,
  Printer,
  Barcode as BarcodeIcon,
  Flame,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { getUsageStats, UsageStats, getCachedActivePlan } from '@/lib/usage-limits';
import { StoryShareButton } from '@/components/story/StoryShareButton';
import { SocialCardsModal } from '@/components/portfolio/SocialCardsModal';

export function GlobalNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSocialCardsModal, setShowSocialCardsModal] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<'guest' | 'free' | 'pro' | 'enterprise'>('guest');

  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    limit: 2,
    remaining: 2,
    canGenerate: true,
    isLoggedIn: false,
    plan: 'guest',
  });

  // Update usage stats and active plan on mount, session change, and storage events
  const refreshUsage = async () => {
    const isLogged = Boolean(session?.user);

    if (!isLogged) {
      setActivePlan('guest');
      setUsageStats(getUsageStats(false, 'guest', false));
      return;
    }

    const sessionPlan = (((session?.user as any)?.plan || '') as string).toLowerCase();
    const isUserAdmin =
      (session?.user as any)?.role === 'admin' ||
      session?.user?.email === 'neerajrekwar413@gmail.com' ||
      session?.user?.email === 'admin@nedject.com' ||
      (typeof window !== 'undefined' && Boolean(localStorage.getItem('nedject_admin_session_v1')));

    let plan: 'free' | 'pro' | 'enterprise' = 'free';

    if (isUserAdmin || sessionPlan === 'enterprise') {
      plan = 'enterprise';
    } else if (sessionPlan === 'pro') {
      plan = 'pro';
    } else {
      const cached = getCachedActivePlan();
      if (cached === 'enterprise' || cached === 'pro') {
        plan = cached;
      } else {
        plan = 'free';
      }
    }

    setActivePlan(plan);
    setUsageStats(getUsageStats(true, plan, isUserAdmin));

    // Fetch live profile to sync latest purchased plan from DB
    if (isLogged && session?.user?.email) {
      try {
        const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          const dbPlan = data?.user?.plan;
          if (dbPlan && (dbPlan === 'enterprise' || dbPlan === 'pro' || dbPlan === 'free')) {
            const finalPlan = isUserAdmin ? 'enterprise' : dbPlan;
            setActivePlan(finalPlan);
            setUsageStats(getUsageStats(true, finalPlan, isUserAdmin));
          }
        }
      } catch {
        // Ignore background network error
      }
    }
  };

  useEffect(() => {
    refreshUsage();

    const handleUsageUpdated = () => refreshUsage();
    window.addEventListener('Nedject_usage_updated', handleUsageUpdated);
    window.addEventListener('nedject_plan_updated', handleUsageUpdated as any);
    window.addEventListener('storage', handleUsageUpdated);
    return () => {
      window.removeEventListener('Nedject_usage_updated', handleUsageUpdated);
      window.removeEventListener('nedject_plan_updated', handleUsageUpdated as any);
      window.removeEventListener('storage', handleUsageUpdated);
    };
  }, [session]);

  // Intercept ?auth=signin query param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if ((params.get('auth') === 'signin' || params.has('destination')) && !session?.user) {
      setShowAuthModal(true);
    }
  }, [session]);

  // Primary Tool navigation links
  const navLinks = [
    { href: '/', label: '300 DPI PHOTO QR' },
    { href: '/insta-clip', label: 'INSTA CLIP STUDIO' },
    { href: '/normal-dpi-photo', label: 'NORMAL DPI' },
    { href: '/barcode-pick', label: 'BARCODE PICK' },
    { href: '/mochup', label: 'MOCKUP STUDIO' },
    { href: '/fitness-glass/winter-arc-2026', label: 'WINTER ARC 2026' },
    { href: '/fitness-glass', label: 'FITNESS GLASS' },
    { href: '/blog', label: 'BLOG' },
    { href: '/pay-to-use', label: 'PAY TO USE' },
  ];

  // Exclude navbar inside admin or standalone login
  if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/auth/signin') {
    return null;
  }

  const isHomePage = !pathname || pathname === '/' || pathname === '/photo-qr';
  const isBarcodePick = pathname?.startsWith('/barcode-pick');
  const isNormalDPI = pathname?.startsWith('/normal-dpi-photo') || pathname?.startsWith('/nomral-dpi-photo');
  const isMockup = pathname?.startsWith('/mochup') || pathname?.startsWith('/mockup');
  const isInstaClip = pathname?.startsWith('/insta-clip');
  const isWinterArc = pathname?.startsWith('/fitness-glass/winter-arc-2026');
  const isFitnessGlass = !isWinterArc && pathname?.startsWith('/fitness-glass');
  const isPayment = pathname?.startsWith('/pay-to-use') || pathname?.startsWith('/payment');
  const isBlog = pathname?.startsWith('/blog');

  const isLogged = Boolean(session?.user);
  const userProfileUrl = `/${encodeURIComponent((session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile')}`;
  const isAdmin = isLogged && ((session?.user as any)?.role === 'admin' || (session?.user as any)?.email === 'neerajrekwar413@gmail.com');
  const remainingCredits = isLogged
    ? Math.max(0, usageStats.remaining)
    : Math.min(2, Math.max(0, usageStats.remaining));
  const isUnlimited = isLogged && (activePlan === 'enterprise' || activePlan === 'pro' || isAdmin || Boolean(usageStats.isUnlimited));

  // Dynamic context for mobile brand indicator
  const mobileBrandContext = isBarcodePick
    ? { box: '|||||', title: 'BARCODE PICK & STUDIO' }
    : isNormalDPI
    ? { box: 'NR', title: 'PHOTO DPI MAKER' }
    : isWinterArc
    ? { box: '🔥', title: 'WINTER ARC 2026' }
    : isFitnessGlass
    ? { box: '⚡', title: 'FITNESS GLASS' }
    : isMockup
    ? { box: 'NEDJECT', title: 'WEBSITE MOCKUPS' }
    : isInstaClip
    ? { box: 'NEDJECT', title: 'INSTA CLIP' }
    : isPayment
    ? { box: 'NEDJECT', title: 'PLANS & PRICING' }
    : { box: 'NEDJECT', title: 'GENQR_STUDIO' };

  return (
    <>
      {/* Sticky top-0 navbar */}
      <header className="sticky top-0 z-40 w-full font-mono select-none print:hidden shadow-sm">
        {/* ========================================================================================= */}
        {/* 1. DESKTOP & LARGE SCREENS (lg & xl >= 1024px)                                             */}
        {/* ========================================================================================= */}
        <div className="hidden lg:block w-full">
          {/* TIER 1: Top White Header */}
          <div className="w-full bg-white border-b-2 border-black">
            <div className="w-full max-w-[1700px] mx-auto px-4 py-2 flex flex-col gap-2">
              
              {/* Row 1: Brand badge + Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                {/* Brand box: Black with #ccff00 text */}
                <Link
                  href="/"
                  className="bg-black text-[#ccff00] border-2 border-black font-black text-xs sm:text-sm px-3 py-1.5 flex items-center gap-2 hover:bg-[#ccff00] hover:text-black transition-colors whitespace-nowrap shadow-[2px_2px_0px_#000000]"
                  title="Nedject // genQRstudio"
                >
                  <QrCode className="w-4 h-4 text-[#ccff00]" />
                  <span>Nedject // genQRstudio</span>
                </Link>

                {/* Right Action Bar */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* CREDITS Navlink Item - Recreated with dynamic plan base color and unlimited support */}
                  {session?.user ? (
                    <Link
                      href={userProfileUrl}
                      className={`flex items-center gap-2 border-2 border-black px-3 py-1 text-xs font-black transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] select-none ${
                        activePlan === 'enterprise'
                          ? 'bg-[#9333ea] text-white hover:bg-[#7e22ce]'
                          : activePlan === 'pro'
                          ? 'bg-[#ccff00] text-black hover:bg-[#b8e600]'
                          : 'bg-white text-zinc-900 hover:bg-zinc-100'
                      }`}
                      title={
                        activePlan === 'enterprise'
                          ? 'Enterprise Plan Active • Unlimited Studio Generations & Industrial Print Tools'
                          : activePlan === 'pro'
                          ? 'Pro Studio Plan Active • Unlimited 300 & 600 DPI Generations'
                          : `${remainingCredits} credits remaining. Click to view profile and upgrade.`
                      }
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full inline-block animate-pulse ${
                          activePlan === 'enterprise'
                            ? 'bg-white shadow-[0_0_8px_#ffffff]'
                            : activePlan === 'pro'
                            ? 'bg-black'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="tracking-tight">
                        {isUnlimited
                          ? 'CREDITS: ∞ UNLIMITED'
                          : `CREDITS: ${remainingCredits} / 10 AVAILABLE`}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black ${
                          activePlan === 'enterprise'
                            ? 'bg-white text-[#581c87]'
                            : activePlan === 'pro'
                            ? 'bg-black text-[#ccff00]'
                            : 'bg-[#00875a] text-white'
                        }`}
                      >
                        {activePlan === 'enterprise'
                          ? 'ENTERPRISE'
                          : activePlan === 'pro'
                          ? 'PRO ACTIVE'
                          : 'FREE TIER'}
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="flex items-center gap-2 border-2 border-black bg-white text-zinc-900 px-3 py-1 text-xs font-black hover:bg-zinc-100 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] select-none"
                      title="Guest initial uses. Sign in to unlock 10 authenticated credits!"
                    >
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                      <span className="tracking-tight">
                        CREDITS: {remainingCredits} / 2
                      </span>
                      <span className="bg-[#00875a] text-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black hover:bg-black transition-colors">
                        UNLOCK 10
                      </span>
                    </button>
                  )}

                  {/* Story button */}
                  <StoryShareButton
                    variant="pill"
                    label="STORY"
                    className="border-2 border-black bg-white text-black px-3 py-1 text-xs font-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000] rounded-none"
                  />

                  {/* Plan / Upgrade button */}
                  {activePlan === 'enterprise' ? (
                    <Link
                      href="/pay-to-use"
                      className="flex items-center gap-1.5 border-2 border-black bg-purple-950 text-[#f3e8ff] hover:bg-purple-900 px-3 py-1 text-xs font-black transition-colors whitespace-nowrap shadow-[2px_2px_0px_#000000] cursor-pointer"
                      title="Enterprise Plan Active • View Plans & Capabilities"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>ENTERPRISE ACTIVE</span>
                    </Link>
                  ) : activePlan === 'pro' ? (
                    <Link
                      href="/pay-to-use?plan=enterprise"
                      className="flex items-center gap-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-3 py-1 text-xs font-black transition-colors whitespace-nowrap shadow-[2px_2px_0px_#000000] cursor-pointer"
                      title="Upgrade to Enterprise for 1200 DPI & Bulk Generations"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>UPGRADE ENTERPRISE</span>
                    </Link>
                  ) : (
                    <Link
                      href="/pay-to-use"
                      className="flex items-center gap-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-3 py-1 text-xs font-black transition-colors whitespace-nowrap shadow-[2px_2px_0px_#000000] cursor-pointer"
                      title="Upgrade to Pro Studio for Unlimited Generations"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>UPGRADE TO PRO</span>
                    </Link>
                  )}

                  {/* Sign In / Register or User Profile */}
                  {session?.user ? (
                    <Link
                      href={userProfileUrl}
                      className="flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] px-3.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-all whitespace-nowrap cursor-pointer"
                      title="User Profile"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="uppercase truncate max-w-[120px]">
                        {session.user.name?.split(' ')[0] || 'PROFILE'}
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] px-3.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-all whitespace-nowrap cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>SIGN IN / REGISTER</span>
                    </button>
                  )}

                  {/* Admin badge if active */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1 border-2 border-black bg-rose-500 text-white px-2 py-1 text-xs font-black hover:bg-black transition-colors shadow-[2px_2px_0px_#000000]"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>ADMIN</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Row 2: Full Tool Navigation Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href === '/' && pathname === '/photo-qr');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`border-2 border-black font-black text-xs px-2.5 py-1 uppercase transition-all whitespace-nowrap shadow-[1px_1px_0px_#000000] ${
                        isActive
                          ? 'bg-black text-[#ccff00]'
                          : 'bg-white text-black hover:bg-zinc-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

            </div>
          </div>

          {/* TIER 2: Bottom Studio Bar (Cream/Off-White #f5f5f0) - DYNAMIC CONTEXT PER PAGE */}
          <div className="w-full bg-[#f5f5f0] border-b-2 border-black">
            <div className="w-full max-w-[1700px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
              
              {/* ------------------------------------------------------------- */}
              {/* CASE A: HOME PAGE (Shows NEDJECT + DEVELOPED BY NEERAJREKWAR) */}
              {/* ------------------------------------------------------------- */}
              {isHomePage && (
                <>
                  {/* Left: NEDJECT Box + GENQR_STUDIO title */}
                  <div className="flex items-center gap-3">
                    <Link
                      href="/"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NEDJECT
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>GENQR_STUDIO</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        DEVELOPED BY NEERAJREKWAR
                      </span>
                    </div>
                  </div>

                  {/* Center: Neo-Brutalist Segmented Bar */}
                  <div className="flex items-center border-2 border-black bg-white shadow-[3px_3px_0px_#000000] divide-x-2 divide-black text-xs font-black">
                    <button
                      type="button"
                      onClick={() => setShowSocialCardsModal(true)}
                      className="px-3 py-1.5 flex items-center gap-1.5 hover:bg-zinc-100 transition-colors whitespace-nowrap cursor-pointer"
                      title="Launch OpenGraph 1200x630 Social Card Generator"
                    >
                      <span className="text-amber-500 font-bold">★</span>
                      <span>OG CARDS (1200×630)</span>
                    </button>

                    <Link
                      href="/mochup"
                      className="px-3 py-1.5 hover:bg-zinc-100 transition-colors whitespace-nowrap"
                    >
                      MOCKUPS
                    </Link>

                    <Link
                      href="/normal-dpi-photo"
                      className="px-3 py-1.5 flex items-center gap-1.5 hover:bg-zinc-100 transition-colors whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PHOTO DPI</span>
                    </Link>

                    <Link
                      href="/barcode-pick"
                      className="px-3 py-1.5 flex items-center gap-1.5 hover:bg-zinc-100 transition-colors whitespace-nowrap"
                    >
                      <BarcodeIcon className="w-3.5 h-3.5" />
                      <span>BARCODES</span>
                    </Link>

                    <Link
                      href="/fitness-glass/winter-arc-2026"
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] transition-colors whitespace-nowrap"
                    >
                      <Flame className="w-3.5 h-3.5 fill-black" />
                      <span>WINTER ARC 2026</span>
                    </Link>
                  </div>

                  {/* Right: Status badge & Quick Action pills */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      <span className="w-2.5 h-2.5 bg-emerald-500 border border-black inline-block" />
                      <span>SYS_OK // 300_DPI_READY</span>
                    </div>

                    <Link
                      href="/fitness-glass/winter-arc-2026"
                      className="hidden 2xl:flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] px-3 py-1.5 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap"
                    >
                      <Flame className="w-3.5 h-3.5 fill-black" />
                      <span>WINTER ARC</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowSocialCardsModal(true)}
                      className="hidden 2xl:flex items-center gap-1.5 border-2 border-black bg-white text-black hover:bg-zinc-100 px-3 py-1.5 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap"
                    >
                      <span>OG CARDS</span>
                    </button>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE B: PHOTO DPI MAKER (Matches user image_805df1ea.png)                     */}
              {/* ----------------------------------------------------------------------------- */}
              {isNormalDPI && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/normal-dpi-photo"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NR
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>PHOTO DPI MAKER &amp; AM HALFTONE STUDIO</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        RATIOS · OPTIONAL CANVAS FRAMES · 600-1200 DPI · 45-65 LPI · 45° AM SCREENING
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      600 DPI · 55 LPI
                    </span>
                    <span className="border-2 border-black bg-white text-zinc-700 px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      FRAME: OFF (BORDERLESS)
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE C: BARCODE PICK & STUDIO (Matches user image_06ba08b1.png)               */}
              {/* ----------------------------------------------------------------------------- */}
              {isBarcodePick && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/barcode-pick"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap"
                    >
                      |||||
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>BARCODE PICK &amp; STUDIO</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        INDUSTRIAL LINEAR &amp; 2D BARCODE GENERATOR
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      CODE128
                    </span>
                    <span className="border-2 border-black bg-black text-[#ccff00] px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      300 DPI PRINT
                    </span>
                    <Link
                      href="/normal-dpi-photo"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PHOTO DPI MAKER</span>
                    </Link>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE D: MOCKUP STUDIO                                                         */}
              {/* ----------------------------------------------------------------------------- */}
              {isMockup && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/mochup"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NEDJECT
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>WEBSITE MOCKUP STUDIO</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        INTERACTIVE MULTI-DEVICE 9:16 &amp; 16:9 4K ENGINE
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      4K UHD 60 FPS
                    </span>
                    <span className="border-2 border-black bg-black text-[#ccff00] px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      9:16 &amp; 16:9
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE E: INSTA CLIP STUDIO                                                     */}
              {/* ----------------------------------------------------------------------------- */}
              {isInstaClip && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/insta-clip"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NEDJECT
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>INSTA CLIP STUDIO</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        REELS &amp; STORY SOCIAL VIDEO EXPORTER
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      1080×1920 9:16
                    </span>
                    <span className="border-2 border-black bg-black text-[#ccff00] px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      60 FPS MP4/WEBM
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE F: WINTER ARC 2026                                                       */}
              {/* ----------------------------------------------------------------------------- */}
              {isWinterArc && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/fitness-glass/winter-arc-2026"
                      className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-[#ccff00] transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                      <Flame className="w-4 h-4 fill-black" />
                      <span>WINTER ARC</span>
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>WINTER ARC 2026</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        ULTRA DISCIPLINE &amp; BIO-CALIBRATION PROTOCOL
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      PROTOCOL: ACTIVE
                    </span>
                    <span className="border-2 border-black bg-black text-[#ccff00] px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      2026 EDITION
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE G: FITNESS GLASS                                                         */}
              {/* ----------------------------------------------------------------------------- */}
              {isFitnessGlass && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/fitness-glass"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap"
                    >
                      ⚡
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>FITNESS GLASS</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        HEALTH BIOMETRICS &amp; ACTIVITY DASHBOARD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      WEARABLE SYNC
                    </span>
                    <span className="border-2 border-black bg-black text-[#ccff00] px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      BIOMETRICS: OK
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE H: PAYMENT / PLANS                                                       */}
              {/* ----------------------------------------------------------------------------- */}
              {isPayment && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/pay-to-use"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NEDJECT
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>PAY TO USE // PLANS</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        PRO MEMBERSHIP &amp; INDUSTRIAL TOOL LICENSES
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      LIFETIME ACCESS
                    </span>
                    <span className="border-2 border-black bg-black text-[#ccff00] px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      UNLIMITED CREDITS
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE I: BLOG                                                                  */}
              {/* ----------------------------------------------------------------------------- */}
              {isBlog && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/blog"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NEDJECT
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>ENGINEERING LOG &amp; BLOG</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        TECHNICAL ARTICLES &amp; ISO/IEC PRINT STANDARDS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      TECHNICAL ARTICLES
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

              {/* ----------------------------------------------------------------------------- */}
              {/* CASE J: OTHER (Dashboard, User Profile, etc.)                                 */}
              {/* ----------------------------------------------------------------------------- */}
              {!isHomePage && !isNormalDPI && !isBarcodePick && !isMockup && !isInstaClip && !isWinterArc && !isFitnessGlass && !isPayment && !isBlog && (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/"
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
                    >
                      NEDJECT
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <span>USER DASHBOARD</span>
                        <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 tracking-wider uppercase leading-none">
                        SAVED CODES, EXPORTS &amp; CLOUD CREDITS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="border-2 border-black bg-[#ccff00] text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      CLOUD SYNC: OK
                    </span>
                    <Link
                      href="/"
                      className="border-2 border-black bg-white hover:bg-zinc-100 text-black px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>RETURN TO QR STUDIO</span>
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ========================================================================================= */}
        {/* 2. TABLET & MOBILE NAVBAR (< lg: md, sm, xs)                                              */}
        {/* ========================================================================================= */}
        <div className="lg:hidden w-full bg-[#f5f5f0] border-b-2 border-black">
          <div className="w-full px-3 py-2 flex items-center justify-between gap-2">
            
            {/* Left: Dynamic Brand Box & optional subtitle */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="border-2 border-black bg-white px-2.5 py-1 text-xs sm:text-sm font-black tracking-wider shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors whitespace-nowrap uppercase"
              >
                {mobileBrandContext.box}
              </Link>

              {/* Title: visible on sm & md, hidden on xs < 480px */}
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-black text-black">
                  <span>{mobileBrandContext.title}</span>
                  <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                </div>
                {isHomePage && (
                  <span className="text-[9px] text-zinc-500 tracking-wider uppercase leading-none">
                    DEVELOPED BY NEERAJREKWAR
                  </span>
                )}
              </div>
            </div>

            {/* Right: Dynamic buttons depending on screen size */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Tablet only: CREDITS Item */}
              {session?.user ? (
                <Link
                  href={userProfileUrl}
                  className={`hidden md:flex items-center gap-1.5 border-2 border-black px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap transition-colors ${
                    activePlan === 'enterprise'
                      ? 'bg-[#9333ea] text-white hover:bg-[#7e22ce]'
                      : activePlan === 'pro'
                      ? 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00]'
                      : 'bg-white text-zinc-900 hover:bg-zinc-100'
                  }`}
                  title={
                    activePlan === 'enterprise'
                      ? 'Enterprise Plan Active • Unlimited Credits'
                      : activePlan === 'pro'
                      ? 'Pro Studio Active • Unlimited Credits'
                      : `${remainingCredits} credits remaining. Click to view profile.`
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full border border-black inline-block ${
                      activePlan === 'enterprise'
                        ? 'bg-white shadow-[0_0_6px_#ffffff] animate-pulse'
                        : activePlan === 'pro'
                        ? 'bg-black animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>{isUnlimited ? 'CREDITS: ∞' : `CREDITS: ${remainingCredits} / 10`}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 font-black uppercase border border-black ${
                      activePlan === 'enterprise'
                        ? 'bg-white text-purple-900'
                        : activePlan === 'pro'
                        ? 'bg-black text-[#ccff00]'
                        : 'bg-[#00875a] text-white'
                    }`}
                  >
                    {activePlan === 'enterprise' ? 'ENT' : activePlan === 'pro' ? 'PRO' : 'FREE'}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center gap-1.5 border-2 border-black bg-white hover:bg-zinc-100 px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] whitespace-nowrap transition-colors cursor-pointer"
                  title="Guest initial uses. Sign in for 10 credits!"
                >
                  <span className="w-2 h-2 bg-emerald-500 border border-black inline-block" />
                  <span>CREDITS: {remainingCredits} / 2</span>
                  <span className="bg-[#00875a] text-white text-[9px] px-1 py-0.2 font-black uppercase border border-black">
                    UNLOCK 10
                  </span>
                </button>
              )}

              {/* Standard Mobile & Tablet: ✨ PLANS (Neon #ccff00) */}
              <Link
                href="/pay-to-use"
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
                <>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="hidden sm:flex items-center gap-1.5 border-2 border-black bg-white text-black px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-all whitespace-nowrap cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>SIGN IN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="sm:hidden flex items-center gap-1.5 border-2 border-black bg-white text-black px-2.5 py-1 text-xs font-black shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-all whitespace-nowrap cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>LOGIN</span>
                  </button>
                </>
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
            {/* Quick Actions & Credits */}
            <div
              className={`flex items-center justify-between gap-2 p-2.5 border-2 border-black shadow-[2px_2px_0px_#000000] ${
                !session?.user
                  ? 'bg-zinc-50 text-black'
                  : activePlan === 'enterprise'
                  ? 'bg-[#9333ea] text-white'
                  : activePlan === 'pro'
                  ? 'bg-[#ccff00] text-black'
                  : 'bg-zinc-50 text-black'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black">
                <span
                  className={`w-2.5 h-2.5 rounded-full inline-block ${
                    !session?.user
                      ? 'bg-emerald-500'
                      : activePlan === 'enterprise'
                      ? 'bg-white animate-pulse shadow-[0_0_6px_#ffffff]'
                      : activePlan === 'pro'
                      ? 'bg-black animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>
                  {!session?.user
                    ? `CREDITS: ${remainingCredits} / 2 FREE USES`
                    : isUnlimited
                    ? 'CREDITS: ∞ UNLIMITED'
                    : `CREDITS: ${remainingCredits} / 10 AVAILABLE`}
                </span>
              </div>
              {!session?.user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="bg-[#00875a] text-white px-2 py-0.5 text-[10px] font-bold border border-black cursor-pointer hover:bg-black transition-colors"
                >
                  UNLOCK 10
                </button>
              ) : (
                <Link
                  href={userProfileUrl}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                    activePlan === 'enterprise'
                      ? 'bg-white text-purple-900'
                      : activePlan === 'pro'
                      ? 'bg-black text-[#ccff00]'
                      : 'bg-[#00875a] text-white'
                  }`}
                >
                  {activePlan === 'enterprise' ? 'ENTERPRISE' : activePlan === 'pro' ? 'PRO ACTIVE' : 'FREE TIER'}
                </Link>
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
                href="/pay-to-use"
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
                Studio Tools &amp; Generators
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
                Social &amp; OG Badges
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
                <span>SYS_OK // READY</span>
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