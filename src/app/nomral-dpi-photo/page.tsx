'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Download,
  FileText,
  Printer,
  Check,
  Eye,
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  Frame,
  Grid3X3,
  RotateCw,
  Layers,
  Lock,
  Unlock,
  Maximize2,
} from 'lucide-react';
import {
  PhotoDPIOptions,
  BWToneMode,
  CanvasFrameStyle,
  FrameColorPalette,
  renderPhotoToDPICanvas,
  exportPhotoDPI_PNG,
  exportPhotoDPI_PDF,
  triggerFileDownload,
} from '@/lib/photo-dpi-engine';
import { PHOTO_PRESETS } from '@/lib/photo-presets';
import { UsageBanner } from '@/components/auth/UsageBanner';
import { useSession } from 'next-auth/react';
import { consumeToolQuota } from '@/lib/usage-limits';
import { QuotaLimitModal } from '@/components/auth/QuotaLimitModal';
import { DPIGlideBar } from '@/components/DPIGlideBar';

const ASPECT_RATIO_PRESETS = [
  { id: '1:1', label: '1:1 Square', w: 6, h: 6, desc: 'Social / PWA / Vinyl' },
  { id: '4:5', label: '4:5 Portrait', w: 4, h: 5, desc: 'Instagram Feed / 8"×10"' },
  { id: '3:4', label: '3:4 Classic', w: 6, h: 8, desc: 'Classic Portrait / 6"×8"' },
  { id: '2:3', label: '2:3 35mm Print', w: 4, h: 6, desc: 'Photo Print / 4"×6"' },
  { id: '9:16', label: '9:16 Story', w: 4.5, h: 8, desc: 'Reels / Mobile / Stories' },
  { id: '16:9', label: '16:9 Cinema', w: 8, h: 4.5, desc: 'Widescreen Display' },
  { id: '4:3', label: '4:3 Display', w: 8, h: 6, desc: 'Standard Screen / Print' },
  { id: 'A4', label: 'A4 ISO Print', w: 8.27, h: 11.69, desc: '210×297 mm Sheet' },
];

const TONE_MODES: { id: BWToneMode; label: string; desc: string; badge: string }[] = [
  {
    id: 'am-line',
    label: 'AM Line Halftone',
    desc: 'Amplitude-modulated diagonal line screen (engraving / banknote linework)',
    badge: 'TARGET SPEC',
  },
  {
    id: 'am-dot',
    label: 'AM Clustered Dot',
    desc: 'Classic 45° offset press newspaper & rotogravure dot screen',
    badge: 'NEWSPAPER',
  },
  {
    id: 'am-crosshatch',
    label: 'AM Crosshatch',
    desc: 'Intersecting dual diagonal line screen (+45° / -45° fine crosshatching)',
    badge: 'ENGRAVING',
  },
  {
    id: 'am-diamond',
    label: 'AM Diamond Dot',
    desc: 'Elliptical diamond dot screen for smooth photographic mid-tones',
    badge: 'PHOTO PRESS',
  },
  {
    id: 'floyd-steinberg',
    label: 'Floyd-Steinberg 1-Bit',
    desc: 'Stochastic error diffusion dither for risograph & newspaper prints',
    badge: 'DITHER',
  },
  {
    id: 'bayer-ordered',
    label: '8×8 Bayer Matrix',
    desc: 'Retro digital clustered-dot ordered dithering algorithm',
    badge: 'RETRO 8-BIT',
  },
  {
    id: 'high-contrast',
    label: 'High-Contrast B/W',
    desc: '21:1 commercial darkroom separation with crisp micro-tonal contrast',
    badge: '21:1 CONTRAST',
  },
  {
    id: 'silver-gelatin',
    label: 'Silver Gelatin Film',
    desc: 'Continuous tone analog darkroom S-curve with rich shadows',
    badge: 'ANALOG FILM',
  },
  {
    id: 'hard-threshold',
    label: 'Hard Threshold',
    desc: 'Crisp binary 1-bit monochrome silhouette for silkscreen & laser',
    badge: 'STENCIL',
  },
];

