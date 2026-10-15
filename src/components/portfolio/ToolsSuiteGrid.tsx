'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ToolItem {
  id: string;
  code: string;
  title: string;
  tag: string;
  badge: string;
  description: string;
  features: string[];
  href: string;
  actionText: string;
  accent: string;
  isExternal?: boolean;
}

const NEDJECT_TOOLS: ToolItem[] = [
  {
    id: 'photo-qr',
    code: 'TOOL // 01',
    title: '300 DPI PHOTO QR CODE STUDIO',
    tag: 'WHOLE-IMAGE BLENDING',
    badge: '★ CORE FLAGSHIP',
    description:
      'Transforms entire portrait photographs and logos into 100% camera-scannable QR matrices. Features ISO/IEC 18004 Reed-Solomon Level H fault tolerance, 21:1 B/W calibration, and embedded physical pHYs chunk injection.',
    features: [
      'Physical pHYs Chunk (11,811 ppm / 300 DPI)',
      'Sub-module Halftoning & Floyd-Steinberg Dither',
      'Real-Time jsQR Optical Scan Verification',
      'Multi-Format: 300 DPI PNG, Vector SVG, ISO PDF',
    ],
    href: '#about',
    actionText: 'LAUNCH QR GENERATOR ↑',
    accent: '#ccff00',
  },
  {
    id: 'normal-dpi-photo',
    code: 'TOOL // 02',
    title: 'NORMAL PHOTO DPI MAKER',
    tag: 'COMMERCIAL PRINT PREPARATION',
    badge: '300 DPI RASTER',
    description:
      'Engineered image rasterization for commercial print shops. Converts regular RGB snapshots into high-contrast monochrome press files formatted for postcards, 5×7 portraits, and A4 print sheets.',
    features: [
      'Continuous Tone S-Curve & Floyd-Steinberg 1-Bit',
      'Halftone Dot Screen Rasterization with Custom Pitch',
      'Fixed Dimension Presets (4×6", 5×7", 8×10", A4)',
      'Physical pHYs Metadata Injection for Offset Press',
    ],
    href: '/normal-dpi-photo',
    actionText: 'OPEN PHOTO DPI MAKER →',
    accent: '#ffffff',
  },
  {
    id: 'barcode-pick',
    code: 'TOOL // 03',
    title: 'BARCODE PICK & LOGISTICS STUDIO',
    tag: '1D / 2D SYMBOLOGY',
    badge: 'ISO PRINT LABELS',
    description:
      'Complete warehouse logistics and retail symbology generator. Generates Amazon FNSKU Code 128, Global ISBN-13, US Grocery UPC-A, ITF-14 corrugated master carton bearer bars, and defense asset tags.',
    features: [
      'CODE128, EAN-13, UPC-A, ITF-14, CODE39, Pharmacode',
      'Automated Payload Checksum Calculation & Fixer',
      'Adjustable DPI Resolution Glide Bar (72 - 600 DPI)',
      'Vector SVG & Standard ISO Print PDF Labels',
    ],
    href: '/barcode-pick',
    actionText: 'GENERATE BARCODES →',
    accent: '#ffffff',
  },
  {
    id: 'qr-crush',
    code: 'TOOL // 04',
    title: 'QR CRUSH FORENSIC & CRYPTO LAB',
    tag: 'SECURITY & REVERSE ENGINEERING',
    badge: 'OPTICAL ANALYSIS',
    description:
      'Optical QR forensics and encrypted container generator. Analyze Shannon entropy, detect obscured QR finder patterns, dissect structured payloads, and build AES-256-GCM cipher containers with camera scanning.',
    features: [
      'Four-Pass Adaptive Forensic Optical Decoder',
      'AES-256-GCM PBKDF2 Password-Protected Payloads',
      'Live Camera Viewfinder with Continuous Scan',
      'Shannon Entropy Meter & Wi-Fi / JWT / vCard Parser',
    ],
    href: '/qr-crush',
    actionText: 'INSPECT & CRUSH QR →',
    accent: '#ffffff',
  },
  {
    id: 'fitness-glass',
    code: 'TOOL // 05',
    title: 'FITNESS GLASS PROTOCOL',
    tag: 'HIGH-PERFORMANCE TIMETABLE',
    badge: 'DUAL MODE',
    description:
      'Dual-purpose protocol sheets designed for high-discipline routines. Switch between an interactive digital web tracker with dynamic 7-day adherence calculations, and a clean blank A4 printable sheet for black ball pen ticking.',
    features: [
      'Dual Usage: Digital Web Click & Clean Paper Print',
      'Automated 80% Adherence Line Calculations',
      'Print-Calibrated A4 PDF with Zero-Ink Box Grids',
      'CSV / Spreadsheet Protocol Export',
    ],
    href: '/fitness-glass',
    actionText: 'OPEN PROTOCOL SHEET →',
    accent: '#ffffff',
  },
  {
    id: 'winter-arc-2026',
    code: 'TOOL // 06',
    title: 'WINTER ARC 2026: 90-DAY PROTOCOL',
    tag: '90-DAY DISCIPLINE MATRIX',
    badge: '24-HOUR STANDARDS',
    description:
      '90-day physical and mental standard protocol. Integrates 24-hour daily execution windows with Google Fit cloud telemetry (Steps, Weight, Blood Pressure) and full A4 measuring chart PDF printouts.',
    features: [
      '90-Day Full Adherence Grid with Day Milestones',
      '24-Hour Circadian Schedule with Target Metrics',
      'Google Fit Cloud Steps & Biometric Sync',
      'Automated Progression Graphs & Print PDF',
    ],
    href: '/fitness-glass/winter-arc-2026',
    actionText: 'LAUNCH WINTER ARC →',
    accent: '#ccff00',
  },
];

