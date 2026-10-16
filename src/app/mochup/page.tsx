'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  Check,
  ChevronDown,
  LayoutGrid,
  Square,
  Globe,
  Palette,
  Eye,
  Sliders,
  Tv,
} from 'lucide-react';
import {
  MOCKUP_DEVICES,
  WEBSITE_TEMPLATES,
  MockupDevice,
  WebsiteTemplate,
} from '@/lib/mockup-templates';
import { DeviceFrame } from '@/components/mockup/DeviceFrame';
import { TemplateRenderer } from '@/components/mockup/TemplateRenderer';

export default function MochupPage() {
  // Device & Display State
  const [selectedDevice, setSelectedDevice] = useState<MockupDevice>(MOCKUP_DEVICES[0]);
  const [deviceCategoryFilter, setDeviceCategoryFilter] = useState<'all' | 'mobile' | 'tablet' | 'desktop'>('all');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [bezelStyle, setBezelStyle] = useState<'chassis' | 'minimal' | 'frameless'>('chassis');
  const [chassisColor, setChassisColor] = useState<'space-black' | 'titanium' | 'silver' | 'gold'>('space-black');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [stageTheme, setStageTheme] = useState<'studio' | 'blueprint' | 'concrete' | 'grid'>('studio');

  // Content Source: Preset Template vs Custom Route / URL
  const [contentMode, setContentMode] = useState<'template' | 'internal' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);
  const [internalRoute, setInternalRoute] = useState<string>('/');
  const [customUrl, setCustomUrl] = useState<string>('https://example.com');
  const [matrixView, setMatrixView] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Filtered devices for category tabs
  const filteredDevices = MOCKUP_DEVICES.filter(
    (d) => deviceCategoryFilter === 'all' || d.category === deviceCategoryFilter
  );

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const handleZoom = (delta: number) => {
    setZoomScale((prev) => Math.min(1.5, Math.max(0.4, +(prev + delta).toFixed(2))));
  };

  const handleCopyConfig = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Background stage classes
  const stageBackgroundClass = {
    studio: 'bg-[#121316] text-zinc-100',
    blueprint: 'bg-[#0f1d36] text-blue-100',
    concrete: 'bg-[#f0f0eb] text-zinc-900',
    grid: 'bg-[#000000] text-zinc-100',
  }[stageTheme];

  const stageGridOverlay =
    stageTheme === 'blueprint'
      ? 'radial-gradient(#1e3a8a 1px, transparent 1px)'
      : stageTheme === 'concrete'
      ? 'radial-gradient(#d1d5db 1px, transparent 1px)'
      : 'radial-gradient(#27272a 1px, transparent 1px)';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${stageBackgroundClass}`}>
      {/* Top Header Bar */}
      <header className="border-b-4 border-black bg-white text-black px-4 py-3 select-none z-30 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-black text-[#ccff00] px-2 py-1 border-2 border-black font-black text-xs flex items-center gap-1.5 hover:bg-[#ccff00] hover:text-black transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>NEDJECT</span>
            </Link>
            <div>
              <h1 className="text-sm font-black tracking-tight text-black flex items-center gap-2">
                <span>Multi-Device Mockup Studio</span>
                <span className="text-[10px] bg-black text-[#ccff00] px-1.5 py-0.2 font-mono">
                  v2.0
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Responsive website templates &amp; hardware viewport chassis
              </p>
            </div>
          </div>

          {/* Quick Actions & Matrix Mode Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setMatrixView(!matrixView)}
              className={`px-2.5 py-1.5 border-2 border-black font-black text-xs transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] ${
                matrixView
                  ? 'bg-black text-[#ccff00]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{matrixView ? 'EXIT MATRIX' : 'MATRIX VIEW (ALL SIZES)'}</span>
            </button>

            <button
              onClick={handleCopyConfig}
              className="px-2.5 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Controls Bar: Device Selector, Orientation, Bezel, Zoom */}
      <div className="border-b-2 border-zinc-800 bg-[#17181c] text-zinc-300 px-4 py-2.5 select-none z-20 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Device Category Pills & Device Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-zinc-900 border border-zinc-700 p-0.5 rounded">
              {(['all', 'mobile', 'tablet', 'desktop'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDeviceCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                    deviceCategoryFilter === cat
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Select Device Dropdown */}
            <select
              value={selectedDevice.id}
              onChange={(e) => {
                const found = MOCKUP_DEVICES.find((d) => d.id === e.target.value);
                if (found) setSelectedDevice(found);
              }}
              className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
            >
              {filteredDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.width}×{d.height})
                </option>
              ))}
            </select>

            {/* Rotate Button */}
            <button
              onClick={toggleOrientation}
              className={`p-1.5 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1 ${
                orientation === 'landscape' ? 'bg-blue-950/80 border-blue-500 text-blue-400' : ''
              }`}
              title="Toggle Portrait / Landscape"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] uppercase">{orientation}</span>
            </button>
          </div>

          {/* Bezel Style, Chassis Color & Zoom Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Bezel Style Toggle */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-zinc-500 hidden sm:inline">FRAME:</span>
              <div className="flex items-center bg-zinc-900 border border-zinc-700 p-0.5 rounded">
                {(['chassis', 'minimal', 'frameless'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setBezelStyle(style)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      bezelStyle === style
                        ? 'bg-zinc-700 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Chassis Color (if chassis) */}
            {bezelStyle === 'chassis' && (
              <div className="flex items-center gap-1">
                {(['space-black', 'titanium', 'silver', 'gold'] as const).map((color) => {
                  const bg =
                    color === 'space-black'
                      ? '#18181b'
                      : color === 'titanium'
                      ? '#71717a'
                      : color === 'silver'
                      ? '#d4d4d8'
                      : '#f59e0b';
                  return (
                    <button
                      key={color}
                      onClick={() => setChassisColor(color)}
                      style={{ backgroundColor: bg }}
                      className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                        chassisColor === color
                          ? 'ring-2 ring-blue-500 scale-125 border-white'
                          : 'border-zinc-700'
                      }`}
                      title={`Finish: ${color}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Stage Canvas Theme */}
            <div className="flex items-center gap-1 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={stageTheme}
                onChange={(e) => setStageTheme(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-300 font-mono focus:outline-none"
              >
                <option value="studio">Studio Dark</option>
                <option value="blueprint">Blueprint Blue</option>
                <option value="concrete">Concrete Light</option>
                <option value="grid">Pitch Grid</option>
              </select>
            </div>

            {/* Zoom Slider / Controls */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded">
              <button
                onClick={() => handleZoom(-0.1)}
                className="text-zinc-400 hover:text-white p-0.5"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[11px] font-mono min-w-[36px] text-center font-bold">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="text-zinc-400 hover:text-white p-0.5"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoomScale(0.85)}
                className="text-[10px] text-blue-400 hover:underline ml-1"
                title="Reset Zoom"
              >
                Fit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template & Source Mode Selector Drawer */}
      <div className="border-b border-zinc-800 bg-[#131418] px-4 py-2 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 font-bold uppercase text-[11px]">CONTENT:</span>
            <button
              onClick={() => setContentMode('template')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                contentMode === 'template'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              5 Preset Templates
            </button>
            <button
              onClick={() => setContentMode('internal')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                contentMode === 'internal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Nedject App Routes
            </button>
            <button
              onClick={() => setContentMode('custom')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                contentMode === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Custom Web URL
            </button>
          </div>

          {/* Conditional Sub-selectors */}
          {contentMode === 'template' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {WEBSITE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                    selectedTemplate.id === tmpl.id
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          )}

          {contentMode === 'internal' && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">ROUTE:</span>
              <select
                value={internalRoute}
                onChange={(e) => setInternalRoute(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white"
              >
                <option value="/">Home (300 DPI QR Studio)</option>
                <option value="/barcode-pick">Barcode Pick (UPC/EAN/Code 128)</option>
                <option value="/qr-crush">QR Crush Forensic Scanner</option>
                <option value="/blog">Engineering Publications Blog</option>
                <option value="/google-fit">Google Fit Telemetry Dashboard</option>
                <option value="/payment">Plans &amp; Pro Pricing</option>
              </select>
            </div>
          )}

          {contentMode === 'custom' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-0.5 text-xs text-white font-mono w-64"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport Workspace Stage */}
      <main
        className="flex-1 flex flex-col items-center justify-start p-6 sm:p-12 overflow-auto relative"
        style={{
          backgroundImage: stageGridOverlay,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Device Dimension Telemetry HUD */}
        <div className="mb-6 px-3 py-1 bg-black/80 backdrop-blur border border-zinc-700 rounded-full font-mono text-[11px] text-zinc-300 flex items-center gap-3 shadow-lg select-none">
          <span className="font-bold text-[#ccff00]">{selectedDevice.name}</span>
          <span>•</span>
          <span>
            {orientation === 'landscape' ? selectedDevice.height : selectedDevice.width} ×{' '}
            {orientation === 'landscape' ? selectedDevice.width : selectedDevice.height} px
          </span>
          <span>•</span>
          <span className="text-zinc-400">DPR: {selectedDevice.dpr}x</span>
          <span>•</span>
          <span className="text-zinc-400">{selectedDevice.aspectRatio}</span>
        </div>

        {/* Viewport Rendering: Single Device vs Matrix View */}
        {!matrixView ? (
          <div className="flex justify-center items-center pb-16">
            <DeviceFrame
              device={selectedDevice}
              orientation={orientation}
              bezelStyle={bezelStyle}
              chassisColor={chassisColor}
              zoomScale={zoomScale}
            >
              {contentMode === 'template' ? (
                <TemplateRenderer
                  templateId={selectedTemplate.id}
                  viewportWidth={
                    orientation === 'landscape' ? selectedDevice.height : selectedDevice.width
                  }
                />
              ) : contentMode === 'internal' ? (
                <iframe
                  src={internalRoute}
                  className="w-full h-full border-0 bg-white"
                  title="Internal App Route Preview"
                />
              ) : (
                <iframe
                  src={customUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Custom URL Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              )}
            </DeviceFrame>
          </div>
        ) : (
          /* Multi-Device Matrix View: Mobile + Tablet + Desktop side by side */
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 pb-20 w-full overflow-x-auto">
            {/* 1. Mobile (iPhone 16 Pro) */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono font-bold text-zinc-400 mb-2">
                MOBILE // iPhone 16 Pro (393 × 852)
              </div>
              <DeviceFrame
                device={MOCKUP_DEVICES[0]}
                orientation="portrait"
                bezelStyle={bezelStyle}
                chassisColor={chassisColor}
                zoomScale={0.7}
              >
                <TemplateRenderer
                  templateId={selectedTemplate.id}
                  viewportWidth={393}
                />
              </DeviceFrame>
            </div>

            {/* 2. Tablet (iPad Pro 11") */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono font-bold text-zinc-400 mb-2">
                TABLET // iPad Pro 11&quot; (834 × 1194)
              </div>
              <DeviceFrame
                device={MOCKUP_DEVICES[4]}
                orientation="portrait"
                bezelStyle={bezelStyle}
                chassisColor={chassisColor}
                zoomScale={0.5}
              >
                <TemplateRenderer
                  templateId={selectedTemplate.id}
                  viewportWidth={834}
                />
              </DeviceFrame>
            </div>

            {/* 3. Desktop (MacBook Pro 16") */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono font-bold text-zinc-400 mb-2">
                DESKTOP // MacBook Pro (1440 × 900)
              </div>
              <DeviceFrame
                device={MOCKUP_DEVICES[7]}
                orientation="portrait"
                bezelStyle={bezelStyle}
                chassisColor={chassisColor}
                zoomScale={0.4}
              >
                <TemplateRenderer
                  templateId={selectedTemplate.id}
                  viewportWidth={1440}
                />
              </DeviceFrame>
            </div>
          </div>
        )}

        {/* Bottom Templates Showcase Carousel */}
        <div className="w-full max-w-6xl mt-auto pt-8 border-t border-zinc-800">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>PRE-ENGINEERED HIGH-DPI WEBSITE TEMPLATES</span>
            <span className="text-[11px] text-zinc-500">Click any card to inspect in frame</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
            {WEBSITE_TEMPLATES.map((tmpl) => {
              const active = selectedTemplate.id === tmpl.id && contentMode === 'template';
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setContentMode('template');
                    setSelectedTemplate(tmpl);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                    active
                      ? 'bg-zinc-800 border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.15)]'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase">{tmpl.badge}</span>
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{tmpl.name}</div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>{tmpl.category}</span>
                    <span className="text-blue-400 font-bold">&rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