const FRAME_STYLES: { id: CanvasFrameStyle; label: string; desc: string; badge: string }[] = [
  {
    id: 'heritage',
    label: 'Heritage Ornate',
    desc: 'Baroque corner filigree, museum gold double pinstripe, and bottom engraved brass plaque',
    badge: 'HERITAGE',
  },
  {
    id: 'vintage',
    label: 'Vintage Stamp',
    desc: 'Perforated postage stamp scalloped edges and circular postal cancellation seal',
    badge: 'VINTAGE',
  },
  {
    id: 'polaroid',
    label: 'Polaroid Instant',
    desc: 'Authentic classic instant film card with bottom signature border and emulsion shadow',
    badge: 'INSTANT',
  },
  {
    id: 'industrial',
    label: 'Industrial Proof',
    desc: 'Millimeter calibration rulers, 4-corner crop marks, and CMYK registration crosshairs',
    badge: 'NEO-BRUTALIST',
  },
  {
    id: 'passepartout',
    label: 'Passe-Partout Mat',
    desc: 'Modern gallery bevel-cut mat with floating hairline and subtle embossing',
    badge: 'GALLERY',
  },
  {
    id: 'cyber-hud',
    label: 'Cyber-HUD Optic',
    desc: 'Tactical sci-fi HUD frame with corner brackets, target reticle crosshairs, and telemetry',
    badge: 'CYBERPUNK',
  },
  {
    id: 'none',
    label: 'Borderless Full-Bleed',
    desc: 'Clean edge-to-edge photo with microscopic 1px registration boundary',
    badge: 'MINIMAL',
  },
];

const LPI_PRESETS = [
  { lpi: 45, label: '45 LPI (Coarse Newspaper)', desc: 'Matches visible halftone dot texture' },
  { lpi: 55, label: '55 LPI (Editorial Newsprint)', desc: 'Distinctive visible AM dots & lines' },
  { lpi: 65, label: '65 LPI (Classic Litho)', desc: 'Smooth balanced dot structure' },
  { lpi: 85, label: '85 LPI (Standard Clean)', desc: 'Standard commercial publication' },
  { lpi: 100, label: '100 LPI (Fine Offset)', desc: 'Sharp high-quality print' },
  { lpi: 133, label: '133 LPI (Commercial Photo)', desc: 'Dots become nearly microscopic' },
  { lpi: 150, label: '150 LPI (Ultra-Fine Art)', desc: 'Continuous-tone appearance' },
];

const SCREEN_ANGLES = [
  { angle: 45, label: '45° (Optimal Eye Angle)', desc: 'Least sensitive to human eye; avoids banding' },
  { angle: 0, label: '0° (Orthogonal)', desc: 'Horizontal / vertical grid' },
  { angle: 15, label: '15° (Cyan Angle)', desc: 'Standard 4-color process cyan angle' },
  { angle: 75, label: '75° (Magenta Angle)', desc: 'Standard 4-color process magenta angle' },
  { angle: 90, label: '90° (Vertical Stripes)', desc: 'Direct vertical engraving pattern' },
];

