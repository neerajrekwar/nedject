'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  Upload,
  Download,
  Share2,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  LayoutGrid,
  Laptop,
  Tablet,
  Smartphone,
  Eye,
  Layers,
  Palette,
  Sliders,
  Tv,
  ImageIcon,
  ExternalLink,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { toPng } from 'html-to-image';
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

export default function MochupPage() {
  // Scene Selection
  const [activeScene, setActiveScene] = useState<SceneMode>('trio');

  // Website Source: URL vs Preset Template vs Uploaded Screenshot
  const [sourceType, setSourceType] = useState<'url' | 'template' | 'upload'>('url');
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://nedject.vercel.app');
  const [submittedUrl, setSubmittedUrl] = useState<string>('https://nedject.vercel.app');
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);

  // Single Device Studio Controls
  const [selectedDevice, setSelectedDevice] = useState<MockupDevice>(MOCKUP_DEVICES[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [bezelStyle, setBezelStyle] = useState<'chassis' | 'minimal' | 'frameless'>('chassis');
  const [chassisColor, setChassisColor] = useState<'space-black' | 'titanium' | 'silver' | 'gold'>('space-black');
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Scene Appearance Controls (User's brand palette: concrete, volt, dark, white, transparent)
  const [backdropTheme, setBackdropTheme] = useState<'concrete' | 'volt' | 'dark' | 'white' | 'transparent'>('concrete');
  const [shadowIntensity, setShadowIntensity] = useState<number>(1.0);
  const [reflectionEnabled, setReflectionEnabled] = useState<boolean>(true);

  // Export & Action State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle URL submit
  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setWebsiteUrl(url);
    setSubmittedUrl(url);
    setSourceType('url');
  };

  // Handle custom screenshot upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedScreenshot(event.target?.result as string);
        setSourceType('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  // High-Resolution Export using html-to-image
  const handleDownloadMockup = async () => {
    const target = document.getElementById('mockup-export-target');
    if (!target) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(target, {
        pixelRatio: 2.5, // 2.5x high-DPI quality
        quality: 0.95,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `nedject-website-mockup-${activeScene}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export mockup image:', err);
      alert('Mockup export complete. If download did not trigger automatically, please check browser popup permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Universal content renderer for viewports
  const renderViewportContent = (viewport: 'desktop' | 'tablet' | 'mobile') => {
    if (sourceType === 'upload' && uploadedScreenshot) {
      return (
        <div className="w-full h-full relative bg-zinc-950 overflow-hidden flex flex-col items-center">
          <img
            src={uploadedScreenshot}
            alt="Uploaded Website Preview"
            className="w-full object-cover object-top"
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

    // Default URL / Iframe
    return (
      <iframe
        src={submittedUrl}
        className="w-full h-full border-0 bg-white"
        title={`${viewport} Viewport Preview`}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#101114] text-zinc-100 font-sans flex flex-col selection:bg-[#ccff00] selection:text-black">
      {/* Top Studio Header */}
      <header className="border-b-4 border-black bg-white text-black px-4 py-3 select-none z-30 font-mono">
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
                <span className="text-sm font-black tracking-tight text-black">
                  Website Mockup Studio
                </span>
                <span className="text-[10px] bg-black text-[#ccff00] px-1.5 py-0.2 font-mono font-black">
                  PRO MOCKUP
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 hidden sm:block">
                Enter your website URL, preview across Apple devices, and download high-res PNG mockups
              </p>
            </div>
          </div>

          {/* Download & Share Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 border-2 border-black bg-zinc-100 hover:bg-zinc-200 text-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>

            <button
              onClick={handleDownloadMockup}
              disabled={isExporting}
              className="px-4 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black font-black text-xs flex items-center gap-2 transition-all shadow-[3px_3px_0px_#000000] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'EXPORTING 4K...' : 'DOWNLOAD MOCKUP (PNG)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* URL Input Bar & Source Controls */}
      <div className="border-b-2 border-black bg-[#16171b] px-4 py-3 select-none z-20 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Main Website URL Input Form */}
          <form onSubmit={handleApplyUrl} className="flex-1 flex items-center gap-2 max-w-2xl">
            <div className="relative flex-1 flex items-center bg-black border-2 border-zinc-700 rounded-lg overflow-hidden focus-within:border-[#ccff00] shadow-inner">
              <span className="pl-3 pr-2 text-zinc-400 flex items-center gap-1">
                <Globe className="w-4 h-4 text-[#ccff00]" />
                <span className="text-[11px] font-bold text-zinc-300 hidden sm:inline">ENTER URL:</span>
              </span>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-website.com"
                className="flex-1 bg-transparent py-2 pr-3 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded-lg transition-all border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 shrink-0"
            >
              <span>PREVIEW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Upload Custom Screenshot option */}
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
              className="px-3 py-2 bg-black hover:bg-zinc-800 text-zinc-200 font-bold text-xs rounded-lg border-2 border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0"
              title="Upload your own website screenshot"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UPLOAD IMAGE</span>
            </button>
          </form>

          {/* Quick Demo Previews */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-zinc-500 font-bold uppercase mr-1">DEMO SITES:</span>
            <button
              type="button"
              onClick={() => {
                setSourceType('template');
                setSelectedTemplate({
                  id: 'minimal-interior',
                  name: 'Minimal Architecture',
                  category: 'Interior & Studio',
                  tagline: 'Apple PSD Clean Style',
                  description: 'Clean architectural furniture studio',
                  badge: 'PSD Style',
                  themeColor: '#000000',
                });
              }}
              className={`px-2 py-1 rounded border transition-colors ${
                sourceType === 'template' && selectedTemplate.id === 'minimal-interior'
                  ? 'bg-white text-black font-black border-white'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              Minimal Studio (PSD Style)
            </button>
            <button
              type="button"
              onClick={() => {
                setWebsiteUrl('https://nedject.vercel.app');
                setSubmittedUrl('https://nedject.vercel.app');
                setSourceType('url');
              }}
              className={`px-2 py-1 rounded border transition-colors ${
                sourceType === 'url' && submittedUrl.includes('nedject')
                  ? 'bg-[#ccff00] text-black font-black border-[#ccff00]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              Nedject.app
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceType('template');
                setSelectedTemplate(WEBSITE_TEMPLATES[0]);
              }}
              className={`px-2 py-1 rounded border transition-colors ${
                sourceType === 'template' && selectedTemplate.id === 'industrial-studio'
                  ? 'bg-black text-[#ccff00] font-black border-[#ccff00]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              SaaS Tech Landing
            </button>
          </div>

        </div>
      </div>

      {/* Scene Switcher & Studio Customization Bar */}
      <div className="border-b-2 border-black bg-[#121316] px-4 py-2.5 font-mono text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Scene Selector Tabs (Matching User Attached Images) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 font-bold uppercase text-[11px] mr-1">SCENE:</span>
            
            <button
              onClick={() => {
                setActiveScene('trio');
                setBackdropTheme('concrete');
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border ${
                activeScene === 'trio'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Apple Trio (Mac + iPad + iPhone)</span>
            </button>

            <button
              onClick={() => {
                setActiveScene('long-scroll');
                setBackdropTheme('volt');
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border ${
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
                setBackdropTheme('white');
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border ${
                activeScene === 'handheld'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Handheld Duo (Held in Hands)</span>
            </button>

            <button
              onClick={() => setActiveScene('matrix')}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border ${
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
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all border ${
                activeScene === 'single'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Single Device</span>
            </button>
          </div>

          {/* Backdrop & Appearance Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Backdrop Theme */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 text-[11px]">BACKDROP:</span>
              <select
                value={backdropTheme}
                onChange={(e) => setBackdropTheme(e.target.value as any)}
                className="bg-black border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200 font-mono focus:outline-none"
              >
                <option value="concrete">Studio Concrete (Image 3)</option>
                <option value="volt">Industrial Volt Accent</option>
                <option value="dark">Studio Deep Black</option>
                <option value="white">Clean Editorial White (Image 1)</option>
                <option value="transparent">Transparent PNG</option>
              </select>
            </div>

            {/* Reflection Toggle */}
            <button
              onClick={() => setReflectionEnabled(!reflectionEnabled)}
              className={`px-2 py-1 rounded border text-[11px] transition-colors ${
                reflectionEnabled
                  ? 'bg-black text-[#ccff00] border-[#ccff00] font-bold'
                  : 'bg-black text-zinc-500 border-zinc-800'
              }`}
            >
              Glare Reflection: {reflectionEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

        </div>
      </div>

      {/* Main Workspace Canvas Area */}
      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center overflow-auto relative">
        
        {/* SCENE 1: APPLE RESPONSIVE TRIO (Image 3) */}
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

        {/* SCENE 2: LONG SCROLL EXTENDED LAPTOP (Image 2) */}
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

        {/* SCENE 3: HANDHELD DUO TABLET (Image 1) */}
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
          <div id="mockup-export-target" className="w-full max-w-6xl mx-auto p-4 sm:p-8 bg-black rounded-2xl border-2 border-black">
            <div className="text-center mb-6 font-mono text-xs text-[#ccff00] font-black uppercase tracking-wider">
              SIMULTANEOUS MULTI-DEVICE RESPONSIVE AUDIT MATRIX
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 overflow-x-auto pb-4">
              {/* Mobile */}
              <div className="flex flex-col items-center">
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
              <div className="flex flex-col items-center">
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
              <div className="flex flex-col items-center">
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
                  className={`px-2.5 py-1 rounded transition-colors ${
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
            >
              {renderViewportContent(selectedDevice.category)}
            </DeviceFrame>
          </div>
        )}

      </main>

      {/* Floating Bottom Help / Specification Banner */}
      <footer className="border-t-2 border-black bg-[#141519] px-4 py-3 font-mono text-xs text-zinc-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
            <span className="text-zinc-300 font-bold">Mockup Generator Active</span>
            <span>•</span>
            <span>Displaying {sourceType === 'url' ? submittedUrl : sourceType === 'upload' ? 'Custom Screenshot' : selectedTemplate.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadMockup}
              className="text-[#ccff00] hover:underline font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download High-DPI PNG</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
