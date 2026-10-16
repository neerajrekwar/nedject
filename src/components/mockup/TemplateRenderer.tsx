'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Barcode,
  Layers,
  ArrowRight,
  ExternalLink,
  Activity,
  Heart,
  TrendingUp,
  Cpu,
  Terminal,
  AlertTriangle,
  FileText,
  UserCheck,
  Copy,
  Check,
  Flame,
  Globe,
} from 'lucide-react';

interface Props {
  templateId: string;
  viewportWidth: number;
}

export function TemplateRenderer({ templateId, viewportWidth }: Props) {
  const isMobile = viewportWidth < 600;
  const isTablet = viewportWidth >= 600 && viewportWidth < 1024;
  const isDesktop = viewportWidth >= 1024;

  switch (templateId) {
    case 'apex-logistics':
      return <ApexLogisticsTemplate isMobile={isMobile} isTablet={isTablet} />;
    case 'titan-forensics':
      return <TitanForensicsTemplate isMobile={isMobile} isTablet={isTablet} />;
    case 'pulse-biometrics':
      return <PulseBiometricsTemplate isMobile={isMobile} isTablet={isTablet} />;
    case 'architect-portfolio':
      return <ArchitectPortfolioTemplate isMobile={isMobile} isTablet={isTablet} />;
    case 'industrial-studio':
    default:
      return <IndustrialStudioTemplate isMobile={isMobile} isTablet={isTablet} />;
  }
}

