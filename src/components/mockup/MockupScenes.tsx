'use client';

import React from 'react';
import Image from 'next/image';
import { QrCode, Sparkles, ArrowRight, ExternalLink, Menu, Search, ShoppingBag } from 'lucide-react';

interface SceneProps {
  url?: string;
  screenshotUrl?: string | null;
  activeTemplate: string;
  themeColor?: string;
  backdropTheme: 'concrete' | 'volt' | 'dark' | 'white' | 'transparent';
  shadowIntensity: number;
  reflectionEnabled: boolean;
  contentRenderer: (viewport: 'desktop' | 'tablet' | 'mobile') => React.ReactNode;
}

/**
 * SCENE 1: Apple Responsive Trio (Laptop + Tablet + Phone)
 * Exactly reproduces the layout in Image 3 with user's color theme:
 * - MacBook in the back right
 * - iPad with keyboard stand on the left
 * - iPhone standing upright in the foreground
 */
export function TrioScene({
  contentRenderer,
  backdropTheme,
  shadowIntensity,
  reflectionEnabled,
}: SceneProps) {
  // Backdrop backgrounds using user's brand palette (no blue/purple pastels)
  const backdropBg =
    backdropTheme === 'concrete'
      ? 'bg-[#e2e2dc] text-zinc-900'
      : backdropTheme === 'volt'
      ? 'bg-[#0c0d10] text-zinc-100 border-2 border-black'
      : backdropTheme === 'dark'
      ? 'bg-[#121316] text-white'
      : backdropTheme === 'white'
      ? 'bg-[#f6f6f2] text-zinc-900'
      : 'bg-transparent text-zinc-900';

  return (
    <div
      id="mockup-export-target"
      className={`relative w-full max-w-6xl mx-auto min-h-[640px] sm:min-h-[720px] rounded-2xl overflow-hidden p-6 sm:p-12 flex items-center justify-center select-none transition-colors duration-300 ${backdropBg}`}
      style={{
        perspective: '1400px',
      }}
    >
      {/* Studio stage texture */}
      {backdropTheme === 'concrete' && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
      )}

      {backdropTheme === 'volt' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(204,255,0,0.08),transparent_60%)]" />
      )}

      {/* Main 3D Composition Container */}
      <div className="relative w-full max-w-5xl h-[520px] sm:h-[600px] flex items-center justify-center">
        
        {/* ================================================================= */}
        {/* 1. LAPTOP (MacBook Pro 16" - Back Right)                          */}
        {/* ================================================================= */}
        <div
          id="mockup-target-desktop"
          className="absolute right-0 sm:right-6 top-4 sm:top-8 w-[420px] sm:w-[580px] lg:w-[680px] z-10 transition-transform duration-300"
          style={{
            transform: 'rotateY(-10deg) rotateX(6deg) translateZ(-40px)',
            filter: `drop-shadow(0 ${20 * shadowIntensity}px ${35 * shadowIntensity}px rgba(0,0,0,0.4))`,
          }}
        >
          {/* Laptop Lid Screen Frame */}
          <div className="bg-[#18181b] p-2.5 sm:p-3.5 rounded-t-2xl border-2 border-black shadow-2xl relative">
            {/* Camera notch */}
            <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-30 pointer-events-none">
              <div className="w-24 sm:w-32 h-3.5 bg-black rounded-b-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Screen Glass */}
            <div className="relative w-full h-[250px] sm:h-[340px] lg:h-[400px] bg-white rounded-lg overflow-hidden border border-zinc-900">
              {reflectionEnabled && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
              )}
              {/* Desktop Screen Content */}
              <div className="w-full h-full overflow-y-auto">
                {contentRenderer('desktop')}
              </div>
            </div>
          </div>

          {/* Laptop Base & Keyboard Deck */}
          <div className="relative bg-[#27272a] h-4 sm:h-5 rounded-b-xl border-t border-zinc-700 shadow-lg flex items-center justify-center border-x-2 border-b-2 border-black">
            <div className="w-24 sm:w-32 h-1 bg-black rounded-full" />
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. TABLET (iPad Pro with Keyboard Folio - Left Center)            */}
        {/* ================================================================= */}
        <div
          id="mockup-target-tablet"
          className="absolute left-0 sm:left-4 bottom-8 sm:bottom-12 w-[300px] sm:w-[410px] lg:w-[480px] z-20 transition-transform duration-300"
          style={{
            transform: 'rotateY(16deg) rotateX(8deg) translateZ(30px)',
            filter: `drop-shadow(0 ${22 * shadowIntensity}px ${30 * shadowIntensity}px rgba(0,0,0,0.45))`,
          }}
        >
          {/* Tablet Screen */}
          <div className="bg-[#18181b] p-2.5 sm:p-3 rounded-2xl border-2 border-black shadow-xl relative">
            {/* Front Camera Dot */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800 z-30 pointer-events-none" />

            {/* Screen Display */}
            <div className="relative w-full h-[220px] sm:h-[290px] lg:h-[340px] bg-white rounded-xl overflow-hidden border border-zinc-900">
              {reflectionEnabled && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              )}
              <div className="w-full h-full overflow-y-auto">
                {contentRenderer('tablet')}
              </div>
            </div>
          </div>

          {/* Magic Keyboard Folio Stand Base */}
          <div className="relative -mt-2 bg-[#101114] h-8 sm:h-12 rounded-b-xl border-t-2 border-zinc-800 border-x-2 border-b-2 border-black shadow-md px-4 flex items-center justify-between">
            <div className="flex-1 grid grid-cols-12 gap-1 py-1 opacity-70">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-1.5 sm:h-2 bg-zinc-800 rounded-[2px]" />
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. PHONE (iPhone 16 Pro - Front Center)                           */}
        {/* ================================================================= */}
        <div
          id="mockup-target-mobile"
          className="absolute left-[44%] sm:left-[45%] bottom-0 sm:bottom-4 w-[140px] sm:w-[170px] lg:w-[200px] z-30 transition-transform duration-300"
          style={{
            transform: 'rotateY(-4deg) rotateX(2deg) translateZ(90px)',
            filter: `drop-shadow(0 ${28 * shadowIntensity}px ${35 * shadowIntensity}px rgba(0,0,0,0.5))`,
          }}
        >
          {/* Phone Chassis */}
          <div className="bg-[#18181b] p-2 sm:p-2.5 rounded-[32px] sm:rounded-[38px] border-2 border-black shadow-2xl relative">
            {/* Dynamic Island */}
            <div className="absolute top-3 inset-x-0 h-4 flex justify-center z-30 pointer-events-none">
              <div className="w-14 sm:w-16 h-3.5 bg-black rounded-full flex items-center justify-between px-2 shadow">
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              </div>
            </div>

            {/* Screen Glass */}
            <div className="relative w-full h-[270px] sm:h-[330px] lg:h-[390px] bg-white rounded-[26px] sm:rounded-[30px] overflow-hidden border border-zinc-900">
              {reflectionEnabled && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
              )}
              <div className="w-full h-full overflow-y-auto">
                {contentRenderer('mobile')}
              </div>
            </div>

            {/* Home Indicator bar */}
            <div className="absolute bottom-3 inset-x-0 h-2 flex justify-center z-30 pointer-events-none">
              <div className="w-14 h-1 bg-zinc-400 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * SCENE 2: Long Scroll Extended Laptop
 * Exactly reproduces the layout in Image 2 with user's color theme:
 * - Floating MacBook laptop
 * - Webpage extends out of the screen, curving gracefully into a 3D scroll cylinder roll
 * - Industrial studio background with lime/black accents (no pastel blue/pink)
 */
