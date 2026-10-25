'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  Globe,
  Smartphone,
  QrCode,
  Barcode as BarcodeIcon,
  Printer,
  Activity,
  Shield,
  CreditCard,
  BookOpen,
  Eye,
} from 'lucide-react';

interface SocialCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: string;
}

interface PageMetaItem {
  id: string;
  name: string;
  path: string;
  title: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const PAGES_LIST: PageMetaItem[] = [
  {
    id: 'home',
    name: '300 DPI Photo QR Studio',
    path: '/',
    title: 'Industrial 300 DPI Photo QR Code Studio // Nedject',
    description:
      'Floyd-Steinberg error diffusion & optical halftone matrices calibrated for 300 DPI commercial press prints with 100% verified camera scan rates.',
    badge: 'ISO/IEC 18004 300 DPI',
    icon: QrCode,
    accentColor: '#ccff00',
  },
  {
    id: 'mochup',
    name: 'Mockup & Viewport Studio',
    path: '/mochup',
    title: 'Multi-Device Mockup Studio & Responsive Website Templates',
    description:
      'Pixel-accurate iPhone 16 Pro 9:16, MacBook Pro 16:10, and iPad frames with live URL iframe sandboxing and 4K snapshot exports.',
    badge: 'MULTI-DEVICE RESPONSIVE LAB',
    icon: Smartphone,
    accentColor: '#38bdf8',
  },
  {
    id: 'barcode-pick',
    name: 'Barcode Pick & Vector Studio',
    path: '/barcode-pick',
    title: 'Industrial Barcode Generator & Vector Studio (UPC, EAN, Code 128, FNSKU)',
    description:
      'Generate GS1-compliant Code-128, EAN-13, UPC-A, ITF-14, and Amazon FNSKU barcode matrices with auto-checksum verification and vector SVG/PDF.',
    badge: 'GS1 LOGISTICS COMPLIANCE',
    icon: BarcodeIcon,
    accentColor: '#eab308',
  },
  {
    id: 'normal-dpi-photo',
    name: '300 DPI Photo Prep',
    path: '/normal-dpi-photo',
    title: '300 DPI Photo Prep & Print Calibration Studio',
    description:
      'Commercial photo prep engine with silver gelatin tone curve optimization, B/W print calibration, and vector-aligned PDF & PNG exports for offset presses.',
    badge: 'SILVER GELATIN B/W CURVE',
    icon: Printer,
    accentColor: '#ffffff',
  },
  {
    id: 'fitness-glass',
    name: 'Fitness Glass HUD',
    path: '/fitness-glass',
    title: 'Fitness Smart Glass Timetable & Training Cadence Engine',
    description:
      'HUD timetable matrix and weekly training cadence planner engineered for smart glass displays, Google Fit API cloud telemetry, and wearable sports optics.',
    badge: 'HEADS-UP CADENCE PROTOCOL',
    icon: Activity,
    accentColor: '#10b981',
  },
  {
    id: 'winter-arc-2026',
    name: 'Winter Arc 2026 Protocol',
    path: '/fitness-glass/winter-arc-2026',
    title: 'Winter Arc 2026 — 90-Day Tactical Protocol & HUD Cadence',
    description:
      'Dedicated 90-day winter physical conditioning protocol with daily cadence check-ins, biometric milestones, Google Fit telemetry, and Heads-Up Display exports.',
    badge: '90-DAY WINTER CONDITIONING',
    icon: Activity,
    accentColor: '#10b981',
  },
  {
    id: 'qr-crush',
    name: 'QR Crush Forensics Lab',
    path: '/qr-crush',
    title: 'QR Crush — Forensic QR Code Security Auditor & Vector Scanner',
    description:
      'Deep forensic payload analysis, Shannon entropy scoring, Reed-Solomon ECC parity block diagnostics, and AES-256-GCM encrypted QR payload generation.',
    badge: 'AES-256 PBKDF2 FORENSICS',
    icon: Shield,
    accentColor: '#ef4444',
  },
  {
    id: 'payment',
    name: 'Pro Plans & Pricing',
    path: '/payment',
    title: 'Pricing & Pro Quota Subscriptions // Nedject',
    description:
      'Unlock unlimited 300 DPI high-resolution exports, batch matrix generators, vector barcode downloads, and raw API telemetry with priority SLA.',
    badge: 'COMMERCIAL ENTERPRISE PASS',
    icon: CreditCard,
    accentColor: '#fbbf24',
  },
  {
    id: 'blog',
    name: 'Engineering Monograph Blog',
    path: '/blog',
    title: 'Engineering & Print Calibration Blog // Nedject',
    description:
      'Technical deep-dives on 300 DPI halftone rendering, Floyd-Steinberg diffusion kernels, GS1 barcode symbology checksums, and optical security architecture.',
    badge: 'PEER-REVIEWED SPECIFICATIONS',
    icon: BookOpen,
    accentColor: '#a78bfa',
  },
];

export function SocialCardsModal({ isOpen, onClose, initialPage = 'home' }: SocialCardsModalProps) {
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPage);
  const [previewMode, setPreviewMode] = useState<'twitter' | 'opengraph' | 'canvas'>('twitter');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImageUrl, setCopiedImageUrl] = useState(false);

  // Custom Generator State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('My Custom Industrial Artifact');
  const [customDesc, setCustomDesc] = useState(
    'Deterministic, high-discipline digital utility built with client-side processing and zero trackers.'
  );
  const [customBadge, setCustomBadge] = useState('USER GENERATED SPEC');

  if (!isOpen) return null;

  const activePage = PAGES_LIST.find((p) => p.id === selectedPageId) || PAGES_LIST[0];

  const ogImageUrl = isCustomMode
    ? `/api/og?page=custom&title=${encodeURIComponent(customTitle)}&desc=${encodeURIComponent(
        customDesc
      )}&badge=${encodeURIComponent(customBadge)}`
    : `/api/og?page=${activePage.id}`;

  const currentDisplayTitle = isCustomMode ? customTitle : activePage.title;
  const currentDisplayDesc = isCustomMode ? customDesc : activePage.description;

  const handleCopyShareLink = () => {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${activePage.path}` : '';
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyImageUrl = () => {
    const fullImgUrl = typeof window !== 'undefined' ? `${window.location.origin}${ogImageUrl}` : '';
    if (fullImgUrl) {
      navigator.clipboard.writeText(fullImgUrl);
      setCopiedImageUrl(true);
      setTimeout(() => setCopiedImageUrl(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${activePage.path}` : '';
    const text = encodeURIComponent(`${currentDisplayTitle}\n\nBuilt with Nedject Studio`);
    const twitterIntent = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#f5f5f0] border-4 border-black shadow-[8px_8px_0px_#ccff00] flex flex-col overflow-hidden font-mono text-black">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-4 border-black bg-black text-white px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#ccff00] border border-black inline-block animate-pulse" />
            <h2 className="text-sm sm:text-base font-black tracking-widest text-[#ccff00] uppercase">
              SOCIAL CARDS &amp; OPENGRAPH ENGINE // CANVAS 1200×630
            </h2>
            <span className="hidden md:inline font-mono text-xs text-zinc-400">
              | ISO 18004 CERTIFIED SPEC
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1 text-xs font-black border-2 border-black transition-all ${
                isCustomMode
                  ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_#ffffff]'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
            >
              {isCustomMode ? '★ CUSTOM MODE: ON' : '+ CUSTOM CARD MAKER'}
            </button>
            <button
              onClick={onClose}
              className="p-1 border-2 border-white hover:bg-[#ccff00] hover:text-black hover:border-black transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-black">
          
          {/* Left Column: Pages Directory Selector (4 cols) */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-white flex flex-col justify-between space-y-4 overflow-y-auto max-h-[400px] lg:max-h-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  SELECT PAGE CARD
                </span>
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 border border-zinc-300">
                  {PAGES_LIST.length} DISTINCT PATTERNS
                </span>
              </div>

              {/* Page Buttons List */}
              <div className="space-y-1.5">
                {PAGES_LIST.map((page) => {
                  const Icon = page.icon;
                  const isSelected = selectedPageId === page.id && !isCustomMode;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedPageId(page.id);
                        setIsCustomMode(false);
                      }}
                      className={`w-full text-left p-2.5 border-2 border-black transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-black text-[#ccff00] shadow-[3px_3px_0px_#ccff00] translate-x-[2px]'
                          : 'bg-zinc-50 text-black hover:bg-zinc-100 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="truncate">
                          <div className="font-black text-xs truncate">{page.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {page.path}
                          </div>
                        </div>
                      </div>

                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black shrink-0"
                        style={{ backgroundColor: page.accentColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Mode Controls */}
            {isCustomMode && (
              <div className="border-2 border-black p-3 bg-zinc-50 space-y-2.5">
                <div className="text-xs font-black text-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>CUSTOM CARD GENERATOR</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                    CARD TITLE
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 border border-black bg-white focus:outline-none focus:bg-[#ccff00]/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                    CARD SUBTITLE / SUMMARY
                  </label>
                  <textarea
                    rows={2}
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 border border-black bg-white focus:outline-none focus:bg-[#ccff00]/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                    BADGE METATAG
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 border border-black bg-white focus:outline-none focus:bg-[#ccff00]/10"
                  />
                </div>
              </div>
            )}

            {/* Tech Spec Box */}
            <div className="border-2 border-black bg-zinc-100 p-2.5 text-[11px] space-y-1">
              <div className="font-black text-black">IMAGE SPECIFICATION:</div>
              <div className="text-zinc-600 text-[10px] leading-tight">
                • Native Resolution: <strong className="text-black">1200 × 630 PX</strong> (1.91:1)
                <br />
                • Format: <strong className="text-black">Lossless PNG</strong> via Node Canvas
                <br />
                • Cache: <strong className="text-black">86,400s Edge Revalidation</strong>
                <br />
                • Fallback: <strong className="text-black">Instant client &amp; server SSR</strong>
              </div>
            </div>

          </div>

          {/* Right Column: Live Card Stage & Social Simulator (8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-[#f5f5f0] flex flex-col justify-between space-y-4">
            
            {/* View Mode Switcher & Quick Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 border-2 border-black bg-white p-1 shadow-[2px_2px_0px_#000000]">
                <button
                  onClick={() => setPreviewMode('twitter')}
                  className={`px-3 py-1 text-xs font-black tracking-wider transition-all cursor-pointer ${
                    previewMode === 'twitter'
                      ? 'bg-black text-[#ccff00]'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  🐦 X / TWITTER CARD
                </button>
                <button
                  onClick={() => setPreviewMode('opengraph')}
                  className={`px-3 py-1 text-xs font-black tracking-wider transition-all cursor-pointer ${
                    previewMode === 'opengraph'
                      ? 'bg-black text-[#ccff00]'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  🌐 OPENGRAPH PREVIEW
                </button>
                <button
                  onClick={() => setPreviewMode('canvas')}
                  className={`px-3 py-1 text-xs font-black tracking-wider transition-all cursor-pointer ${
                    previewMode === 'canvas'
                      ? 'bg-black text-[#ccff00]'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  🖼 RAW 1200×630
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={ogImageUrl}
                  download={`nedject-${isCustomMode ? 'custom' : activePage.id}-og.png`}
                  className="px-3 py-1.5 border-2 border-black bg-[#ccff00] text-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-[#ccff00] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD PNG</span>
                </a>

                <button
                  onClick={handleShareTwitter}
                  className="px-3 py-1.5 border-2 border-black bg-black text-white hover:text-[#ccff00] font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE ON X</span>
                </button>
              </div>
            </div>

            {/* PREVIEW STAGE */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-zinc-900 border-2 border-black shadow-inner overflow-hidden">
              
              {/* 1. TWITTER / X SIMULATOR */}
              {previewMode === 'twitter' && (
                <div className="w-full max-w-xl bg-black border border-zinc-800 rounded-2xl p-4 text-white font-sans shadow-2xl">
                  {/* Tweet Header */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#ccff00] border border-black flex items-center justify-center font-black text-black text-sm">
                      N
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">Nedject Studio</span>
                        <span className="text-zinc-500 text-xs">@Nedject · 1m</span>
                      </div>
                      <div className="text-xs text-zinc-300">
                        Check out the live {activePage.name} built with zero-pill neo-brutalist discipline!
                      </div>
                    </div>
                  </div>

                  {/* Twitter Card Large Image Frame */}
                  <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                    <div className="relative aspect-[1200/630] w-full bg-zinc-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ogImageUrl}
                        alt={currentDisplayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 bg-zinc-950/95 border-t border-zinc-800/80">
                      <div className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                        nedject.dev
                      </div>
                      <div className="font-bold text-sm text-white truncate mt-0.5">
                        {currentDisplayTitle}
                      </div>
                      <div className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                        {currentDisplayDesc}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. OPENGRAPH SIMULATOR (SLACK / LINKEDIN / DISCORD) */}
              {previewMode === 'opengraph' && (
                <div className="w-full max-w-xl bg-[#1e1e1e] border-l-4 border-[#ccff00] rounded-r-lg p-4 text-white font-sans shadow-2xl">
                  <div className="text-xs text-zinc-400 font-mono mb-1">
                    Nedject // Industrial Suite
                  </div>
                  <div className="font-bold text-base text-[#38bdf8] hover:underline cursor-pointer">
                    {currentDisplayTitle}
                  </div>
                  <div className="text-xs text-zinc-300 line-clamp-2 mt-1">
                    {currentDisplayDesc}
                  </div>

                  {/* OpenGraph Image Preview */}
                  <div className="mt-3 relative aspect-[1200/630] w-full rounded-md overflow-hidden border border-zinc-700 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImageUrl}
                      alt={currentDisplayTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* 3. RAW 1200x630 CANVAS INSPECTOR */}
              {previewMode === 'canvas' && (
                <div className="w-full max-w-2xl bg-black border-2 border-white p-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pb-2">
                    <span>CANVAS BUFFER OUTPUT: 1200 × 630 PX (1.91:1)</span>
                    <span className="text-[#ccff00]">LIVE NODE CANVAS RASTER</span>
                  </div>
                  <div className="relative aspect-[1200/630] w-full overflow-hidden border border-zinc-700 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImageUrl}
                      alt={currentDisplayTitle}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Meta Bar & Share Tools */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t-2 border-black text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-600">PAGE ROUTE:</span>
                <span className="bg-white px-2 py-0.5 border border-black font-black text-black">
                  {activePage.path}
                </span>
                <span className="font-bold text-zinc-600">API ENDPOINT:</span>
                <code className="bg-zinc-200 px-1.5 py-0.5 text-[11px] text-black">
                  /api/og?page={activePage.id}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="px-2.5 py-1 border border-black bg-white hover:bg-zinc-100 text-black font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'LINK COPIED!' : 'COPY PAGE URL'}</span>
                </button>
                <button
                  onClick={handleCopyImageUrl}
                  className="px-2.5 py-1 border border-black bg-white hover:bg-zinc-100 text-black font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedImageUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedImageUrl ? 'IMAGE URL COPIED!' : 'COPY IMAGE URL'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