/* -------------------------------------------------------------------------- */
/* 1. INDUSTRIAL STUDIO TEMPLATE                                              */
/* -------------------------------------------------------------------------- */
function IndustrialStudioTemplate({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [dpiSetting, setDpiSetting] = useState<'300' | '72'>('300');
  const [copied, setCopied] = useState(false);

  return (
    <div className="w-full min-h-full bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00]">
      {/* Top Industrial Banner */}
      <div className="border-b-2 border-black bg-black text-[#ccff00] text-[10px] sm:text-xs font-mono font-bold px-3 py-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#ccff00]" />
          NEDJECT // 300 DPI PREPRESS OPTICAL SPECIFICATION
        </span>
        <span className="hidden sm:inline">ISO/IEC 18004 COMPLIANT</span>
      </div>

      {/* Navigation */}
      <nav className="border-b-4 border-black bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-black text-[#ccff00] p-1 border-2 border-black">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tight font-mono">NEDJECT // STUDIO</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="hidden sm:inline text-zinc-600 font-bold">MODE:</span>
          <button
            onClick={() => setDpiSetting(dpiSetting === '300' ? '72' : '300')}
            className={`px-2 py-1 border-2 border-black font-black text-xs ${
              dpiSetting === '300' ? 'bg-[#ccff00] text-black' : 'bg-rose-500 text-white'
            }`}
          >
            {dpiSetting} DPI {dpiSetting === '300' ? '✓' : '⚠'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="p-4 sm:p-8 max-w-5xl mx-auto">
        <div className="border-4 border-black bg-white p-6 sm:p-10 shadow-[6px_6px_0px_#000000]">
          <div className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-black" />
            COMMERCIAL PRINT CALIBRATION ENGINE
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight font-sans">
            High-Resolution Photo QR Codes Engineered for Flexo &amp; Offset Presses
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-zinc-700 font-mono leading-relaxed max-w-2xl">
            Never print blurry 72 DPI codes again. Output razor-sharp, sub-pixel aligned vector SVGs and 300 DPI raster matrices with Reed-Solomon Level H (30%) parity protection.
          </p>

          {/* Interactive Calibration Box */}
          <div className="mt-6 p-4 border-2 border-black bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 border-2 border-black flex items-center justify-center font-black ${
                  dpiSetting === '300' ? 'bg-black text-[#ccff00]' : 'bg-zinc-300 text-zinc-700'
                }`}
              >
                <QrCode className="w-8 h-8" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-black">
                  {dpiSetting === '300' ? '300 DPI Studio Grade' : '72 DPI Low Resolution'}
                </div>
                <div className="text-zinc-500 text-[11px]">
                  {dpiSetting === '300'
                    ? '100% optical readability • Grade A ANSI scan'
                    : 'Interpolation blur • High risk of scan failure'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs font-mono transition-all shadow-[2px_2px_0px_#000000]"
            >
              {copied ? 'CALIBRATION COPIED!' : 'GENERATE SAMPLE'}
            </button>
          </div>
        </div>
      </header>

      {/* Feature Specs Grid */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
            <div className="font-black text-sm text-black mb-1">01. DOT GAIN CONTROL</div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Automatic sub-pixel erosion compensates for liquid ink spread on porous kraft substrates.
            </p>
          </div>

          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
            <div className="font-black text-sm text-black mb-1">02. LEVEL H RECOVERY</div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              30% mathematical redundancy allows high-contrast portrait center embeds without data loss.
            </p>
          </div>

          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
            <div className="font-black text-sm text-black mb-1">03. QUIET ZONE LOCK</div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Mandatory 4-module boundary isolation prevents bleed from surrounding packaging artwork.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. APEX LOGISTICS TEMPLATE                                                 */
/* -------------------------------------------------------------------------- */
function ApexLogisticsTemplate({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [symbology, setSymbology] = useState<'UPC-A' | 'Code 128' | 'FNSKU'>('UPC-A');
  const [scannedCount, setScannedCount] = useState(14820);

  return (
    <div className="w-full min-h-full bg-[#0d1117] text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="border-b border-zinc-800 bg-[#161b22] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Barcode className="w-5 h-5 text-[#ccff00]" />
          <span className="font-black text-sm text-white tracking-tight font-mono">
            APEX LOGISTICS // BARCODE CORE
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">CONVEYOR LIVE</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        {/* Real-time Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-[#161b22] border border-zinc-800 p-3 rounded">
            <div className="text-zinc-500 uppercase text-[10px]">SCANNED TODAY</div>
            <div className="text-lg font-black text-white mt-0.5">{scannedCount.toLocaleString()}</div>
          </div>
          <div className="bg-[#161b22] border border-zinc-800 p-3 rounded">
            <div className="text-zinc-500 uppercase text-[10px]">OPTICAL ACCURACY</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">99.98%</div>
          </div>
          <div className="bg-[#161b22] border border-zinc-800 p-3 rounded">
            <div className="text-zinc-500 uppercase text-[10px]">LINE SPEED</div>
            <div className="text-lg font-black text-[#ccff00] mt-0.5">14.2 m/s</div>
          </div>
          <div className="bg-[#161b22] border border-zinc-800 p-3 rounded">
            <div className="text-zinc-500 uppercase text-[10px]">THERMAL QUEUE</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">0 Active Errs</div>
          </div>
        </div>

        {/* Barcode Lab Box */}
        <div className="bg-[#161b22] border border-zinc-800 p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                Linear Symbology Generator &amp; Modulo 10 Check
              </h2>
              <p className="text-xs text-zinc-400">
                Vector SVG calculation ready for 4x6 thermal direct ribbon printers.
              </p>
            </div>

            <div className="flex items-center gap-1 font-mono text-xs">
              {(['UPC-A', 'Code 128', 'FNSKU'] as const).map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    setSymbology(sym);
                    setScannedCount((c) => c + 1);
                  }}
                  className={`px-2.5 py-1 rounded font-bold transition-colors ${
                    symbology === sym ? 'bg-[#ccff00] text-black font-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Mock Barcode */}
          <div className="bg-white p-6 rounded flex flex-col items-center justify-center my-4">
            <div className="font-mono text-black text-center tracking-widest text-xs font-bold mb-1">
              {symbology === 'UPC-A'
                ? '0 12345 67890 5'
                : symbology === 'Code 128'
                ? 'APX-98204-NYC'
                : 'X003NDJECT'}
            </div>
            {/* CSS Barcode simulation */}
            <div className="h-20 w-64 flex items-stretch justify-between gap-[2px] bg-white">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{
                    width: i % 4 === 0 ? '4px' : i % 2 === 0 ? '2px' : '1px',
                    opacity: i % 7 === 0 ? 0 : 1,
                  }}
                />
              ))}
            </div>
            <div className="font-mono text-[10px] text-zinc-600 mt-2">
              ISO/IEC 15416 ANSI Grade A Verification Passed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. TITAN FORENSICS TEMPLATE                                                */