export function ToolsSuiteGrid() {
  return (
    <section id="tools-catalog" className="w-full py-16 md:py-24 border-b-2 border-black bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8">
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black tracking-widest text-black mb-3 shadow-[3px_3px_0px_#000000]">
              <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
              <span>NEDJECT // SUITE CATALOG</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-black">
              INDUSTRIAL TOOLS
            </h2>
            <p className="font-mono text-sm text-zinc-700 mt-2 max-w-2xl leading-relaxed">
              Deterministic optical matrix generators, commercial 300 DPI print processors, barcode engines, and forensic analyzers built with zero-radius neo-brutalist discipline.
            </p>
          </div>

          {/* Developer Attribution Card */}
          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] font-mono text-xs max-w-sm">
            <div className="flex items-center justify-between border-b border-black pb-1.5 mb-2">
              <span className="font-bold text-zinc-500 uppercase text-[10px]">BRAND & DEVELOPER</span>
              <span className="bg-[#ccff00] text-black font-black px-1.5 py-0.5 text-[10px] border border-black">
                VERIFIED
              </span>
            </div>
            <div className="font-black text-black text-sm">
              NEDJECT // GENQR_STUDIO
            </div>
            <div className="text-zinc-600 text-xs mt-0.5">
              Developed by <strong className="text-black">neerajrekwar</strong>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Open source & commercial tools suite. 100% client-side privacy.
            </div>
          </div>
        </div>

        {/* Tools Cards Grid (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {NEDJECT_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Card Top Pill Row */}
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <span className="font-mono text-xs font-black text-black">
                    {tool.code}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
                      tool.accent === '#ccff00' ? 'bg-[#ccff00] text-black' : 'bg-black text-white'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Tag */}
                <div>
                  <div className="font-mono text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                    {tool.tag}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mt-1">
                    {tool.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-mono text-xs text-zinc-700 leading-relaxed">
                  {tool.description}
                </p>

                {/* Features List */}
                <div className="border border-black bg-[#fafaf8] p-3 space-y-1.5">
                  <div className="font-mono text-[10px] font-black uppercase text-zinc-500">
                    KEY CAPABILITIES:
                  </div>
                  <ul className="font-mono text-[11px] text-zinc-800 space-y-1">
                    {tool.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#16a34a] font-bold">✔</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={tool.href}
                className="w-full py-3 px-4 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-mono text-xs font-black tracking-widest uppercase shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{tool.actionText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Technical Architecture & Precision Guarantee Banner */}
        <div className="border-2 border-black bg-black text-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] font-mono">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#ccff00] text-black px-2.5 py-0.5 text-xs font-black uppercase">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>NEDJECT DETERMINISTIC MATRIX SPECIFICATION</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                COMMERCIAL 300 DPI DENSITY & ZERO-BLUR PROTOCOL
              </h4>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Standard web generators output 72 DPI screen images that blur when printed on commercial offset presses or laser labelers. Nedject compiles at 2,400×2,400 px physical bounds, calculates Reed-Solomon polynomial parity, and injects the PNG <code className="text-[#ccff00]">pHYs</code> chunk (11,811 pixels per meter) for crisp edge fidelity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/payment"
                className="w-full sm:w-auto px-5 py-3 border-2 border-[#ccff00] bg-[#ccff00] text-black hover:bg-white hover:text-black hover:border-white font-mono text-xs font-black uppercase transition-all shadow-[3px_3px_0px_#ffffff] text-center"
              >
                PLANS &amp; RAZORPAY BILLING →
              </Link>
              <a
                href="https://github.com/neerajrekwar/nedject"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-3 border-2 border-white bg-black hover:bg-zinc-900 text-white font-mono text-xs font-black uppercase transition-all shadow-[3px_3px_0px_#ffffff] text-center"
              >
                VIEW ON GITHUB ↗
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
