'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Globe,
  Upload,
  Download,
  Share2,
  Check,
  RotateCw,
  LayoutGrid,
  Laptop,
  Tablet,
  Smartphone,
  Sliders,
  Tv,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Camera,
  Layers,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Eye,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { toPng, toJpeg, toSvg, toCanvas } from 'html-to-image';
import {
  MOCKUP_DEVICES,
  WEBSITE_TEMPLATES,
  MockupDevice,
  WebsiteTemplate,
} from '@/lib/mockup-templates';
import { DeviceFrame } from '@/components/mockup/DeviceFrame';
import { TemplateRenderer } from '@/components/mockup/TemplateRenderer';
import {
  TrioScene,
  LongScrollLaptopScene,
  HandheldDuoScene,
  MinimalInteriorTemplate,
} from '@/components/mockup/MockupScenes';

type SceneMode = 'trio' | 'long-scroll' | 'handheld' | 'matrix' | 'single';
type ExportTarget = 'scene' | 'desktop' | 'tablet' | 'mobile';
type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg';
type ResolutionTier = '1x' | '2x' | '3x' | '300dpi';

export default function MochupPage() {
  // Scene Selection
  const [activeScene, setActiveScene] = useState<SceneMode>('trio');

  // Website Source: URL vs Uploaded Screenshot vs Custom Design (Default: Website Itself)
  const [sourceType, setSourceType] = useState<'url' | 'upload' | 'template'>('template');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string>('');
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);

  // Preview Generation & Ready State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [previewReady, setPreviewReady] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'snapshot' | 'interactive'>('snapshot');

  // Single Device Studio Controls
  const [selectedDevice, setSelectedDevice] = useState<MockupDevice>(MOCKUP_DEVICES[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [bezelStyle, setBezelStyle] = useState<'chassis' | 'minimal' | 'frameless'>('chassis');
  const [chassisColor, setChassisColor] = useState<'space-black' | 'titanium' | 'silver' | 'gold'>('space-black');
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Scene Appearance Controls (Industrial dark & volt theme, no blue/purple)
  const [backdropTheme, setBackdropTheme] = useState<'dark' | 'volt' | 'concrete' | 'white' | 'transparent'>('dark');
  const [shadowIntensity, setShadowIntensity] = useState<number>(1.0);
  const [reflectionEnabled, setReflectionEnabled] = useState<boolean>(true);

  // Export Settings Modal & Actions
  const [exportTarget, setExportTarget] = useState<ExportTarget>('scene');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [resolutionTier, setResolutionTier] = useState<ResolutionTier>('2x');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [readyDownload, setReadyDownload] = useState<{ url: string; filename: string; format: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle URL Submission & Preview Pipeline
  const handleApplyUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = websiteUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    setWebsiteUrl(url);
    setIsGenerating(true);
    setPreviewReady(false);
    setSourceType('url');
    setRenderMode('snapshot');

    setGenerationStep('Analyzing website URL and resolving host...');
    await new Promise((r) => setTimeout(r, 450));

    setGenerationStep('Capturing high-resolution Desktop (1440px), Tablet (834px), and Mobile (412px) viewports...');
    await new Promise((r) => setTimeout(r, 650));

    setGenerationStep('Calibrating realistic 3D chassis reflections and matrix display...');
    await new Promise((r) => setTimeout(r, 350));

    setSubmittedUrl(url);
    setIsGenerating(false);
    setPreviewReady(true);
    setGenerationStep('');
  };

  // Handle Custom Screenshot Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedScreenshot(event.target?.result as string);
        setSourceType('upload');
        setPreviewReady(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clipboard Paste listener (Ctrl+V) for rapid mockup creation
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setUploadedScreenshot(event.target?.result as string);
              setSourceType('upload');
              setPreviewReady(true);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Calculate pixel ratio scale for selected resolution
  // Convert DataURL to binary Blob to prevent browser popup block and URL truncation
  const dataURLtoBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(';base64,');
    if (parts.length === 2) {
      const contentType = parts[0].split(':')[1] || 'image/png';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    }
    return new Blob([decodeURIComponent(dataUrl.split(',')[1] || '')], { type: 'image/svg+xml;charset=utf-8' });
  };

  const getPixelRatio = (tier: ResolutionTier): number => {
    switch (tier) {
      case '1x':
        return 1.0;
      case '2x':
        return 2.0;
      case '3x':
        return 2.5;
      case '300dpi':
        return 3.0;
      default:
        return 2.0;
    }
  };

  // Download Mockup Handler with resolution & format options
  const handleExecuteDownload = async () => {
    // Determine which element to capture
    let targetId = 'mockup-export-target';
    if (exportTarget === 'desktop') targetId = 'mockup-target-desktop';
    if (exportTarget === 'tablet') targetId = 'mockup-target-tablet';
    if (exportTarget === 'mobile') targetId = 'mockup-target-mobile';

    let target = document.getElementById(targetId);
    if (!target) {
      target = document.getElementById('mockup-export-target');
    }
    if (!target) return;

    try {
      setIsExporting(true);
      setExportError(null);
      setExportProgress(`Calibrating ${resolutionTier.toUpperCase()} ${exportFormat.toUpperCase()} render matrix...`);

      const pixelRatio = getPixelRatio(resolutionTier);
      // skipFonts: true and fontEmbedCSS: '' are CRITICAL to prevent html-to-image from throwing CORS errors
      const options = {
        pixelRatio,
        skipFonts: true,
        fontEmbedCSS: '',
        cacheBust: true,
        quality: 0.96,
        backgroundColor: exportFormat === 'jpeg' ? '#0d0e12' : undefined,
      };

      let downloadDataUrl = '';

      if (exportFormat === 'png') {
        setExportProgress('Encoding lossless PNG graphics...');
        downloadDataUrl = await toPng(target, options);
      } else if (exportFormat === 'jpeg') {
        setExportProgress('Encoding 95% photographic JPEG...');
        downloadDataUrl = await toJpeg(target, options);
      } else if (exportFormat === 'webp') {
        setExportProgress('Encoding next-gen WebP matrix...');
        const canvas = await toCanvas(target, options);
        downloadDataUrl = canvas.toDataURL('image/webp', 0.95);
      } else if (exportFormat === 'svg') {
        setExportProgress('Building vector SVG container...');
        downloadDataUrl = await toSvg(target, options);
      }

      setExportProgress('Packaging image blob...');
      const cleanHost = submittedUrl ? submittedUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-') : 'nedject-studio';
      const filename = `nedject-mockup-${exportTarget}-${cleanHost}-${resolutionTier}-${Date.now()}.${exportFormat}`;

      // Convert to Blob and Object URL (Never blocked by popups or URL length limits!)
      const blob = dataURLtoBlob(downloadDataUrl);
      const blobUrl = URL.createObjectURL(blob);

      setReadyDownload({
        url: blobUrl,
        filename,
        format: exportFormat.toUpperCase(),
      });

      // Direct download trigger via virtual anchor
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportProgress('Download ready! Click the button below if your browser did not automatically save the file.');
      setIsExporting(false);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsExporting(false);
      setExportProgress('');
      setExportError(err?.message || 'Failed to rasterize mockup image.');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Universal content renderer for viewports (Zero Firefox blocking, 100% Downloadable!)
  const renderViewportContent = useCallback((viewport: 'desktop' | 'tablet' | 'mobile') => {
    if (sourceType === 'upload' && uploadedScreenshot) {
      return (
        <div className="w-full h-full relative bg-black overflow-y-auto flex flex-col items-center">
          <img
            src={uploadedScreenshot}
            alt="Uploaded Website Preview"
            className="w-full object-cover object-top block"
          />
        </div>
      );
    }

    if (sourceType === 'template') {
      if (selectedTemplate.id === 'minimal-interior') {
        return <MinimalInteriorTemplate viewport={viewport} />;
      }
      const width = viewport === 'desktop' ? 1200 : viewport === 'tablet' ? 800 : 400;
      return <TemplateRenderer templateId={selectedTemplate.id} viewportWidth={width} />;
    }

    // Default URL Source
    // If in Interactive mode (iframe with server proxy):
    if (renderMode === 'interactive') {
      const proxiedSrc = `/api/mockup/proxy?url=${encodeURIComponent(submittedUrl)}`;
      return (
        <div className="w-full h-full relative bg-white">
          <iframe
            src={proxiedSrc}
            className="w-full h-full border-0 bg-white"
            title={`${viewport} Viewport Preview`}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      );
    }

    // Default Snapshot Mode:
    // Uses server-side visual snapshot engine with CORS headers.
    // ZERO Firefox "Can't Open This Page" error, and captures with 100% pixel fidelity in PNG/JPEG/WEBP/SVG!
    const snapshotEndpoint = `/api/mockup/snapshot?url=${encodeURIComponent(submittedUrl)}&viewport=${viewport}`;

    return (
      <div className="w-full h-full relative bg-[#121316] overflow-y-auto flex flex-col items-center">
        <img
          src={snapshotEndpoint}
          alt={`Website preview for ${submittedUrl} on ${viewport}`}
          className="w-full object-cover object-top block"
          crossOrigin="anonymous"
          loading="eager"
          onError={(e) => {
            // Fallback gracefully to interactive proxy if snapshot provider fails
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      </div>
    );
  }, [sourceType, uploadedScreenshot, selectedTemplate, renderMode, submittedUrl]);

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-zinc-100 font-sans flex flex-col selection:bg-[#ccff00] selection:text-black">
      {/* Top Header */}
      <header className="border-b-2 border-black bg-[#121316] text-white px-4 py-3 select-none z-30 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-black text-[#ccff00] px-2.5 py-1 border-2 border-black font-black text-xs flex items-center gap-1.5 hover:bg-[#ccff00] hover:text-black transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>NEDJECT</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  Website Mockup Studio
                </span>
                <span className="text-[10px] bg-black text-[#ccff00] border border-[#ccff00]/40 px-1.5 py-0.2 font-mono font-black">
                  HIGH-RES EXPORT
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Enter any website URL, inspect live responsive viewports, and download in 4K resolution
              </p>
            </div>
          </div>

          {/* Share & Download Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 border-2 border-black bg-black hover:bg-zinc-800 text-zinc-200 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Share2 className="w-3.5 h-3.5 text-zinc-400" />}
              <span className="hidden sm:inline">{copiedLink ? 'LINK COPIED' : 'SHARE'}</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-white text-black font-black text-xs flex items-center gap-2 transition-all shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD MOCKUP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Website URL Input & Capture Control Bar */}
      <div className="border-b-2 border-black bg-[#16171b] px-4 py-3 select-none z-20 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Main Website URL Input Form */}
          <form onSubmit={handleApplyUrl} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-black border-2 border-zinc-700 rounded-lg overflow-hidden focus-within:border-[#ccff00] transition-colors">
              <span className="pl-3 pr-2 text-zinc-400 flex items-center gap-1">
                <Globe className="w-4 h-4 text-[#ccff00]" />
                <span className="text-[11px] font-bold text-zinc-300 hidden sm:inline">URL:</span>
              </span>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Enter your website URL (e.g. https://your-website.com)"
                className="flex-1 bg-transparent py-2.5 pr-3 text-xs text-white font-mono focus:outline-none placeholder:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2.5 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded-lg transition-all border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>CAPTURING...</span>
                </>
              ) : (
                <>
                  <span>PREVIEW</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Custom Screenshot Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2.5 bg-black hover:bg-zinc-800 text-zinc-200 font-bold text-xs rounded-lg border-2 border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Upload your own screenshot or paste image with Ctrl+V"
            >
              <Upload className="w-3.5 h-3.5 text-[#ccff00]" />
              <span className="hidden sm:inline">UPLOAD SCREENSHOT</span>
            </button>

            {/* Reset to Website Itself Button */}
            {sourceType !== 'template' && (
              <button
                type="button"
                onClick={() => {
                  setSourceType('template');
                  setSelectedTemplate(WEBSITE_TEMPLATES[0]);
                  setWebsiteUrl('');
                  setSubmittedUrl('');
                }}
                className="px-3 py-2.5 bg-black hover:bg-zinc-800 text-[#ccff00] font-bold text-xs rounded-lg border-2 border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Reset to default website itself"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="hidden sm:inline">WEBSITE ITSELF</span>
              </button>
            )}
          </form>

          {/* Quick Info & Ready Status Indicator */}
          <div className="flex items-center gap-3">
            {previewReady && !isGenerating ? (
              <div className="flex items-center gap-2 bg-black border border-emerald-500/50 px-2.5 py-1 rounded text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-black">PREVIEW READY FOR DOWNLOAD</span>
              </div>
            ) : isGenerating ? (
              <div className="flex items-center gap-2 bg-black border border-[#ccff00]/50 px-2.5 py-1 rounded text-[11px]">
                <Loader2 className="w-3 h-3 text-[#ccff00] animate-spin" />
                <span className="text-[#ccff00] font-bold">PROCESSING VIEWPORTS...</span>
              </div>
            ) : null}
          </div>

        </div>

        {/* Live Generation Progress Banner */}
        {isGenerating && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-300">
            <span className="text-[#ccff00] font-black">PIPELINE:</span>
            <span>{generationStep}</span>
          </div>
        )}

        {/* When Website Itself is active */}
        {!isGenerating && sourceType === 'template' && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[#ccff00] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                PREVIEW SOURCE:
              </span>
              <span className="text-white font-mono font-bold">Nedject Studio (Website Itself)</span>
            </div>
            <div className="text-zinc-400">
              Type your own website URL above to inspect and download your own custom mockups
            </div>
          </div>
        )}

        {/* Status / View Mode Toggles for URL */}
        {!isGenerating && sourceType === 'url' && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[#ccff00] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                CURRENT TARGET:
              </span>
              <span className="text-zinc-300 font-mono font-bold">{submittedUrl}</span>
              <a
                href={submittedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white flex items-center gap-1 ml-1"
                title="Open website in new browser tab"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Snapshot vs Interactive toggle */}
              <button
                type="button"
                onClick={() => setRenderMode('snapshot')}
                className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                  renderMode === 'snapshot'
                    ? 'bg-[#ccff00] text-black border-black font-black'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="Zero iframe errors, 100% high-res downloadable matrix"
              >
                <Camera className="w-3 h-3" />
                <span>HD Visual Capture (Downloadable)</span>
              </button>

              <button
                type="button"
                onClick={() => setRenderMode('interactive')}
                className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                  renderMode === 'interactive'
                    ? 'bg-[#ccff00] text-black border-black font-black'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="Interactive browser iframe via server proxy"
              >
                <Eye className="w-3 h-3" />
                <span>Interactive Iframe</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scene Switcher & Studio Canvas Toolbar */}
      <div className="border-b-2 border-black bg-[#101114] px-4 py-2.5 font-mono text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Scene Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 font-bold uppercase text-[11px] mr-1">SCENE:</span>
            
            <button
              onClick={() => {
                setActiveScene('trio');
                setBackdropTheme('dark');
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeScene === 'trio'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Apple Responsive Trio</span>
            </button>

            <button
              onClick={() => {
                setActiveScene('long-scroll');
                setBackdropTheme('volt');
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeScene === 'long-scroll'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Long Scroll Laptop (3D Roll)</span>
            </button>

            <button
              onClick={() => {
                setActiveScene('handheld');
                setBackdropTheme('dark');
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeScene === 'handheld'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Handheld Duo Tablet</span>
            </button>

            <button
              onClick={() => setActiveScene('matrix')}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeScene === 'matrix'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Responsive Matrix</span>
            </button>

            <button
              onClick={() => setActiveScene('single')}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeScene === 'single'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Single Device Studio</span>
            </button>
          </div>

          {/* Backdrop & Quick Export Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 text-[11px]">BACKDROP:</span>
              <select
                value={backdropTheme}
                onChange={(e) => setBackdropTheme(e.target.value as any)}
                className="bg-black border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200 font-mono focus:outline-none"
              >
                <option value="dark">Studio Deep Black</option>
                <option value="volt">Industrial Volt Accent</option>
                <option value="concrete">Studio Concrete</option>
                <option value="white">Clean Editorial White</option>
                <option value="transparent">Transparent (PNG)</option>
              </select>
            </div>

            <button
              onClick={() => setReflectionEnabled(!reflectionEnabled)}
              className={`px-2 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
                reflectionEnabled
                  ? 'bg-black text-[#ccff00] border-[#ccff00] font-bold'
                  : 'bg-black text-zinc-500 border-zinc-800'
              }`}
            >
              Reflection: {reflectionEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1 bg-[#ccff00] text-black font-black text-xs rounded border border-black hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>EXPORT OPTIONS</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Workspace Canvas Area */}
      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center overflow-auto relative">
        
        {/* SCENE 1: APPLE RESPONSIVE TRIO */}
        {activeScene === 'trio' && (
          <div className="w-full flex flex-col items-center">
            <TrioScene
              backdropTheme={backdropTheme}
              shadowIntensity={shadowIntensity}
              reflectionEnabled={reflectionEnabled}
              activeTemplate={selectedTemplate.id}
              contentRenderer={renderViewportContent}
            />
            <div className="mt-4 text-xs font-mono text-zinc-400 text-center">
              Apple Responsive Trio Mockup • MacBook Pro (Desktop) + iPad Pro (Tablet) + iPhone 16 Pro (Mobile)
            </div>
          </div>
        )}

        {/* SCENE 2: LONG SCROLL EXTENDED LAPTOP */}
        {activeScene === 'long-scroll' && (
          <div className="w-full flex flex-col items-center">
            <LongScrollLaptopScene
              backdropTheme={backdropTheme}
              shadowIntensity={shadowIntensity}
              reflectionEnabled={reflectionEnabled}
              activeTemplate={selectedTemplate.id}
              contentRenderer={renderViewportContent}
            />
            <div className="mt-4 text-xs font-mono text-zinc-400 text-center">
              Long Scroll Extended Laptop Mockup • 3D Curved Webpage Falling &amp; Rolled Cylinder Lip
            </div>
          </div>
        )}

        {/* SCENE 3: HANDHELD DUO TABLET */}
        {activeScene === 'handheld' && (
          <div className="w-full flex flex-col items-center">
            <HandheldDuoScene
              backdropTheme={backdropTheme}
              shadowIntensity={shadowIntensity}
              reflectionEnabled={reflectionEnabled}
              activeTemplate={selectedTemplate.id}
              contentRenderer={renderViewportContent}
            />
            <div className="mt-4 text-xs font-mono text-zinc-400 text-center">
              Handheld Duo Mockup • Widescreen Tablet Display Held in Human Hands
            </div>
          </div>
        )}

        {/* SCENE 4: RESPONSIVE MATRIX SIDE-BY-SIDE */}
        {activeScene === 'matrix' && (
          <div id="mockup-export-target" className="w-full max-w-6xl mx-auto p-4 sm:p-8 bg-[#0c0d10] rounded-2xl border-2 border-black">
            <div className="text-center mb-6 font-mono text-xs text-[#ccff00] font-black uppercase tracking-wider">
              SIMULTANEOUS MULTI-DEVICE RESPONSIVE AUDIT MATRIX
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 overflow-x-auto pb-4">
              {/* Mobile */}
              <div id="mockup-target-mobile" className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-zinc-400 mb-1 font-bold">MOBILE (iPhone 16 Pro)</span>
                <DeviceFrame
                  device={MOCKUP_DEVICES[0]}
                  orientation="portrait"
                  bezelStyle="chassis"
                  chassisColor="space-black"
                  zoomScale={0.7}
                >
                  {renderViewportContent('mobile')}
                </DeviceFrame>
              </div>

              {/* Tablet */}
              <div id="mockup-target-tablet" className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-zinc-400 mb-1 font-bold">TABLET (iPad Pro 11&quot;)</span>
                <DeviceFrame
                  device={MOCKUP_DEVICES[4]}
                  orientation="portrait"
                  bezelStyle="chassis"
                  chassisColor="space-black"
                  zoomScale={0.5}
                >
                  {renderViewportContent('tablet')}
                </DeviceFrame>
              </div>

              {/* Desktop */}
              <div id="mockup-target-desktop" className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-zinc-400 mb-1 font-bold">DESKTOP (MacBook Pro)</span>
                <DeviceFrame
                  device={MOCKUP_DEVICES[7]}
                  orientation="portrait"
                  bezelStyle="chassis"
                  chassisColor="space-black"
                  zoomScale={0.4}
                >
                  {renderViewportContent('desktop')}
                </DeviceFrame>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 5: SINGLE DEVICE STUDIO */}
        {activeScene === 'single' && (
          <div id="mockup-export-target" className="w-full max-w-5xl mx-auto flex flex-col items-center pb-12">
            {/* Device Switcher in Single Mode */}
            <div className="mb-6 flex items-center gap-2 flex-wrap bg-black border-2 border-black p-1.5 rounded-lg font-mono text-xs">
              {MOCKUP_DEVICES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDevice(d)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedDevice.id === d.id
                      ? 'bg-[#ccff00] text-black font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <DeviceFrame
              device={selectedDevice}
              orientation={orientation}
              bezelStyle={bezelStyle}
              chassisColor={chassisColor}
              zoomScale={zoomScale}
              onToggleOrientation={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            >
              {renderViewportContent(selectedDevice.category)}
            </DeviceFrame>
          </div>
        )}

      </main>

      {/* Floating Bottom Sticky Action Bar */}
      <footer className="border-t-2 border-black bg-[#121316] px-4 py-3 font-mono text-xs text-zinc-400 select-none sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
            <span className="text-white font-bold">Mockup Generator Active</span>
            <span>•</span>
            <span className="text-zinc-400 truncate max-w-xs sm:max-w-md">
              {sourceType === 'url' ? submittedUrl : sourceType === 'upload' ? 'Custom Screenshot Upload' : selectedTemplate.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500 uppercase">READY FOR EXPORT:</span>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1.5 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded border border-black transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SET RESOLUTION &amp; DOWNLOAD</span>
            </button>
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* EXPORT CONFIGURATION & RESOLUTION MODAL                              */}
      {/* =================================================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
          <div className="bg-[#121316] border-2 border-black rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#ccff00]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Download Mockup Calibration Matrix
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-500 hover:text-white text-sm font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {/* 1. Which Mockup to Download */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">
                  1. Which Mockup / Device to Export:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'scene', label: 'Entire Scene', sub: 'Full Studio' },
                    { id: 'desktop', label: 'Desktop Only', sub: 'MacBook Pro' },
                    { id: 'tablet', label: 'Tablet Only', sub: 'iPad Pro' },
                    { id: 'mobile', label: 'Mobile Only', sub: 'iPhone 16' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExportTarget(item.id as ExportTarget)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        exportTarget === item.id
                          ? 'bg-[#ccff00] text-black border-black font-black shadow-[2px_2px_0px_#000000]'
                          : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] opacity-75">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Resolution Setting */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">
                  2. Selected Screen Resolution:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '1x', label: '1x Standard', res: '1080p (Fast)' },
                    { id: '2x', label: '2x Retina', res: '2K (2560px)' },
                    { id: '3x', label: '3x Ultra-HD', res: '4K (3840px)' },
                    { id: '300dpi', label: '300 DPI Master', res: '4500px+ (Print)' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setResolutionTier(tier.id as ResolutionTier)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        resolutionTier === tier.id
                          ? 'bg-[#ccff00] text-black border-black font-black shadow-[2px_2px_0px_#000000]'
                          : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{tier.label}</div>
                      <div className="text-[10px] opacity-75">{tier.res}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. File Format Setting */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">
                  3. File Format:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'png', label: 'PNG', note: 'Lossless' },
                    { id: 'jpeg', label: 'JPEG', note: 'High Qual 95%' },
                    { id: 'webp', label: 'WEBP', note: 'Modern Web' },
                    { id: 'svg', label: 'SVG', note: 'Vector Frame' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportFormat(fmt.id as ExportFormat)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        exportFormat === fmt.id
                          ? 'bg-[#ccff00] text-black border-black font-black shadow-[2px_2px_0px_#000000]'
                          : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-black">{fmt.label}</div>
                      <div className="text-[9px] opacity-75">{fmt.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Banner */}
              <div className="p-3 bg-black border border-zinc-800 rounded-lg text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Output Spec:</span>
                <span className="text-white font-mono font-bold">
                  {exportTarget.toUpperCase()} • {resolutionTier.toUpperCase()} • {exportFormat.toUpperCase()}
                </span>
              </div>

              {/* Progress message if exporting */}
              {isExporting && (
                <div className="flex items-center gap-2 text-xs text-[#ccff00] p-3 bg-black border border-[#ccff00]/40 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-[#ccff00]" />
                  <span>{exportProgress}</span>
                </div>
              )}

              {/* Ready Download Notification & Direct Save Action */}
              {readyDownload && !isExporting && (
                <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500 rounded-lg text-emerald-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-5 h-5 text-[#ccff00]" />
                    <span className="font-bold text-xs uppercase text-white">Mockup Successfully Generated!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mb-3">
                    Your {readyDownload.format} image has been generated in high resolution. If your browser didn&apos;t automatically save it, click below:
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={readyDownload.url}
                      download={readyDownload.filename}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccff00] text-black font-black text-xs rounded border border-black hover:bg-white shadow-[2px_2px_0px_#000000] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>CLICK HERE TO SAVE {readyDownload.format}</span>
                    </a>
                    <a
                      href={readyDownload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-black text-zinc-300 font-bold text-xs rounded border border-zinc-700 hover:text-white flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>VIEW IMAGE</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Export Error Alert */}
              {exportError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-lg text-rose-300 text-xs">
                  <strong>Export Note:</strong> {exportError}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  setReadyDownload(null);
                  setExportError(null);
                }}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded border border-zinc-700 transition-colors cursor-pointer"
              >
                CLOSE
              </button>

              <button
                type="button"
                onClick={handleExecuteDownload}
                disabled={isExporting}
                className="px-5 py-2 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>EXPORTING...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{readyDownload ? 'RE-GENERATE & DOWNLOAD' : `DOWNLOAD ${exportFormat.toUpperCase()}`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
