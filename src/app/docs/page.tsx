'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  BookOpen,
  Terminal,
  Radio,
  Printer,
  Barcode as BarcodeIcon,
  Sliders,
  ShieldCheck,
  Layers,
  Cpu,
  Zap,
  ExternalLink,
  ArrowRight,
  Search,
  FileText,
  CheckCircle2,
  Code,
  Key,
  Globe,
  Lock,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

interface DocCard {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  href: string;
  icon: any;
  bulletPoints: string[];
}

export default function DocsPortalPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'your-user-id';

  const [searchQuery, setSearchQuery] = useState('');

  const docModules: DocCard[] = [
    {
      id: 'api-gateway',
      title: 'Pear API Gateway & Generation',
      category: 'CORE DEVELOPER API',
      badge: '/docs/api',
      description:
        'Programmatic optical rendering pipeline for high-DPI Photo QR codes and barcodes with origin network defense and sliding-window rate limiting.',
      href: '/docs/api',
      icon: Terminal,
      bulletPoints: [
        'POST /api/v1/generate optical render gateway',
        'Strict network origin whitelisting & 403 threat defense',
        'Multi-language SDKs: cURL, TypeScript, Python, Go, PHP',
        'Real-time telemetry headers (x-credits-remaining, x-ratelimit)',
      ],
    },
    {
      id: 'nfc-bat',
      title: 'NFC-BAT Hardware & RF Studio',
      category: 'HARDWARE & EMBEDDED',
      badge: '/nfc-bat',
      description:
        'High-assurance 13.56 MHz contactless card testbench for analyzing and encoding Metro passes, EMV credit cards, hotel keys, and smart badges.',
      href: '/nfc-bat',
      icon: Radio,
      bulletPoints: [
        'Interactive 13.56 MHz antenna coil with audio tone feedback',
        'Sector trailer memory map explorer (Sectors 0-15, Key A/B)',
        'Native Web Crypto API engine (AES-128 GCM, Mifare Crypto1)',
        'ISO 7816-4 APDU protocol analyzer (PPSE, Visa/Mastercard AID)',
      ],
    },
    {
      id: 'b2b-config',
      title: 'B2B Service Configuration Matrix',
      category: 'TENANT CONFIGURATION',
      badge: '/[userid]/configration',
      description:
        'Centralized configuration portal to adjust prepress DPI, barcode symbology, CMYK color separation, and HMAC webhook relays.',
      href: `/${userId}/configration`,
      icon: Sliders,
      bulletPoints: [
        'GET & POST /api/user/config programmatic sync API',
        'QR Engine dot styles: square, rounded, dots with L/M/Q/H recovery',
        'Prepress photo screening: 65-175 LPI halftone rulings',
        'Batch Matrix processing with ZIP compression levels 1-9',
      ],
    },
    {
      id: 'photo-dpi',
      title: '300+ DPI Prepress Photo Studio',
      category: 'OPTICAL & PRINTING',
      badge: '/normal-dpi-photo',
      description:
        'Industrial print preparation suite converting web graphics into press-ready 300, 600, or 1200 DPI CMYK FOGRA39 separated assets.',
      href: '/normal-dpi-photo',
      icon: Printer,
      bulletPoints: [
        '300 DPI, 600 DPI, and 1200 DPI archival raster synthesis',
        'FOGRA39 & US Web Coated (SWOP) CMYK separations',
        'Automated bleed margin calculation (3mm - 5mm) & crop marks',
        'Halftone AM/FM frequency modulation screening simulation',
      ],
    },
    {
      id: 'barcode-studio',
      title: 'Universal Barcode Generator',
      category: 'RETAIL & LOGISTICS',
      badge: '/barcode-pick',
      description:
        'Standards-compliant 1D and 2D barcode generator supporting GS1 specifications, EAN-13 check digit algorithms, and DataMatrix.',
      href: '/barcode-pick',
      icon: BarcodeIcon,
      bulletPoints: [
        'Symbologies: CODE128, EAN13, UPC-A, ITF-14, CODE39, DATAMATRIX',
        'Vector SVG and EPS prepress export formats',
        'Checksum verification and modulo math validation',
        'Configurable X-dimension (bar width) and bar height',
      ],
    },
    {
      id: 'keys-security',
      title: 'API Keys & Outage Defense',
      category: 'SECURITY & GOVERNANCE',
      badge: '/[userid]/pear',
      description:
        'Cryptographic credential lifecycle management with SHA-256 hash storage, per-key rotation, and platform-wide emergency outage lock.',
      href: `/${userId}/pear`,
      icon: ShieldCheck,
      bulletPoints: [
        'One-time key reveal: secrets never stored in plain text',
        'Per-key rotation with automatic revocation of prior credentials',
        'Platform-wide Emergency Global Outage Lockdown protocol',
        'Per-key usage analytics, audit logs, and origin IP telemetry',
      ],
    },
  ];

  const filteredModules = docModules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.bulletPoints.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. HERO BANNER & SEARCH HUD */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 border-2 border-black bg-[#ccff00] text-black shadow-[2px_2px_0px_#000000]">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                DEVELOPER KNOWLEDGE BASE &amp; DOCUMENTATION PORTAL
              </span>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                <span>NEDJECT DOCUMENTATION</span>
                <span className="text-xs bg-black text-[#ccff00] px-2 py-0.5 border border-black font-mono">
                  PLATFORM CORE
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/docs/api"
              className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>FULL API REFERENCE</span>
            </Link>

            <Link
              href={`/${userId}/pear`}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>PEAR API GATEWAY</span>
            </Link>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-700 font-sans leading-relaxed max-w-4xl">
          Comprehensive guides, architectural references, and API specifications for the Nedject Optical &amp; Prepress Matrix.
          Learn how to integrate optical code generation, configure B2B service endpoints, interface with 13.56 MHz NFC hardware,
          and protect your application with strict origin network defense.
        </p>

        {/* Search Input Bar */}
        <div className="relative max-w-2xl">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation (e.g., origin whitelist, DPI, APDU, webhooks, cURL)..."
            className="w-full pl-10 pr-4 py-3 border-2 border-black text-xs font-mono bg-zinc-50 shadow-[3px_3px_0px_#000000] focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* 2. CORE ARCHITECTURAL PIPELINE OVERVIEW */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Layers className="w-5 h-5 text-black" />
          <h2 className="text-base font-black uppercase text-black">
            NEDJECT PLATFORM ARCHITECTURE &amp; DATA FLOW
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
            <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.5 font-bold uppercase block w-fit">
              STAGE 1
            </span>
            <h3 className="font-black text-black">Client &amp; SDK Request</h3>
            <p className="text-[11px] text-zinc-600 font-sans">
              Your backend or web app sends requests with Bearer key &amp; Origin header to{' '}
              <code className="bg-zinc-200 px-1 font-bold">/api/v1/generate</code>.
            </p>
          </div>

          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
            <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.5 font-bold uppercase block w-fit">
              STAGE 2
            </span>
            <h3 className="font-black text-black">Origin &amp; Quota Defense</h3>
            <p className="text-[11px] text-zinc-600 font-sans">
              SHA-256 key hash lookup, strict origin domain whitelist check, 60-second rate limiter, and credit deduction.
            </p>
          </div>

          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
            <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.5 font-bold uppercase block w-fit">
              STAGE 3
            </span>
            <h3 className="font-black text-black">Prepress Optical Engine</h3>
            <p className="text-[11px] text-zinc-600 font-sans">
              Raster/Vector synthesis according to your B2B configurations: CMYK separation, 300+ DPI, symbology margins.
            </p>
          </div>

          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
            <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.5 font-bold uppercase block w-fit">
              STAGE 4
            </span>
            <h3 className="font-black text-black">Delivery &amp; Webhooks</h3>
            <p className="text-[11px] text-zinc-600 font-sans">
              Returns instant asset URL with telemetry headers; asynchronously delivers HMAC-SHA256 signed webhook payloads.
            </p>
          </div>
        </div>
      </div>

      {/* 3. DOCUMENTATION MODULES GRID */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h2 className="text-base font-black uppercase text-black flex items-center gap-2">
            <span>DOCUMENTATION MODULES &amp; GUIDES</span>
            <span className="text-xs text-zinc-500">({filteredModules.length} topics)</span>
          </h2>
          <span className="text-[10px] font-bold text-zinc-500 uppercase">CLICK CARD TO OPEN DIRECT SPEC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((card) => {
            const IconComponent = card.icon;

            return (
              <div
                key={card.id}
                className="border-4 border-black bg-white p-6 space-y-4 shadow-[6px_6px_0px_#000000] flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      {card.category}
                    </span>
                    <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.5 font-bold font-mono">
                      {card.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="p-2 border-2 border-black bg-zinc-100">
                      <IconComponent className="w-5 h-5 text-black" />
                    </span>
                    <h3 className="text-base font-black uppercase text-black leading-tight">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                    {card.description}
                  </p>

                  <div className="pt-2 border-t border-black/10 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">KEY SPECIFICATIONS:</span>
                    <ul className="space-y-1 text-[11px] font-mono text-zinc-700">
                      {card.bulletPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-black font-bold shrink-0">▸</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black">
                  <Link
                    href={card.href}
                    className="w-full py-2.5 px-3 border-2 border-black bg-zinc-100 hover:bg-[#ccff00] text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-colors"
                  >
                    <span>OPEN MODULE SPECIFICATION</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECURITY & BEST PRACTICES CALLOUT */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-black uppercase text-black">
            ENTERPRISE SECURITY &amp; THREAT PREVENTION GUIDELINES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2">
            <h3 className="font-black text-black uppercase flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-zinc-700" />
              <span>1. Secret Key Confidentiality</span>
            </h3>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              API secrets (<code className="bg-zinc-200 px-1 font-bold">ndj_live_...</code>) are shown only once upon creation.
              Never commit raw secrets to public repositories or client-side JavaScript bundles.
            </p>
          </div>

          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2">
            <h3 className="font-black text-black uppercase flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-zinc-700" />
              <span>2. Strict Origin Whitelisting</span>
            </h3>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              Add all development, staging, and production domains to your origin whitelist.
              Requests from unapproved origins are blocked immediately at our edge with HTTP 403.
            </p>
          </div>

          <div className="border-2 border-black bg-zinc-50 p-4 space-y-2">
            <h3 className="font-black text-black uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-zinc-700" />
              <span>3. Outage Key Rotation</span>
            </h3>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              In the event of suspected token exposure or global infrastructure outages, use the &quot;Rotate Key&quot;
              or platform-wide emergency rotate button in your Pear API dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
