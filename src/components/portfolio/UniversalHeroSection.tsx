'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  QrCode,
  Barcode as BarcodeIcon,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Zap,
  Globe,
  Maximize2,
} from 'lucide-react';

interface UniversalHeroSectionProps {
  onExploreProjects?: () => void;
  onExploreRegistry?: () => void;
  onOpenQRArtifact?: () => void;
  onScrollToQRStudio?: () => void;
}

type UniversalTab = 'mockup' | 'photo-qr' | 'barcode' | 'tools';

export function UniversalHeroSection({
  onExploreProjects,
  onExploreRegistry,
  onOpenQRArtifact,
  onScrollToQRStudio,
}: UniversalHeroSectionProps) {
  const [activeTab, setActiveTab] = useState<UniversalTab>('mockup');
  const [interactiveUrlInput, setInteractiveUrlInput] = useState('https://nedject.dev');
  const [activeDevicePreview, setActiveDevicePreview] = useState<'iphone' | 'macbook' | 'trio'>('iphone');

  const scrollToQR = () => {
    if (onScrollToQRStudio) {
      onScrollToQRStudio();
      return;
    }
    const elem = document.getElementById('qr-studio') || document.getElementById('photo-qr-studio');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTools = () => {
    if (onExploreProjects) {
      onExploreProjects();
      return;
    }
    const elem = document.getElementById('tools-catalog');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[70vh] min-h-[580px] max-h-[850px] border-b-2 border-black bg-[#f5f5f0] text-black overflow-hidden flex flex-col justify-between select-none">
      
      {/* Background Subtle Technical Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Main Hero Body - Flex Container fitting precisely inside 70vh */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center h-full">
          
          {/* LEFT COLUMN: Narrative & Universal Command Deck (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
            
            {/* 1. Header Metatag & Status Indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 font-mono text-[11px] font-black tracking-widest text-black shadow-[2px_2px_0px_#000000]">
                <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block animate-pulse" />
                <span>NEDJECT // UNIVERSAL STUDIO</span>
              </div>
              <span className="hidden sm:inline font-mono text-xs text-zinc-500 font-bold">·</span>
              <span className="hidden sm:inline font-mono text-xs font-black text-zinc-700 uppercase tracking-wider">
                BUILD 2026.4
              </span>
              <span className="hidden md:inline font-mono text-xs text-zinc-500 font-bold">·</span>
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-400 px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>ALL ENGINES ONLINE</span>
              </span>
            </div>

            {/* 2. Bold Technical Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-[1.05]">
                INTERPRET, MOCKUP <br className="hidden sm:inline" />
                <span className="bg-[#ccff00] px-2 py-0.5 border-2 border-black inline-block shadow-[3px_3px_0px_#000000] my-1">
                  &amp; ENGINEER
                </span>{' '}
                DIGITAL REALITY.
              </h1>
              <p className="font-mono text-xs sm:text-sm text-zinc-700 mt-2.5 max-w-xl leading-relaxed">
                The universal suite for <strong className="text-black font-black">interactive multi-device mockups</strong>, commercial <strong className="text-black font-black">300 DPI photo QR codes</strong>, barcode symbology, and high-discipline digital tools.
              </p>
            </div>

            {/* 3. Universal Module Selector Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap p-1 bg-white border-2 border-black shadow-[3px_3px_0px_#000000] max-w-xl">
              <button
                onClick={() => setActiveTab('mockup')}
                className={`px-3 py-1.5 font-mono text-xs font-black tracking-wider transition-all flex items-center gap-1.5 border border-transparent ${
                  activeTab === 'mockup'
                    ? 'bg-black text-[#ccff00] border-black shadow-[2px_2px_0px_#ccff00]'
                    : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>MOCKUP STUDIO</span>
              </button>
              
              <button
                onClick={() => setActiveTab('photo-qr')}
                className={`px-3 py-1.5 font-mono text-xs font-black tracking-wider transition-all flex items-center gap-1.5 border border-transparent ${
                  activeTab === 'photo-qr'
                    ? 'bg-black text-[#ccff00] border-black shadow-[2px_2px_0px_#ccff00]'
                    : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>300 DPI QR</span>
              </button>

              <button
                onClick={() => setActiveTab('barcode')}
                className={`px-3 py-1.5 font-mono text-xs font-black tracking-wider transition-all flex items-center gap-1.5 border border-transparent ${
                  activeTab === 'barcode'
                    ? 'bg-black text-[#ccff00] border-black shadow-[2px_2px_0px_#ccff00]'
                    : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <BarcodeIcon className="w-3.5 h-3.5" />
                <span>BARCODES</span>
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-1.5 font-mono text-xs font-black tracking-wider transition-all flex items-center gap-1.5 border border-transparent ${
                  activeTab === 'tools'
                    ? 'bg-black text-[#ccff00] border-black shadow-[2px_2px_0px_#ccff00]'
                    : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>TOOLS CATALOG</span>
              </button>
            </div>

            {/* 4. High-Impact Action CTAs */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <Link
                href="/mochup"
                className="px-5 py-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-mono text-xs font-black tracking-widest uppercase shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>OPEN MOCKUP STUDIO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={scrollToQR}
                className="px-5 py-3 border-2 border-black bg-white text-black hover:bg-black hover:text-[#ccff00] font-mono text-xs font-black tracking-widest uppercase shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>300 DPI QR ENGINE ↓</span>
              </button>

              <button
                onClick={scrollToTools}
                className="hidden sm:flex px-4 py-3 border-2 border-zinc-400 bg-transparent text-zinc-800 hover:border-black hover:bg-white font-mono text-xs font-bold tracking-wider uppercase transition-all items-center gap-1.5 cursor-pointer"
              >
                <span>EXPLORE ALL TOOLS</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

            {/* 5. Quick Micro Metrics Line */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-600 pt-1 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-black">
                <span className="text-[#16a34a]">✔</span> 4K Ultra UHD Export
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-black">
                <span className="text-[#16a34a]">✔</span> 9:16 Mobile Native
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-black">
                <span className="text-[#16a34a]">✔</span> ISO/IEC 18004 300 DPI
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-black">
                <span className="text-[#16a34a]">✔</span> Sandboxed Iframes
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Universal Live Stage / Showcase Card (5 Cols) */}
          <div className="lg:col-span-5 h-full flex flex-col justify-center">
            
            <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] p-4 sm:p-5 flex flex-col justify-between h-[360px] sm:h-[390px] relative overflow-hidden">
              
              {/* Card Top Title Bar */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black inline-block" />
                  </div>
                  <span className="font-mono text-xs font-black uppercase text-black tracking-wider ml-1">
                    {activeTab === 'mockup' && 'INTERACTIVE MOCKUP STAGE'}
                    {activeTab === 'photo-qr' && '300 DPI OPTICAL CALIBRATOR'}
                    {activeTab === 'barcode' && 'LOGISTICS BARCODE MATRIX'}
                    {activeTab === 'tools' && 'NEDJECT UTILITY RUNTIMES'}
                  </span>
                </div>
                
                <span className="font-mono text-[10px] font-black px-2 py-0.5 border border-black bg-[#ccff00] text-black uppercase">
                  LIVE
                </span>
              </div>

              {/* Dynamic Body based on Active Universal Tab */}
              <div className="flex-1 py-3 flex flex-col justify-center">
                
                {/* 1. MOCKUP STUDIO SHOWCASE */}
                {activeTab === 'mockup' && (
                  <div className="space-y-3">
                    {/* Simulated Stage Device Switcher */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveDevicePreview('iphone')}
                          className={`px-2 py-1 font-mono text-[10px] font-bold border border-black ${
                            activeDevicePreview === 'iphone'
                              ? 'bg-black text-[#ccff00]'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          📱 iPhone 16 Pro (9:16)
                        </button>
                        <button
                          onClick={() => setActiveDevicePreview('macbook')}
                          className={`px-2 py-1 font-mono text-[10px] font-bold border border-black ${
                            activeDevicePreview === 'macbook'
                              ? 'bg-black text-[#ccff00]'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          💻 MacBook Pro 16&quot;
                        </button>
                        <button
                          onClick={() => setActiveDevicePreview('trio')}
                          className={`px-2 py-1 font-mono text-[10px] font-bold border border-black ${
                            activeDevicePreview === 'trio'
                              ? 'bg-black text-[#ccff00]'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          ✨ Studio Trio
                        </button>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500">60 FPS REALTIME</span>
                    </div>

                    {/* Interactive Frame Box */}
                    <div className="border-2 border-black bg-zinc-950 p-3 text-white flex items-center justify-between gap-3 relative rounded-none shadow-inner">
                      
                      {activeDevicePreview === 'iphone' ? (
                        <div className="flex items-center gap-3 w-full">
                          {/* Mini Realistic Phone Graphic */}
                          <div className="w-16 h-28 bg-zinc-900 border-2 border-zinc-600 rounded-xl relative p-1 flex flex-col justify-between shrink-0 shadow-lg">
                            {/* Dynamic Island */}
                            <div className="w-5 h-1.5 bg-black mx-auto rounded-full" />
                            {/* Inner Screen Graphic */}
                            <div className="flex-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-1 flex flex-col justify-center items-center text-center">
                              <span className="font-mono text-[7px] text-[#ccff00] font-black">9:16 NATIVE</span>
                              <span className="font-mono text-[6px] text-zinc-400">19.5:9 RATIO</span>
                            </div>
                            {/* Home Indicator */}
                            <div className="w-6 h-0.5 bg-zinc-500 mx-auto rounded-full" />
                          </div>

                          <div className="flex-1 font-mono text-xs space-y-1">
                            <div className="text-[#ccff00] font-black flex items-center gap-1.5">
                              <span>MOBILE RESOLUTION STAGE</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-tight">
                              Pixel-accurate 9:16 layout with Dynamic Island, iOS chrome, and direct one-click resets.
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                              <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">1179 × 2556 PX</span>
                              <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">PNG 4K</span>
                            </div>
                          </div>
                        </div>
                      ) : activeDevicePreview === 'macbook' ? (
                        <div className="flex items-center gap-3 w-full">
                          {/* Mini Laptop Graphic */}
                          <div className="w-24 h-18 bg-zinc-900 border-2 border-zinc-600 rounded-t-md relative p-1 flex flex-col justify-between shrink-0 shadow-lg">
                            <div className="w-1.5 h-1.5 bg-zinc-700 mx-auto rounded-full mb-0.5" />
                            <div className="flex-1 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-xs p-1 flex flex-col justify-center items-center text-center">
                              <span className="font-mono text-[7px] text-[#ccff00] font-black">16:10 RETINA</span>
                              <span className="font-mono text-[6px] text-zinc-400">PRO LIQUID</span>
                            </div>
                            <div className="w-28 h-1 bg-zinc-700 -mx-2 mt-0.5 rounded-b-sm" />
                          </div>

                          <div className="flex-1 font-mono text-xs space-y-1">
                            <div className="text-[#ccff00] font-black flex items-center gap-1.5">
                              <span>DESKTOP RETINA STAGE</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-tight">
                              Curved aluminum chassis, interactive live iframe browser, and notch bezel framing.
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                              <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">3024 × 1964 PX</span>
                              <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">IFRAME LIVE</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex items-end gap-1 shrink-0">
                            <div className="w-16 h-12 bg-zinc-900 border border-zinc-600 rounded-t-xs" />
                            <div className="w-10 h-14 bg-zinc-900 border border-zinc-600 rounded-sm" />
                            <div className="w-6 h-11 bg-zinc-900 border border-zinc-600 rounded-xs" />
                          </div>

                          <div className="flex-1 font-mono text-xs space-y-1">
                            <div className="text-[#ccff00] font-black">APPLE TRIO COMPOSITION</div>
                            <p className="text-[11px] text-zinc-300 leading-tight">
                              Desktop, tablet, and mobile staged together in high-fashion studio lighting.
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                              <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">MULTI-DEVICE</span>
                              <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">3-POINT LIGHT</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Quick Mockup Action Link */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-600">
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                        <span>CUSTOM URL / TEMPLATES / PNG</span>
                      </div>
                      <Link
                        href="/mochup"
                        className="font-mono text-xs font-black text-black hover:text-emerald-700 flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>LAUNCH STUDIO →</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. PHOTO QR CODE SHOWCASE */}
                {activeTab === 'photo-qr' && (
                  <div className="space-y-3 font-mono">
                    <div className="border-2 border-black bg-zinc-950 p-3 text-white flex items-center gap-3">
                      {/* Simulated QR Graphic */}
                      <div className="w-20 h-20 bg-white border-2 border-black p-1 shrink-0 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-4 h-4 bg-black" />
                          <div className="w-4 h-4 bg-black" />
                        </div>
                        <div className="w-3 h-3 bg-[#ccff00] border border-black mx-auto" />
                        <div className="flex justify-between">
                          <div className="w-4 h-4 bg-black" />
                          <div className="w-2 h-2 bg-black" />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-[#ccff00] font-black">300 DPI INDUSTRIAL RASTER</div>
                        <p className="text-[11px] text-zinc-300 leading-tight">
                          Whole-photo halftone &amp; Floyd-Steinberg dithering with 100% verified camera scan rates.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                          <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">pHYs CHUNK (11,811 PPM)</span>
                          <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">21:1 CONTRAST</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-600">ISO/IEC 18004 REED-SOLOMON</span>
                      <button
                        onClick={scrollToQR}
                        className="font-mono text-xs font-black text-black hover:text-emerald-700 flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>GENERATE 300 DPI QR ↓</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. BARCODE LOGISTICS SHOWCASE */}
                {activeTab === 'barcode' && (
                  <div className="space-y-3 font-mono">
                    <div className="border-2 border-black bg-zinc-950 p-3 text-white flex items-center gap-3">
                      {/* Simulated Barcode Graphic */}
                      <div className="w-24 h-16 bg-white border-2 border-black p-1 shrink-0 flex items-end justify-center space-x-0.5">
                        <span className="w-1 h-full bg-black inline-block" />
                        <span className="w-0.5 h-full bg-black inline-block" />
                        <span className="w-1.5 h-full bg-black inline-block" />
                        <span className="w-0.5 h-full bg-black inline-block" />
                        <span className="w-2 h-full bg-black inline-block" />
                        <span className="w-1 h-full bg-black inline-block" />
                        <span className="w-0.5 h-full bg-black inline-block" />
                        <span className="w-1.5 h-full bg-black inline-block" />
                        <span className="w-1 h-full bg-black inline-block" />
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-[#ccff00] font-black">LOGISTICS &amp; WAREHOUSE</div>
                        <p className="text-[11px] text-zinc-300 leading-tight">
                          Code-128, EAN-13, UPC-A, ITF-14, and Amazon FNSKU barcode generation with auto-checksum.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                          <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">VECTOR SVG</span>
                          <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">PRINT PDF</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-600">RETAIL &amp; SUPPLY CHAIN STANDARDS</span>
                      <Link
                        href="/barcode-pick"
                        className="font-mono text-xs font-black text-black hover:text-emerald-700 flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>OPEN BARCODE PICK →</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 4. COMPLETE TOOLS CATALOG SHOWCASE */}
                {activeTab === 'tools' && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/mochup"
                        className="p-2 border border-black bg-zinc-50 hover:bg-[#ccff00] transition-colors"
                      >
                        <div className="font-black text-black text-[11px]">01 // MOCKUP STUDIO</div>
                        <div className="text-[10px] text-zinc-600">Interactive Iframe Lab</div>
                      </Link>
                      <button
                        onClick={scrollToQR}
                        className="p-2 border border-black bg-zinc-50 hover:bg-[#ccff00] transition-colors text-left"
                      >
                        <div className="font-black text-black text-[11px]">02 // 300 DPI QR</div>
                        <div className="text-[10px] text-zinc-600">Whole Photo Halftone</div>
                      </button>
                      <Link
                        href="/barcode-pick"
                        className="p-2 border border-black bg-zinc-50 hover:bg-[#ccff00] transition-colors"
                      >
                        <div className="font-black text-black text-[11px]">03 // BARCODES</div>
                        <div className="text-[10px] text-zinc-600">1D / 2D Symbologies</div>
                      </Link>
                      <Link
                        href="/qr-crush"
                        className="p-2 border border-black bg-zinc-50 hover:bg-[#ccff00] transition-colors"
                      >
                        <div className="font-black text-black text-[11px]">04 // QR CRUSH</div>
                        <div className="text-[10px] text-zinc-600">Optical Forensics Lab</div>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-zinc-600">6 INDUSTRIAL UTILITIES</span>
                      <button
                        onClick={scrollToTools}
                        className="font-mono text-xs font-black text-black hover:text-emerald-700 flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>VIEW ALL IN CATALOG ↓</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Card Metatag Strip */}
              <div className="border-t border-black pt-2 flex items-center justify-between font-mono text-[10px] text-zinc-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>100% CLIENT-SIDE COMPILATION</span>
                </span>
                <span className="font-bold text-black uppercase">ZERO TRACKERS</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Industrial Ticker Bar - Stays cleanly pinned inside the 70vh section */}
      <div className="relative z-10 w-full border-t-2 border-black bg-black text-white font-mono text-[10px] sm:text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-[#ccff00] font-black">
              <Zap className="w-3.5 h-3.5" />
              <span>SYS_CORE // v4.8</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300">
              MOCKUP SCENES: <strong className="text-white">APPLE TRIO · 9:16 MOBILE · DUAL HANDHELD</strong>
            </span>
            <span className="text-zinc-600 hidden md:inline">|</span>
            <span className="text-zinc-300 hidden md:inline">
              CALIBRATION: <strong className="text-white">300 DPI PRINT · pHYs INJECTION</strong>
            </span>
            <span className="text-zinc-600 hidden lg:inline">|</span>
            <span className="text-zinc-300 hidden lg:inline">
              SECURITY: <strong className="text-[#ccff00]">SANDBOXED IFRAMES (NO RECURSION)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-zinc-400 text-[10px]">DEVELOPED BY</span>
            <span className="bg-[#ccff00] text-black font-black px-1.5 py-0.5 text-[10px] border border-black">
              neerajrekwar
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