export function LongScrollLaptopScene({
  contentRenderer,
  backdropTheme,
  shadowIntensity,
  reflectionEnabled,
}: SceneProps) {
  const backdropBg =
    backdropTheme === 'volt'
      ? 'bg-[#0a0b0d] text-zinc-100 border-2 border-black'
      : backdropTheme === 'dark'
      ? 'bg-[#121316] text-white'
      : backdropTheme === 'white'
      ? 'bg-[#f7f7f3] text-zinc-900'
      : backdropTheme === 'concrete'
      ? 'bg-[#e2e2dc] text-zinc-900'
      : 'bg-[#18191f] text-white';

  return (
    <div
      id="mockup-export-target"
      className={`relative w-full max-w-5xl mx-auto min-h-[660px] sm:min-h-[740px] rounded-2xl overflow-hidden p-6 sm:p-12 flex items-center justify-center select-none transition-colors duration-300 ${backdropBg}`}
      style={{
        perspective: '1300px',
      }}
    >
      {/* Background volt subtle glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,rgba(204,255,0,0.06),transparent_70%)]" />

      <div className="relative w-full max-w-3xl flex flex-col items-center">
        
        {/* Floating Laptop Body */}
        <div
          id="mockup-target-desktop"
          className="relative w-[360px] sm:w-[520px] lg:w-[620px] z-20"
          style={{
            transform: 'rotateY(-12deg) rotateX(16deg) rotateZ(-3deg)',
            filter: `drop-shadow(0 ${28 * shadowIntensity}px ${40 * shadowIntensity}px rgba(0,0,0,0.4))`,
          }}
        >
          {/* Laptop Display Bezel */}
          <div className="bg-[#18181b] p-3 sm:p-4 rounded-t-2xl border-2 border-black shadow-2xl relative">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-30 pointer-events-none">
              <div className="w-28 h-3.5 bg-black rounded-b-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Screen Glass with Flowing Scroll Effect */}
            <div className="relative w-full h-[220px] sm:h-[300px] bg-white rounded-t-lg overflow-hidden border-x border-t border-zinc-900">
              {reflectionEnabled && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
              )}
              <div className="w-full h-full overflow-hidden">
                {contentRenderer('desktop')}
              </div>
            </div>
          </div>

          {/* Laptop Base Frame */}
          <div className="relative bg-[#27272a] h-4 sm:h-5 rounded-b-xl border-t border-zinc-700 shadow-md flex items-center justify-center border-x-2 border-b-2 border-black">
            <div className="w-20 sm:w-28 h-1 bg-black rounded-full" />
          </div>

          {/* ============================================================= */}
          {/* THE EXTENDED LONG SCROLL PAPER SHEET (Curving Downward)        */}
          {/* ============================================================= */}
          <div
            className="relative -mt-2 w-[92%] mx-auto bg-white shadow-2xl border-x-2 border-b-2 border-black z-30 transition-transform"
            style={{
              transform: 'rotateX(-24deg) translateY(-8px) scale(0.96)',
              transformOrigin: 'top center',
              boxShadow: `0 35px 50px -15px rgba(0,0,0,0.45)`,
            }}
          >
            {/* Extended Content Preview */}
            <div className="p-4 sm:p-6 bg-white overflow-hidden max-h-[180px] sm:max-h-[220px]">
              <div className="scale-95 origin-top">
                {contentRenderer('desktop')}
              </div>
            </div>

            {/* The 3D Rolled Cylinder Scroll Lip at the bottom (Matching Image 2) */}
            <div className="relative -mb-10 w-full h-16 sm:h-20 rounded-full bg-black text-[#ccff00] border-2 border-black shadow-[0_20px_35px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 overflow-hidden font-mono">
              <div className="w-10 h-10 rounded-full border-2 border-[#ccff00] bg-black text-[#ccff00] flex items-center justify-center font-bold text-xs">
                ●
              </div>
              <div className="text-right text-[11px] font-black uppercase tracking-wider">
                EXTENDED SCROLL // 300 DPI PREVIEW
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * SCENE 3: Handheld Duo / Foldable Tablet
 * Exactly reproduces the layout in Image 1 with user's color theme:
 * - Two hands holding a wide duo/tablet device
 * - Clean high-contrast background
 * - Full website displayed edge-to-edge
 */
export function HandheldDuoScene({
  contentRenderer,
  backdropTheme,
  shadowIntensity,
  reflectionEnabled,
}: SceneProps) {
  const backdropBg =
    backdropTheme === 'volt'
      ? 'bg-[#0a0b0d] text-zinc-100 border-2 border-black'
      : backdropTheme === 'dark'
      ? 'bg-[#121316] text-white'
      : backdropTheme === 'concrete'
      ? 'bg-[#e5e5df] text-zinc-900'
      : backdropTheme === 'white'
      ? 'bg-[#f7f7f3] text-zinc-900'
      : 'bg-[#f4f4f0] text-zinc-900';

  return (
    <div
      id="mockup-export-target"
      className={`relative w-full max-w-5xl mx-auto min-h-[580px] sm:min-h-[660px] rounded-2xl overflow-hidden p-4 sm:p-10 flex items-center justify-center select-none transition-colors duration-300 ${backdropBg}`}
    >
      {/* Central Handheld Frame with Holding Hands */}
      <div className="relative w-full max-w-4xl flex items-center justify-center">
        
        {/* =============================================================== */}
        {/* LEFT HAND (Realistic Thumb & Grip Silhouette)                   */}
        {/* =============================================================== */}
        <div
          className="absolute -left-6 sm:-left-10 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center"
          style={{
            filter: `drop-shadow(6px 12px 18px rgba(0,0,0,0.4))`,
          }}
        >
          <div className="relative w-16 sm:w-20 h-32 sm:h-40 bg-gradient-to-r from-[#3e271c] via-[#5c3a2a] to-[#6e4635] rounded-r-3xl rounded-l-lg border-r-2 border-black flex items-center">
            <div className="absolute right-2 top-8 w-6 h-8 rounded-full bg-[#8f5a42]/40 border border-[#a86e54]/30" />
          </div>
        </div>

        {/* =============================================================== */}
        {/* THE TABLET / DUO DEVICE CASING                                  */}
        {/* =============================================================== */}
        <div
          id="mockup-target-tablet"
          className="relative w-[340px] sm:w-[620px] lg:w-[740px] bg-[#18181b] p-3 sm:p-4 rounded-[28px] sm:rounded-[36px] border-2 border-black shadow-2xl z-20"
          style={{
            boxShadow: `0 ${30 * shadowIntensity}px ${50 * shadowIntensity}px rgba(0,0,0,0.45)`,
          }}
        >
          {/* Minimal Top Bezel Sensor */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 z-30 pointer-events-none" />

          {/* Screen Display Glass */}
          <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[480px] bg-white rounded-[20px] sm:rounded-[28px] overflow-hidden border border-zinc-900">
            {reflectionEnabled && (
              <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
            )}

            {/* Subtle Center Hinge Crease for Foldable / Duo Illusion */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-zinc-300/40 z-20 pointer-events-none shadow-sm" />

            {/* Content Viewport */}
            <div className="w-full h-full overflow-y-auto">
              {contentRenderer('desktop')}
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* RIGHT HAND (Realistic Thumb & Grip Silhouette)                  */}
        {/* =============================================================== */}
        <div
          className="absolute -right-6 sm:-right-10 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center"
          style={{
            filter: `drop-shadow(-6px 12px 18px rgba(0,0,0,0.4))`,
          }}
        >
          <div className="relative w-16 sm:w-20 h-32 sm:h-40 bg-gradient-to-l from-[#3e271c] via-[#5c3a2a] to-[#6e4635] rounded-l-3xl rounded-r-lg border-l-2 border-black flex items-center">
            <div className="absolute left-2 top-8 w-6 h-8 rounded-full bg-[#8f5a42]/40 border border-[#a86e54]/30" />
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * High-end Minimal Architecture & Furniture Template (Matching Image 3)
 */
export function MinimalInteriorTemplate({ viewport }: { viewport: 'desktop' | 'tablet' | 'mobile' }) {
  const isMobile = viewport === 'mobile';

  return (
    <div className="w-full min-h-full bg-white text-zinc-900 font-sans">
      {/* Top Navigation */}
      <header className="border-b-2 border-black px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif text-base sm:text-lg font-black tracking-widest text-black">
            MOCKUP
          </span>
        </div>

        {!isMobile ? (
          <nav className="flex items-center gap-5 text-xs text-zinc-700 font-medium font-mono">
            <span className="text-black font-bold">Home</span>
            <span className="hover:text-black cursor-pointer">About</span>
            <span className="hover:text-black cursor-pointer">Services</span>
            <span className="hover:text-black cursor-pointer">Portfolio</span>
            <span className="hover:text-black cursor-pointer">Blog</span>
          </nav>
        ) : (
          <Menu className="w-4 h-4 text-black" />
        )}

        <div className="flex items-center gap-3">
          <button className="px-3 py-1 bg-black text-[#ccff00] text-xs font-mono font-bold border border-black hover:bg-[#ccff00] hover:text-black transition-colors">
            Contact Us
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">
          {viewport.toUpperCase()} VIEWPORT MOCKUP
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-black leading-tight">
          {viewport === 'desktop'
            ? 'Laptop Mockup'
            : viewport === 'tablet'
            ? 'Tablet Mockup'
            : 'Phone Screen Mockup'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-md leading-relaxed font-sans">
          Curated minimalist design systems crafted for high-end digital agency portfolios and architectural spatial showrooms.
        </p>

        {/* Showcase Image with Modern Chair Graphic */}
        <div className="mt-6 rounded-xl overflow-hidden bg-[#f5f5f0] border-2 border-black p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-28 bg-black rounded-t-full rounded-b-lg mb-3 shadow-md flex items-center justify-center text-[#ccff00] font-mono text-xs font-bold">
            🪑
          </div>
          <div className="font-serif text-sm font-bold text-black">Aalto Lounge Edition</div>
          <div className="text-[11px] text-zinc-600 font-mono">Nordic Oak &amp; Top-Grain Leather</div>
        </div>
      </div>
    </div>
  );
}