/* -------------------------------------------------------------------------- */
function TitanForensicsTemplate({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'CRITICAL' | 'SAFE'>('CRITICAL');

  return (
    <div className="w-full min-h-full bg-[#0a0a0c] text-zinc-200 font-mono">
      {/* Forensic Header */}
      <div className="border-b border-red-950/60 bg-[#120a0a] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-rose-400">
          <Terminal className="w-4 h-4" />
          <span className="font-bold tracking-wider">TITAN FORENSICS // QUISHING AUDITOR</span>
        </div>
        <span className="text-[10px] bg-red-950 text-rose-400 border border-red-800 px-2 py-0.5 rounded">
          SOC-2 ACTIVE
        </span>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
        {/* Threat Alert Banner */}
        <div className="border border-red-900/60 bg-red-950/20 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <span>SUSPICIOUS MULTI-HOP REDIRECT TRACE</span>
              <span className="text-[10px] bg-rose-600 text-black px-1.5 font-black rounded">
                THREAT SCORE: 92/100
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Optical payload disguised as corporate invoice. Payload hops through 3 obfuscated shorteners before terminating at an unverified credential harvesting clone.
            </p>
          </div>
        </div>

        {/* Redirect Trace Timeline */}
        <div className="bg-[#121217] border border-zinc-800 p-4 rounded-lg space-y-3 text-xs">
          <div className="text-zinc-400 font-bold border-b border-zinc-800 pb-2">
            REDIRECT HOP TELEMETRY
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-5 text-zinc-500 font-bold">01.</span>
              <span className="bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                HTTP 301
              </span>
              <span className="text-zinc-300">https://short.link/inv-4890</span>
            </div>

            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-5 text-zinc-500 font-bold">02.</span>
              <span className="bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                HTTP 302
              </span>
              <span className="text-zinc-300">https://cdn-gateway-evasion.net/route</span>
            </div>

            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-5 text-zinc-500 font-bold">03.</span>
              <span className="bg-rose-950/60 border border-rose-800 px-1.5 py-0.5 rounded text-[10px]">
                MALICIOUS
              </span>
              <span className="text-rose-300 font-bold">https://login-auth-verify-phish.biz</span>
            </div>
          </div>
        </div>

        {/* Byte Stream Hex Inspector */}
        <div className="bg-[#121217] border border-zinc-800 p-4 rounded-lg text-[11px]">
          <div className="text-zinc-400 font-bold mb-2">RAW MATRIX CODEWORDS (LEVEL H)</div>
          <div className="bg-black p-3 rounded text-zinc-400 overflow-x-auto leading-relaxed">
            <code>
              41 50 45 58 20 53 54 55 44 49 4f 20 33 30 30 20 44 50 49 0a 74 72 61 63 65 3a 20 39 38 32 30 34
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. PULSE BIOMETRICS TEMPLATE                                               */
/* -------------------------------------------------------------------------- */
function PulseBiometricsTemplate({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [steps, setSteps] = useState(12480);
  const [hr, setHr] = useState(74);

  return (
    <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 font-sans">
      {/* Top HUD */}
      <div className="border-b border-zinc-800 bg-[#0e1017] px-4 py-2.5 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity className="w-4 h-4" />
          <span className="font-bold">FITNESS GLASS // HUD TELEMETRY</span>
        </div>
        <span className="text-[11px] text-zinc-400">GOOGLE FIT CLOUD SYNCED</span>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        {/* Biometrics Rings & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#12141f] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-400">CADENCE STEPS</div>
              <div className="text-2xl font-black text-white mt-1">{steps.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">124% of 10,000 Goal</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs font-mono">
              ✓
            </div>
          </div>

          <div className="bg-[#12141f] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-400">HEART RATE</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{hr} BPM</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Resting Normal Zone</div>
            </div>
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
          </div>

          <div className="bg-[#12141f] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-400">ACTIVE ENERGY</div>
              <div className="text-2xl font-black text-amber-400 mt-1">840 KCAL</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Target: 750 kcal</div>
            </div>
            <Flame className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        {/* HUD Timetable Schedule */}
        <div className="bg-[#12141f] border border-zinc-800 p-5 rounded-xl font-mono text-xs">
          <div className="text-zinc-400 font-bold mb-3 border-b border-zinc-800 pb-2 flex items-center justify-between">
            <span>TRAINING CADENCE ENGINE</span>
            <span className="text-[10px] text-emerald-400">WINTER ARC 2026 ACTIVE</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-[#181a28] rounded">
              <span className="text-white font-bold">06:30 - Zone 2 Aerobic Run (5 km)</span>
              <span className="text-emerald-400 font-bold">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#181a28] rounded">
              <span className="text-white font-bold">12:30 - Post-prandial Optical Scan &amp; BP</span>
              <span className="text-[#ccff00] font-bold">120/78 mmHg</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#181a28] rounded">
              <span className="text-zinc-400">18:00 - High-Intensity Plyometrics</span>
              <span className="text-amber-400">SCHEDULED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. ARCHITECT PORTFOLIO TEMPLATE                                            */
/* -------------------------------------------------------------------------- */
function ArchitectPortfolioTemplate({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="w-full min-h-full bg-white text-zinc-900 font-sans">
      {/* Portfolio Header */}
      <header className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="font-black text-sm tracking-tight text-black">NEERAJ REKWAR</div>
          <div className="text-[11px] font-mono text-zinc-500">Principal Systems &amp; Prepress Architect</div>
        </div>
        <div className="font-mono text-xs text-zinc-600">
          <a href="mailto:dev.neerajrekwar@gmail.com" className="hover:underline font-bold text-black">
            dev.neerajrekwar@gmail.com
          </a>
        </div>
      </header>

      <main className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        <div>
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
            EXECUTIVE PROFILE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
            Designing High-Throughput Matrix Generators, 300 DPI Optical Prepress Engines &amp; Zero-Trust Telemetry
          </h1>
          <p className="mt-3 text-sm text-zinc-600 font-mono leading-relaxed">
            Specializing in high-density barcode symbologies, Reed-Solomon Level H math, Google Fit biometrics synchronization, and enterprise Next.js cloud architectures.
          </p>
        </div>

        {/* Selected Systems */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
            FEATURED ARCHITECTURES
          </div>

          <div className="border border-zinc-300 p-4 rounded space-y-1.5 hover:border-black transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-black">Nedject 300 DPI Photo QR Studio</span>
              <span className="text-[11px] font-mono bg-zinc-100 px-2 py-0.5 rounded">Production</span>
            </div>
            <p className="text-xs text-zinc-600 font-mono">
              Engineered sub-pixel thresholding and mechanical dot-gain compensation for flexo presses.
            </p>
          </div>

          <div className="border border-zinc-300 p-4 rounded space-y-1.5 hover:border-black transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-black">Titan QR Forensic Suite</span>
              <span className="text-[11px] font-mono bg-zinc-100 px-2 py-0.5 rounded">Security</span>
            </div>
            <p className="text-xs text-zinc-600 font-mono">
              Zero-Trust Quishing analyzer tracing multi-hop HTTP redirects and detecting physical sticker overlays.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
          <div>
            <div className="font-bold text-black">Direct Dispatch &amp; Consultations</div>
            <div className="text-zinc-500">Available for enterprise architecture advisory.</div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText('dev.neerajrekwar@gmail.com');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 font-bold rounded"
          >
            {copied ? 'EMAIL COPIED!' : 'COPY EMAIL'}
          </button>
        </div>
      </main>
    </div>
  );
}