export default function NormalDPIPhotoPage() {
  const { data: session } = useSession();
  const [currentImageSource, setCurrentImageSource] = useState<string>(PHOTO_PRESETS[0].dataUrl);
  const [imageFileName, setImageFileName] = useState<string>('Studio Portrait Specimen');

  const [options, setOptions] = useState<PhotoDPIOptions>({
    dpi: 600,
    lpi: 55,
    screenAngle: 45,
    toneMode: 'am-line',
    contrast: 1.45,
    brightness: 1.0,
    sharpness: 35,
    invert: false,
    threshold: 128,
    halftoneDotSize: 6,
    targetWidthInches: 4,
    targetHeightInches: 5,
    aspectRatio: '4:5',
    aspectMode: 'cover',
    frameStyle: 'heritage',
    frameWidthPercent: 7,
    frameColorPalette: 'heritage-gold',
    frameCaption: 'ARCHIVAL SPECIMEN № 1926',
  });

  const [isRatioLocked, setIsRatioLocked] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'ratio-frames' | 'halftone-am' | 'tonal' | 'export'>('ratio-frames');
  const [showOriginal, setShowOriginal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Re-render canvas whenever image or options change
  useEffect(() => {
    let isCancelled = false;
    if (!canvasRef.current) return;

    renderPhotoToDPICanvas(canvasRef.current, currentImageSource, options).then(() => {
      if (isCancelled) return;
    });

    return () => {
      isCancelled = true;
    };
  }, [currentImageSource, options]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdate = (updates: Partial<PhotoDPIOptions>) => {
    setOptions((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const selectRatio = (preset: typeof ASPECT_RATIO_PRESETS[0]) => {
    setOptions((prev) => ({
      ...prev,
      aspectRatio: preset.id,
      targetWidthInches: preset.w,
      targetHeightInches: preset.h,
    }));
    showToast(`Aspect Ratio set to ${preset.label} (${preset.w}" × ${preset.h}")`);
  };

  const handleWidthChange = (newWidth: number) => {
    const w = Math.max(1, newWidth);
    if (isRatioLocked && options.targetWidthInches > 0) {
      const currentRatio = options.targetHeightInches / options.targetWidthInches;
      const newHeight = parseFloat((w * currentRatio).toFixed(2));
      handleUpdate({ targetWidthInches: w, targetHeightInches: newHeight });
    } else {
      handleUpdate({ targetWidthInches: w, aspectRatio: 'custom' });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const h = Math.max(1, newHeight);
    if (isRatioLocked && options.targetHeightInches > 0) {
      const currentRatio = options.targetWidthInches / options.targetHeightInches;
      const newWidth = parseFloat((h * currentRatio).toFixed(2));
      handleUpdate({ targetWidthInches: newWidth, targetHeightInches: h });
    } else {
      handleUpdate({ targetHeightInches: h, aspectRatio: 'custom' });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCurrentImageSource(dataUrl);
      showToast(`Loaded "${file.name}" for DPI processing`);
    };
    reader.readAsDataURL(file);
  };

  const verifyQuota = async () => {
    const isLogged = Boolean(session?.user);
    const plan = ((session?.user as any)?.plan || 'free') as 'free' | 'pro';
    const res = await consumeToolQuota('photo_dpi', isLogged, plan);
    return res.allowed;
  };

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    const allowed = await verifyQuota();
    if (!allowed) return;

    setIsExporting(true);
    try {
      const result = await exportPhotoDPI_PNG(canvasRef.current, options, 'Photo-Print');
      triggerFileDownload(result);
      showToast(`Exported ${options.dpi} DPI PNG (Physical pHYs injected)`);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    const allowed = await verifyQuota();
    if (!allowed) return;

    setIsExporting(true);
    try {
      const result = await exportPhotoDPI_PDF(canvasRef.current, options, 'Photo-Print');
      triggerFileDownload(result);
      showToast('Exported ISO Print Card PDF with trim marks');
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Dimensions & Halftone Math
  const widthPx = Math.round(options.targetWidthInches * options.dpi);
  const heightPx = Math.round(options.targetHeightInches * options.dpi);
  const megapixels = ((widthPx * heightPx) / 1000000).toFixed(2);
  const cellSizePx = (options.dpi / options.lpi).toFixed(1);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex flex-col">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#f5f5f0] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center w-12 h-12 border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] transition-colors font-mono font-black text-xl"
            >
              NR
            </Link>
            <div>
              <div className="font-mono text-xs font-black tracking-widest text-black flex items-center gap-1.5">
                <span>PHOTO DPI MAKER &amp; AM HALFTONE STUDIO</span>
                <span className="w-1.5 h-1.5 bg-[#ccff00] border border-black inline-block" />
              </div>
              <div className="font-mono text-[10px] text-zinc-600 tracking-wider">
                RATIOS · CANVAS FRAMES · 600-1200 DPI · 45-65 LPI · 45° AM SCREENING
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
              <span className="border-2 border-black bg-[#ccff00] text-black px-2.5 py-1 font-black shadow-[2px_2px_0px_#000000]">
                {options.dpi} DPI · {options.lpi} LPI
              </span>
              <span className="border-2 border-black bg-black text-[#ccff00] px-2.5 py-1 font-black shadow-[2px_2px_0px_#000000]">
                {options.screenAngle}° ANGLE
              </span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 border-2 border-black bg-white hover:bg-black hover:text-white px-3.5 py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#000000] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO QR STUDIO</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Dossier Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-[3px_3px_0px_#000000]">
            <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest text-black uppercase">
              {'// ENGINE: AMPLITUDE MODULATED (AM) HALFTONE SCREENING & VINTAGE CANVAS FRAMES'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-black">
                AM HALFTONE STUDIO
              </h1>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-emerald-800">
                RATIOS &amp; CANVAS FRAMES
              </h2>
            </div>

            <p className="font-mono text-xs sm:text-sm text-zinc-700 max-w-xl leading-relaxed">
              Convert any photo into scannable <strong>AM line/dot halftone prints</strong> calibrated to 600/1200 DPI and 45–65 LPI at 45° screen angle. Choose from <strong>Heritage, Vintage, Polaroid, and Industrial canvas frames</strong> with real-time aspect ratio control.
            </p>
          </div>
        </div>

        {/* QUOTA & FEATURE FLAG MONETIZATION BANNER */}
        <UsageBanner />

        {/* QUICK ASPECT RATIO SELECTOR BAR */}
        <div className="border-2 border-black bg-white p-3 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black inline-block" />
            <span className="font-mono text-xs font-black uppercase text-black tracking-wider">
              QUICK ASPECT RATIO:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {ASPECT_RATIO_PRESETS.map((p) => {
              const isSelected = options.aspectRatio === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectRatio(p)}
                  className={`px-2.5 py-1.5 font-mono text-xs font-black transition-all cursor-pointer whitespace-nowrap border border-black flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'bg-[#fafaf8] text-black hover:bg-zinc-200'
                  }`}
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Grid Container */}
        <div className="border-2 border-black bg-white shadow-[8px_8px_0px_#000000] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT COLUMN: Controls & Configurations (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-7 border-b-2 lg:border-b-0 lg:border-r-2 border-black flex flex-col justify-between space-y-6 bg-white">
            
            <div className="space-y-6">
              
              {/* Navigation Tabs Bar */}
              <div className="flex items-center gap-1.5 border-2 border-black bg-[#fafaf8] p-1.5 shadow-[3px_3px_0px_#000000] overflow-x-auto">
                {[
                  { id: 'ratio-frames', label: 'RATIOS & CANVAS FRAMES', icon: Frame },
                  { id: 'halftone-am', label: 'AM SCREENING (DPI/LPI)', icon: Grid3X3 },
                  { id: 'tonal', label: 'TONAL & UNSHARP MASK', icon: SlidersHorizontal },
                  { id: 'export', label: 'EXPORT (PNG/PDF)', icon: Download },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`px-3 py-2 font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-transparent ${
                        isActive
                          ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000] border-black'
                          : 'bg-white text-black hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Photo Upload & Presets Section */}
              <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3 shadow-[3px_3px_0px_#000000]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-black" />
                    <span>LOAD SOURCE PHOTO FOR AM SCREENING</span>
                  </span>
                  <span className="font-mono text-[10px] bg-black text-[#ccff00] px-1.5 py-0.5 font-bold">
                    ANY FORMAT (JPG/PNG/WEBP)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-dpi-upload"
                  />
                  <label
                    htmlFor="photo-dpi-upload"
                    className="flex-1 w-full border-2 border-dashed border-black bg-white hover:bg-zinc-50 p-3 text-center font-mono text-xs font-bold text-black cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-black" />
                    <span>{imageFileName ? `Change Image (${imageFileName})` : 'Choose Photo from Device...'}</span>
                  </label>
                </div>

                {/* Preset Specimens */}
                <div className="pt-2 border-t border-zinc-200">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase block mb-1.5">
                    OR TEST WITH CURATED SPECIMEN PRESETS:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentImageSource(p.dataUrl);
                          setImageFileName(p.name);
                          showToast(`Loaded ${p.name}`);
                        }}
                        className={`p-1.5 border border-black font-mono text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          currentImageSource === p.dataUrl ? 'bg-black text-[#ccff00]' : 'bg-white hover:bg-zinc-100'
                        }`}
                      >
                        <div className="w-10 h-10 border border-black bg-white shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate w-full text-center">{p.name.replace('B/W ', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* TAB 1: RATIOS & CANVAS FRAMES                            */}
              {/* ======================================================== */}
              {activeTab === 'ratio-frames' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* 1.1 Ratio Selection & Dimensions */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-4 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                      <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
                        <Maximize2 className="w-4 h-4 text-black" />
                        <span>ASPECT RATIO &amp; PRINT GEOMETRY</span>
                      </span>
                      <span className="font-mono text-[10px] bg-black text-[#ccff00] px-2 py-0.5 font-bold">
                        ACTIVE: {options.aspectRatio} ({options.targetWidthInches}&quot; × {options.targetHeightInches}&quot;)
                      </span>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ASPECT_RATIO_PRESETS.map((preset) => {
                        const isSelected = options.aspectRatio === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => selectRatio(preset)}
                            className={`p-2 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            <div className="font-black text-xs flex items-center justify-between">
                              <span>{preset.label}</span>
                              {isSelected && <span className="text-[9px] bg-[#ccff00] text-black px-1 font-black">✓</span>}
                            </div>
                            <div className="text-[10px] opacity-75 mt-0.5">{preset.desc}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Width & Height Inputs with Lock Toggle */}
                    <div className="pt-2 border-t border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-black uppercase text-zinc-700">
                          CUSTOM PRINT DIMENSIONS (INCHES):
                        </span>
                        <button
                          onClick={() => setIsRatioLocked(!isRatioLocked)}
                          className={`px-2 py-0.5 font-mono text-[10px] font-black border border-black flex items-center gap-1 transition-colors ${
                            isRatioLocked ? 'bg-black text-[#ccff00]' : 'bg-white text-black'
                          }`}
                        >
                          {isRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{isRatioLocked ? 'RATIO LOCKED' : 'FREE UNLOCKED'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-[10px] text-zinc-600 mb-0.5">WIDTH (INCHES)</label>
                          <input
                            type="number"
                            step="0.25"
                            min="1"
                            max="30"
                            value={options.targetWidthInches}
                            onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 1)}
                            className="w-full p-2 border-2 border-black bg-white font-mono text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] text-zinc-600 mb-0.5">HEIGHT (INCHES)</label>
                          <input
                            type="number"
                            step="0.25"
                            min="1"
                            max="40"
                            value={options.targetHeightInches}
                            onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 1)}
                            className="w-full p-2 border-2 border-black bg-white font-mono text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Aspect Mode (Fit vs Fill) */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-mono text-[10px] font-bold text-zinc-600 uppercase">IMAGE FIT MODE:</span>
                        {(['cover', 'contain', 'original'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleUpdate({ aspectMode: mode })}
                            className={`px-2 py-0.5 font-mono text-[10px] font-bold border border-black uppercase ${
                              options.aspectMode === mode ? 'bg-black text-[#ccff00]' : 'bg-white hover:bg-zinc-100'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Canvas Frames System */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-4 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                      <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
                        <Frame className="w-4 h-4 text-black" />
                        <span>CANVAS FRAME SELECTION (HERITAGE, VINTAGE, ETC.)</span>
                      </span>
                      <span className="font-mono text-[10px] bg-[#ccff00] text-black px-2 py-0.5 font-black border border-black">
                        {options.frameStyle.toUpperCase()}
                      </span>
                    </div>

                    {/* Frame Styles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FRAME_STYLES.map((frame) => {
                        const isSelected = options.frameStyle === frame.id;
                        return (
                          <button
                            key={frame.id}
                            onClick={() => handleUpdate({ frameStyle: frame.id })}
                            className={`p-2.5 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            <div className="font-black text-xs uppercase flex items-center justify-between">
                              <span>{frame.label}</span>
                              <span className="text-[9px] px-1 font-black bg-zinc-200 text-black">
                                {frame.badge}
                              </span>
                            </div>
                            <div className="text-[10px] opacity-75 mt-0.5 leading-snug">{frame.desc}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Frame Customization Controls */}
                    {options.frameStyle !== 'none' && (
                      <div className="pt-3 border-t border-zinc-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Frame Margin Slider */}
                          <div>
                            <div className="flex justify-between font-mono text-[10px] font-bold text-black mb-1">
                              <span>FRAME MARGIN / BORDER WIDTH</span>
                              <span>{options.frameWidthPercent}%</span>
                            </div>
                            <input
                              type="range"
                              min="3"
                              max="15"
                              step="1"
                              value={options.frameWidthPercent}
                              onChange={(e) => handleUpdate({ frameWidthPercent: parseInt(e.target.value) })}
                              className="w-full accent-black cursor-pointer"
                            />
                          </div>

                          {/* Frame Color Palette */}
                          <div>
                            <span className="block font-mono text-[10px] font-bold text-black mb-1">
                              FRAME COLOR PALETTE:
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              {(
                                [
                                  { id: 'monochrome', label: 'B/W Ink' },
                                  { id: 'heritage-gold', label: 'Heritage Gold' },
                                  { id: 'darkroom-red', label: 'Darkroom' },
                                  { id: 'cyber-lime', label: 'Cyber Lime' },
                                  { id: 'blueprint', label: 'Blueprint' },
                                ] as const
                              ).map((pal) => (
                                <button
                                  key={pal.id}
                                  onClick={() => handleUpdate({ frameColorPalette: pal.id })}
                                  className={`p-1 font-mono text-[9px] font-bold border border-black truncate text-center ${
                                    options.frameColorPalette === pal.id
                                      ? 'bg-black text-[#ccff00]'
                                      : 'bg-white text-black hover:bg-zinc-100'
                                  }`}
                                >
                                  {pal.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Custom Frame Caption */}
                        <div>
                          <label className="block font-mono text-[10px] font-bold text-zinc-700 mb-1">
                            PLAQUE / STAMP / CAPTION TEXT:
                          </label>
                          <input
                            type="text"
                            value={options.frameCaption}
                            onChange={(e) => handleUpdate({ frameCaption: e.target.value })}
                            placeholder="e.g. ARCHIVAL SPECIMEN № 1926"
                            className="w-full p-2 border-2 border-black bg-white font-mono text-xs font-bold"
                          />
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: AM SCREENING ENGINE (DPI, LPI, 45° ANGLE)         */}
              {/* ======================================================== */}
              {activeTab === 'halftone-am' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Halftone Theory Explainer Banner */}
                  <div className="border-2 border-black bg-black text-white p-3 font-mono text-xs space-y-1.5 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center gap-2 text-[#ccff00] font-black uppercase">
                      <Grid3X3 className="w-4 h-4" />
                      <span>PRECISION AM HALFTONE &amp; DITHER SCREENING</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      Continuous shades of gray are converted into tiny black dots and diagonal line patterns modulated by amplitude.
                      To reproduce this effect with precision, align <strong>DPI (600 or 1200)</strong>, <strong>LPI (45–65 for newspaper look)</strong>, and <strong>Screen Angle (45° for eye comfort)</strong>.
                    </p>
                  </div>

                  {/* 1. Core Resolution: Output Printer DPI */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                      <span className="font-mono text-xs font-black uppercase text-black">
                        1. OUTPUT PRINTER RESOLUTION (DPI)
                      </span>
                      <span className="font-mono text-[10px] bg-[#ccff00] text-black px-2 py-0.5 font-black border border-black">
                        {options.dpi} DPI
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-600">
                      Standard office laser printers default to 600 DPI; photo/laser printers operate at 1200 DPI or 2400 DPI.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { dpi: 300, label: '300 DPI', desc: 'Standard Press' },
                        { dpi: 600, label: '600 DPI (Recommended)', desc: 'Office Laser Printer' },
                        { dpi: 1200, label: '1200 DPI (Photo Pro)', desc: 'High-End Photo/Laser' },
                        { dpi: 2400, label: '2400 DPI', desc: 'Commercial Platesetter' },
                      ].map((item) => {
                        const isSelected = options.dpi === item.dpi;
                        return (
                          <button
                            key={item.dpi}
                            onClick={() => handleUpdate({ dpi: item.dpi })}
                            className={`p-2 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            <div className="font-black text-xs">{item.label}</div>
                            <div className="text-[9px] opacity-75 mt-0.5">{item.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Screen Frequency (LPI - Lines Per Inch) */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                      <span className="font-mono text-xs font-black uppercase text-black">
                        2. SCREEN FREQUENCY (LPI - LINES PER INCH)
                      </span>
                      <span className="font-mono text-[10px] bg-black text-[#ccff00] px-2 py-0.5 font-bold">
                        {options.lpi} LPI · CELL: {cellSizePx}px
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUpdate({ lpi: 55 })}
                        className={`p-2 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                          options.lpi === 55 ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]' : 'bg-white hover:bg-zinc-100'
                        }`}
                      >
                        <div className="font-black text-xs">45 – 55 LPI (Recommended)</div>
                        <div className="text-[9px] opacity-80 mt-0.5">Coarse / visible newspaper dot &amp; line look</div>
                      </button>
                      <button
                        onClick={() => handleUpdate({ lpi: 85 })}
                        className={`p-2 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                          options.lpi === 85 ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]' : 'bg-white hover:bg-zinc-100'
                        }`}
                      >
                        <div className="font-black text-xs">85 – 100 LPI</div>
                        <div className="text-[9px] opacity-80 mt-0.5">Standard clean publication print</div>
                      </button>
                      <button
                        onClick={() => handleUpdate({ lpi: 133 })}
                        className={`p-2 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                          options.lpi === 133 ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]' : 'bg-white hover:bg-zinc-100'
                        }`}
                      >
                        <div className="font-black text-xs">133 – 150 LPI</div>
                        <div className="text-[9px] opacity-80 mt-0.5">Fine commercial print (microscopic dots)</div>
                      </button>
                    </div>

                    {/* Fine LPI Slider */}
                    <div className="pt-2">
                      <div className="flex justify-between font-mono text-[10px] font-bold text-black mb-1">
                        <span>CALIBRATE FREQUENCY SLIDER</span>
                        <span>{options.lpi} LPI ({cellSizePx} px cell pitch)</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        step="1"
                        value={options.lpi}
                        onChange={(e) => handleUpdate({ lpi: parseInt(e.target.value) })}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 3. Screen Angle (45° Default) */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                      <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>3. SCREEN ANGLE (DEGREES)</span>
                      </span>
                      <span className="font-mono text-[10px] bg-[#ccff00] text-black px-2 py-0.5 font-black border border-black">
                        {options.screenAngle}°
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-600">
                      The human eye is least sensitive to diagonal lines at 45 degrees, which avoids jarring vertical/horizontal banding.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {SCREEN_ANGLES.map((ang) => (
                        <button
                          key={ang.angle}
                          onClick={() => handleUpdate({ screenAngle: ang.angle })}
                          className={`p-1.5 border border-black font-mono text-center transition-all cursor-pointer ${
                            options.screenAngle === ang.angle
                              ? 'bg-black text-[#ccff00] font-black'
                              : 'bg-white text-black hover:bg-zinc-100'
                          }`}
                        >
                          <div className="text-xs font-bold">{ang.angle}°</div>
                          <div className="text-[8px] opacity-75">{ang.angle === 45 ? 'Optimal' : ang.label.split(' ')[0]}</div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between font-mono text-[10px] font-bold text-black mb-1">
                        <span>CUSTOM ANGLE ROTATION</span>
                        <span>{options.screenAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="5"
                        value={options.screenAngle}
                        onChange={(e) => handleUpdate({ screenAngle: parseInt(e.target.value) })}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 4. Pattern Mode Selector */}
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-black uppercase text-zinc-700 block">
                      SCREENING ALGORITHM &amp; PATTERN TYPE:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TONE_MODES.map((mode) => {
                        const isSelected = options.toneMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => handleUpdate({ toneMode: mode.id })}
                            className={`p-2.5 border-2 border-black text-left font-mono transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            <div className="font-black text-xs uppercase flex items-center justify-between">
                              <span>{mode.label}</span>
                              <span className="text-[9px] px-1 font-black bg-zinc-200 text-black">
                                {mode.badge}
                              </span>
                            </div>
                            <div className="text-[10px] opacity-75 mt-0.5 leading-snug">{mode.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: TONAL & UNSHARP MASK                              */}
              {/* ======================================================== */}
              {activeTab === 'tonal' && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Sliders: Contrast, Brightness, Sharpness */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-4 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                      <span className="font-mono text-xs font-black uppercase text-black">
                        OPTICAL TONAL CALIBRATION
                      </span>
                      <button
                        onClick={() =>
                          handleUpdate({
                            contrast: 1.45,
                            brightness: 1.0,
                            sharpness: 35,
                            invert: false,
                          })
                        }
                        className="border border-black bg-[#ccff00] text-black px-2 py-0.5 font-mono text-[10px] font-black hover:bg-black hover:text-[#ccff00] transition-colors cursor-pointer"
                      >
                        Reset Defaults
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Contrast */}
                      <div>
                        <div className="flex justify-between font-mono text-[11px] font-bold text-black mb-1">
                          <span>B/W CONTRAST</span>
                          <span>{options.contrast.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.05"
                          value={options.contrast}
                          onChange={(e) => handleUpdate({ contrast: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div>
                        <div className="flex justify-between font-mono text-[11px] font-bold text-black mb-1">
                          <span>EXPOSURE</span>
                          <span>{Math.round(options.brightness * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={options.brightness}
                          onChange={(e) => handleUpdate({ brightness: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      {/* Unsharp Mask Sharpness */}
                      <div>
                        <div className="flex justify-between font-mono text-[11px] font-bold text-black mb-1">
                          <span>UNSHARP MASK</span>
                          <span>{options.sharpness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={options.sharpness}
                          onChange={(e) => handleUpdate({ sharpness: parseInt(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
                      <button
                        onClick={() => handleUpdate({ invert: !options.invert })}
                        className={`px-3 py-1 font-mono text-xs font-bold border border-black transition-colors ${
                          options.invert ? 'bg-black text-[#ccff00]' : 'bg-white text-black'
                        }`}
                      >
                        Invert Negative: {options.invert ? 'ON' : 'OFF'}
                      </button>

                      <span className="font-mono text-[11px] text-zinc-600">
                        21:1 Commercial Black &amp; White Standard
                      </span>
                    </div>

                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: HIGH-RES EXPORT                                   */}
              {/* ======================================================== */}
              {activeTab === 'export' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3 shadow-[3px_3px_0px_#000000]">
                    <span className="font-mono text-xs font-black uppercase text-black block">
                      EXPORT PRESS-READY ARTIFACT
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleExportPNG}
                        disabled={isExporting}
                        className="p-4 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-mono text-left shadow-[3px_3px_0px_#000000] active:shadow-none transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-sm uppercase">DOWNLOAD {options.dpi} DPI PNG</span>
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="text-[11px] opacity-80 leading-snug">
                          Embeds physical `pHYs` binary chunk ({Math.round(options.dpi * 39.3701)} ppm). Opened at exact physical dimensions in Photoshop &amp; InDesign.
                        </div>
                      </button>

                      <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="p-4 border-2 border-black bg-white hover:bg-zinc-100 font-mono text-left shadow-[3px_3px_0px_#000000] active:shadow-none transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-sm uppercase">EXPORT SPECIMEN PDF</span>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-[11px] opacity-80 leading-snug">
                          ISO Print Card with corner trim marks, registration targets, 10-step grayscale density strip, and technical metadata.
                        </div>
                      </button>
                    </div>

                    <div className="font-mono text-[11px] text-zinc-600 bg-white p-3 border border-black mt-2">
                      <strong>Physical Specification:</strong> {options.targetWidthInches}&quot; × {options.targetHeightInches}&quot; ({options.aspectRatio}) at {options.dpi} DPI / {options.lpi} LPI @ {options.screenAngle}° produces a canvas of {widthPx} × {heightPx} px ({megapixels} MP) with {options.frameStyle.toUpperCase()} frame.
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`px-3 py-1.5 border-2 border-black font-mono text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] ${
                  showOriginal ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showOriginal ? 'Viewing Original Photo' : 'Compare Original'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPNG}
                  disabled={isExporting}
                  className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-mono text-xs font-black shadow-[2px_2px_0px_#000000] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Generating...' : `Export ${options.dpi} DPI PNG`}</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live High-Resolution Viewport (5 cols) */}
          <div className="lg:col-span-5 bg-[#fafaf8] p-5 sm:p-7 flex flex-col justify-between items-center text-center space-y-5">
            
            {/* Viewport Header */}
            <div className="w-full flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black rotate-45 inline-block" />
                <span className="font-mono text-xs font-black uppercase text-black tracking-wider">
                  LIVE CANVAS SPECIMEN
                </span>
              </div>
              <span className="border border-black bg-[#ccff00] text-black px-2 py-0.5 font-mono text-[10px] font-black">
                {options.aspectRatio} · {options.dpi} DPI · {options.lpi} LPI
              </span>
            </div>

            {/* Canvas Viewport Display */}
            <div className="relative group p-4 border-2 border-black bg-white shadow-[6px_6px_0px_#000000] flex flex-col items-center max-w-full overflow-hidden">
              <div className="absolute top-1 left-1 font-mono text-[9px] text-zinc-400 font-bold">┌ PRINT CROP MARKS</div>
              <div className="absolute bottom-1 right-1 font-mono text-[9px] text-zinc-400 font-bold">PRINT CROP MARKS ┘</div>

              <div className="p-2 transition-transform duration-200 group-hover:scale-[1.01] max-w-full max-h-[420px] overflow-hidden flex items-center justify-center">
                {showOriginal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImageSource}
                    alt="Original"
                    className="max-h-[400px] max-w-full object-contain border border-zinc-300"
                  />
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="max-h-[400px] max-w-full object-contain border border-zinc-300 block"
                  />
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 border border-black bg-[#ccff00] px-2.5 py-0.5 font-mono text-[10px] font-black text-black">
                <Sparkles className="w-3 h-3 text-black" />
                <span>
                  {showOriginal
                    ? 'ORIGINAL COLOR PREVIEW'
                    : `CALIBRATED ${options.dpi} DPI · ${options.lpi} LPI · ${options.screenAngle}° AM SCREEN`}
                </span>
              </div>
            </div>

            {/* Specifications Readout Grid */}
            <div className="w-full grid grid-cols-3 gap-2 font-mono text-center">
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000000]">
                <div className="text-[9px] text-zinc-500 font-bold uppercase">PHYSICAL RATIO</div>
                <div className="text-xs font-black text-black mt-0.5">
                  {options.aspectRatio} ({options.targetWidthInches}&quot;×{options.targetHeightInches}&quot;)
                </div>
              </div>
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000000]">
                <div className="text-[9px] text-zinc-500 font-bold uppercase">SCREEN ANGLE</div>
                <div className="text-xs font-black text-emerald-800 mt-0.5">
                  {options.screenAngle}° (Optimal)
                </div>
              </div>
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000000]">
                <div className="text-[9px] text-zinc-500 font-bold uppercase">RESOLUTION</div>
                <div className="text-xs font-black text-black mt-0.5">
                  {options.dpi} DPI ({megapixels}MP)
                </div>
              </div>
            </div>

            {/* Direct Export Buttons */}
            <div className="w-full space-y-2">
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="w-full py-3 border-2 border-black bg-black text-white hover:bg-[#ccff00] hover:text-black font-mono text-xs font-black tracking-widest uppercase shadow-[4px_4px_0px_#000000] active:shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'PROCESSING...' : `DOWNLOAD ${options.dpi} DPI AM-HALFTONE PNG`}</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-2 border-2 border-black bg-white hover:bg-zinc-100 font-mono text-xs font-bold text-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download ISO Commercial Specimen PDF</span>
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 border-2 border-black bg-[#ccff00] text-black px-4 py-2.5 font-mono text-xs font-black shadow-[4px_4px_0px_#000000] flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-black stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t-2 border-black bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-600">
          <div>
            PHOTO DPI MAKER // AM SCREENING · DPI / LPI ALIGNMENT · VINTAGE CANVAS FRAMES
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-black text-black hover:text-emerald-800 underline">
              genQRstudio (Home)
            </Link>
            <Link href="/nomral-dpi-photo" className="font-black text-black hover:text-emerald-800 underline">
              Photo DPI Maker
            </Link>
          </div>
        </div>
      </footer>

      {/* Universal Quota Exhaustion Modal */}
      <QuotaLimitModal />

    </div>
  );
}
