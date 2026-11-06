'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  QrCode,
  Barcode as BarcodeIcon,
  Layers,
  Radio,
  Share2,
  Settings,
  Save,
  RotateCcw,
  Copy,
  Check,
  Code,
  Terminal,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
  Sliders,
  ShieldCheck,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Cpu,
  Printer,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_B2B_CONFIG, B2BServiceConfig } from '@/lib/b2b-config';

type ActiveTab = 'qr' | 'barcode' | 'photoDpi' | 'nfc' | 'batch' | 'webhooks' | 'docs';

export default function UserConfigurationPage() {
  const params = useParams();
  const { data: session } = useSession();
  const useridParam = (params?.userid as string) || '';

  const [activeTab, setActiveTab] = useState<ActiveTab>('qr');
  const [config, setConfig] = useState<B2BServiceConfig>(DEFAULT_B2B_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [snippetLang, setSnippetLang] = useState<'curl' | 'nodejs' | 'python' | 'configApi'>('curl');

  // Live Test Sandbox State
  const [testService, setTestService] = useState<'qr' | 'barcode'>('qr');
  const [testPayload, setTestPayload] = useState('https://nedject.internal/b2b-pass');
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(`/api/user/config?userId=${encodeURIComponent(useridParam)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        console.warn('Failed to load server config, loading localStorage fallback:', err);
        try {
          const local = localStorage.getItem(`nedject_b2b_config_${useridParam}`);
          if (local) setConfig(JSON.parse(local));
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [useridParam]);

  // Save config handler
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);

    // Save to localStorage
    try {
      localStorage.setItem(`nedject_b2b_config_${useridParam}`, JSON.stringify(config));
    } catch {}

    // Save to database
    try {
      const res = await fetch('/api/user/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: useridParam, config }),
      });

      if (res.ok) {
        setSaveSuccessMsg('All B2B service configurations saved successfully!');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      } else {
        throw new Error('Server returned an error');
      }
    } catch {
      setSaveSuccessMsg('Saved to local browser storage.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    if (confirm('Reset all service configurations back to factory defaults?')) {
      setConfig(DEFAULT_B2B_CONFIG);
      setSaveSuccessMsg('Reset to factory defaults. Click "Save Configuration" to apply.');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nedject-b2b-config-${useridParam}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setConfig({ ...DEFAULT_B2B_CONFIG, ...parsed });
        alert('Configuration imported successfully! Remember to click "Save Configuration".');
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Test Runner against /api/v1/generate
  const handleRunTest = async () => {
    setTestingApi(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          type: testService,
          payload: testPayload,
          format: config.qr.defaultFormat,
          options: {
            dpi: config.qr.defaultDpi,
            cmyk: config.qr.colorSeparation === 'CMYK-FOGRA39',
            symbology: config.barcode.defaultSymbology,
          },
        }),
      });

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);

      setTestResult({
        ok: res.ok,
        status: res.status,
        latencyMs,
        headers: {
          'x-origin-verified': res.headers.get('x-origin-verified') || 'false',
          'x-credits-remaining': res.headers.get('x-credits-remaining') || 'unknown',
          'x-credits-unlimited': res.headers.get('x-credits-unlimited') || 'false',
        },
        body: data,
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        status: 0,
        latencyMs: 0,
        error: err.message || 'Network request failed',
      });
    } finally {
      setTestingApi(false);
    }
  };

  const copyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black pb-20">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-30 shadow-[0_4px_0_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${useridParam}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-zinc-100 hover:bg-[#ccff00] text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>
            <div className="h-6 w-0.5 bg-black" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-[#ccff00] flex items-center justify-center font-black text-black shadow-[2px_2px_0px_#000000]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  B2B SERVICE CONFIGURATION
                  <span className="text-[10px] bg-black text-[#ccff00] px-2 py-0.5 font-mono font-bold border border-black">
                    ENTERPRISE PIPELINES
                  </span>
                </h1>
                <p className="text-[11px] font-mono text-zinc-600">
                  Global parameters for QR, Barcode, NFC, Prepress CMYK, and Webhook engines.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/${useridParam}/pear`}
              className="px-3 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 font-bold text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pear API Keys</span>
            </Link>

            <Link
              href="/nfc-bat"
              className="px-3 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 font-bold text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">NFC Studio</span>
            </Link>

            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. TOAST ALERTS */}
      {saveSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3 border-2 border-black bg-[#ccff00] text-black font-bold text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000000]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* SERVICE TABS BAR */}
        <div className="border-4 border-black bg-white p-2 shadow-[6px_6px_0px_#000000] flex flex-wrap gap-2">
          {[
            { id: 'qr', label: 'QR Code Engine', icon: QrCode, badge: 'SVG / CMYK' },
            { id: 'barcode', label: 'Barcode Studio', icon: BarcodeIcon, badge: '8 FORMATS' },
            { id: 'photoDpi', label: 'Prepress Canvas', icon: Printer, badge: '1200 DPI' },
            { id: 'nfc', label: 'Web NFC Touch', icon: Radio, badge: 'NDEF PASS' },
            { id: 'batch', label: 'Bulk & Batch Matrix', icon: Layers, badge: '10K MATRIX' },
            { id: 'webhooks', label: 'Webhooks & Relays', icon: Share2, badge: 'HMAC' },
            { id: 'docs', label: 'Developer Sandbox', icon: Terminal, badge: 'cURL & SDK' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-3.5 py-2.5 border-2 border-black font-black text-xs uppercase flex items-center gap-2 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 ${
                  isActive
                    ? 'bg-[#ccff00] text-black shadow-[4px_4px_0px_#000000]'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 border border-black font-mono font-bold ${
                    isActive ? 'bg-black text-[#ccff00]' : 'bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: QR CODE ENGINE CONFIGURATION                                      */}
        {/* ========================================================================= */}
        {activeTab === 'qr' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Engine & Optical Calibration
              </h2>
              <p className="text-xs text-zinc-600 font-mono mt-1">
                Configure default parameters applied to all automated QR generations requested via API.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Error Correction */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Default Error Correction:
                </label>
                <select
                  value={config.qr.errorCorrection}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      qr: { ...config.qr, errorCorrection: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="L">Level L (~7% redundancy - Smallest Matrix)</option>
                  <option value="M">Level M (~15% redundancy - Standard)</option>
                  <option value="Q">Level Q (~25% redundancy - Industrial)</option>
                  <option value="H">Level H (~30% redundancy - High Resilience / Logos)</option>
                </select>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Level H is recommended when overlaying central logos or event badges.
                </p>
              </div>

              {/* Output Resolution DPI */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Default Canvas DPI:
                </label>
                <select
                  value={config.qr.defaultDpi}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      qr: { ...config.qr, defaultDpi: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value={300}>300 DPI (Commercial Offset Printing)</option>
                  <option value={600}>600 DPI (Fine-Art & Vector Press Ready)</option>
                  <option value={1200}>1200 DPI (Micro-engraving & Security Matrix)</option>
                </select>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Guarantees crisp edges with zero antialiasing blur on physical print runs.
                </p>
              </div>

              {/* Color Separation */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Color Profile & Separation:
                </label>
                <select
                  value={config.qr.colorSeparation}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      qr: { ...config.qr, colorSeparation: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="sRGB">sRGB Standard (Web & Digital Displays)</option>
                  <option value="CMYK-FOGRA39">CMYK FOGRA39 (Direct Commercial Print Plates)</option>
                </select>
                <p className="text-[10px] text-zinc-500 font-mono">
                  CMYK separation prevents black ink muddying by enforcing 100% K ink channel.
                </p>
              </div>

              {/* Output Format */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Default Export Format:
                </label>
                <select
                  value={config.qr.defaultFormat}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      qr: { ...config.qr, defaultFormat: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="svg">Vector SVG (Infinite Scalability)</option>
                  <option value="png">Uncompressed PNG (300 DPI Canvas)</option>
                  <option value="pdf">ISO Print PDF (Vector Print Proof)</option>
                </select>
              </div>

              {/* Dot Shape */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Matrix Dot Style:
                </label>
                <select
                  value={config.qr.dotStyle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      qr: { ...config.qr, dotStyle: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="square">Industrial Sharp Square</option>
                  <option value="rounded">Organic Rounded Pixels</option>
                  <option value="dots">Circular Dot Matrix</option>
                </select>
              </div>

              {/* Quiet Zone Margin */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Quiet Zone Margin:
                </label>
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={config.qr.margin}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      qr: { ...config.qr, margin: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                />
                <p className="text-[10px] text-zinc-500 font-mono">
                  ISO 18004 specifies a minimum 4-module quiet zone for high-speed scanners.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BARCODE STUDIO CONFIGURATION                                      */}
        {/* ========================================================================= */}
        {activeTab === 'barcode' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <BarcodeIcon className="w-5 h-5" />
                Barcode Engine & Symbology Presets
              </h2>
              <p className="text-xs text-zinc-600 font-mono mt-1">
                Configure default industrial linear barcode standards for packaging and point-of-sale systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Default Symbology */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Default Symbology:
                </label>
                <select
                  value={config.barcode.defaultSymbology}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      barcode: { ...config.barcode, defaultSymbology: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="CODE128">Code 128 (Universal Logistics & Shipping)</option>
                  <option value="EAN13">EAN-13 (International Retail Grocery)</option>
                  <option value="UPC">UPC-A (North American Retail Standard)</option>
                  <option value="ITF14">ITF-14 (Corrugated Master Cartons)</option>
                  <option value="CODE39">Code 39 (Automotive & Aerospace Defense)</option>
                  <option value="DATAMATRIX">DataMatrix (High-density Micro 2D)</option>
                </select>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Automatically calculates check digits according to GS1 specifications.
                </p>
              </div>

              {/* Bar Width Ratio */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Narrow Bar Width (Module):
                </label>
                <select
                  value={config.barcode.barWidth}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      barcode: { ...config.barcode, barWidth: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value={1}>1px (Compact High-Density)</option>
                  <option value={2}>2px (Standard ISO Grade A)</option>
                  <option value={3}>3px (Master Carton Far-Scanner)</option>
                  <option value={4}>4px (Warehouse Long-Range)</option>
                </select>
              </div>

              {/* Bar Height */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Bar Height (Pixels / Vectors):
                </label>
                <input
                  type="number"
                  min={30}
                  max={200}
                  value={config.barcode.barHeight}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      barcode: { ...config.barcode, barHeight: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                />
                <p className="text-[10px] text-zinc-500 font-mono">
                  Recommended height for GS1 handheld laser compliance is 60px to 100px.
                </p>
              </div>

              {/* Display Text Label */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Human-Readable Text:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="displayValue"
                    checked={config.barcode.displayValue}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        barcode: { ...config.barcode, displayValue: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <label htmlFor="displayValue" className="text-xs font-bold font-mono">
                    Print OCR-B numeric text beneath bars
                  </label>
                </div>
              </div>

              {/* Color Profile */}
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Color Contrast Profile:
                </label>
                <select
                  value={config.barcode.colorProfile}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      barcode: { ...config.barcode, colorProfile: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="black-white">High-Contrast B/W (Max Optical Scannability)</option>
                  <option value="cmyk-k100">CMYK K100 (Single-plate Offset Lithography)</option>
                  <option value="inverted">Inverted Dark Mode (Kiosk Displays Only)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PREPRESS PHOTO DPI CONFIGURATION                                  */}
        {/* ========================================================================= */}
        {activeTab === 'photoDpi' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Prepress Canvas & Vector Halftone Separation
              </h2>
              <p className="text-xs text-zinc-600 font-mono mt-1">
                Configure commercial print standards for high-resolution photo upscaling and bleed marks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Target Prepress DPI:
                </label>
                <select
                  value={config.photoDpi.targetDpi}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      photoDpi: { ...config.photoDpi, targetDpi: Number(e.target.value) as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value={300}>300 DPI (Magazine & Brochure Press)</option>
                  <option value={600}>600 DPI (Fine Art Lithography)</option>
                  <option value={1200}>1200 DPI (Banknote & Security Microprint)</option>
                </select>
              </div>

              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Bleed Margin (mm):
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={config.photoDpi.bleedMarginMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      photoDpi: { ...config.photoDpi, bleedMarginMm: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                />
                <p className="text-[10px] text-zinc-500 font-mono">
                  Standard ISO printer bleed margin is 3mm on all exterior edges.
                </p>
              </div>

              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Print Registration Marks:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="cropMarks"
                    checked={config.photoDpi.cropMarks}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        photoDpi: { ...config.photoDpi, cropMarks: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <label htmlFor="cropMarks" className="text-xs font-bold font-mono">
                    Inject ISO trim guides and color calibration bars in PDF
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WEB NFC & TOUCH TAG SERVICE                                       */}
        {/* ========================================================================= */}
        {activeTab === 'nfc' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
              <div>
                <h2 className="text-xl font-black uppercase flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-600" />
                  Web NFC Touch Tag & Digital Business Card Engine
                </h2>
                <p className="text-xs text-zinc-600 font-mono mt-1">
                  Configure default NDEF formatting for touch tags, event wristbands, and digital vCard badges.
                </p>
              </div>
              <Link
                href="/nfc-bat"
                className="px-4 py-2 border-2 border-black bg-blue-100 hover:bg-blue-200 font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
              >
                <span>Launch Live NFC Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Default Record Type:
                </label>
                <select
                  value={config.nfc.defaultRecordType}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      nfc: { ...config.nfc, defaultRecordType: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="vcard">Digital Business Card (vCard 3.0)</option>
                  <option value="url">Direct Smart Poster (Web Link)</option>
                  <option value="text">Authorized Event Pass Token</option>
                  <option value="custom">Custom MIME Payload (JSON / Binary)</option>
                </select>
              </div>

              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Target Chip Preset:
                </label>
                <select
                  value={config.nfc.presetTagType}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      nfc: { ...config.nfc, presetTagType: e.target.value as any },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="NTAG213">NTAG213 (144 bytes - Compact URL / ID)</option>
                  <option value="NTAG215">NTAG215 (504 bytes - Full vCard Contact)</option>
                  <option value="NTAG216">NTAG216 (888 bytes - Large Binary / Data)</option>
                  <option value="Type4">NFC Forum Type 4 (DESFire / Smart Card)</option>
                </select>
              </div>

              <div className="border-2 border-black p-4 bg-blue-50 border-blue-900 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Hardware Compatibility</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed font-sans">
                  The Web NFC API is supported on Chrome for Android. On other devices, Nedject generates standardized NDEF binary structures that can be imported into handheld hardware encoders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BATCH MATRIX & BULK PIPELINE                                      */}
        {/* ========================================================================= */}
        {activeTab === 'batch' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Batch Matrix & High-Volume Generation Engine
              </h2>
              <p className="text-xs text-zinc-600 font-mono mt-1">
                Configure parallel worker limits and automated ZIP compression for 10,000+ pass batches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Max Batch Size per Archive:
                </label>
                <select
                  value={config.batchMatrix.maxBatchSize}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      batchMatrix: { ...config.batchMatrix, maxBatchSize: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value={250}>250 Passes (Standard Preview)</option>
                  <option value={1000}>1,000 Passes (Fast Download)</option>
                  <option value={5000}>5,000 Passes (Corporate Event Tier)</option>
                  <option value={10000}>10,000 Passes (Enterprise Batch Engine)</option>
                </select>
              </div>

              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  ZIP Compression Level:
                </label>
                <select
                  value={config.batchMatrix.zipCompressionLevel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      batchMatrix: { ...config.batchMatrix, zipCompressionLevel: Number(e.target.value) },
                    })
                  }
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value={1}>Level 1 (Fastest Render / Low CPU)</option>
                  <option value={6}>Level 6 (Balanced Default)</option>
                  <option value={9}>Level 9 (Maximum Compression / Smallest Archive)</option>
                </select>
              </div>

              <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
                <label className="block text-xs font-black uppercase">
                  Metadata Manifest:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="includeMetadataCsv"
                    checked={config.batchMatrix.includeMetadataCsv}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        batchMatrix: { ...config.batchMatrix, includeMetadataCsv: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <label htmlFor="includeMetadataCsv" className="text-xs font-bold font-mono">
                    Bundle automated index.csv manifest in ZIP archive
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ENTERPRISE WEBHOOKS & EVENT RELAYS                                 */}
        {/* ========================================================================= */}
        {activeTab === 'webhooks' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Enterprise Webhooks & Real-Time Event Dispatch
              </h2>
              <p className="text-xs text-zinc-600 font-mono mt-1">
                Receive instant HTTP POST callbacks when optical generations complete or security events trigger.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Webhook Target Endpoint URL:
                </label>
                <input
                  type="url"
                  placeholder="https://api.yourcompany.com/webhooks/nedject"
                  value={config.webhooks.endpointUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      webhooks: { ...config.webhooks, endpointUrl: e.target.value },
                    })
                  }
                  className="w-full border-2 border-black p-2.5 font-mono text-xs bg-zinc-50 shadow-[2px_2px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  HMAC-SHA256 Signing Secret:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="whsec_..."
                    value={config.webhooks.signingSecret || 'whsec_7d92ab81e9f1430ac28e'}
                    className="w-full border-2 border-black p-2.5 font-mono text-xs bg-zinc-100 shadow-[2px_2px_0px_#000000]"
                  />
                  <button
                    onClick={() => {
                      const newSecret = `whsec_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
                      setConfig({
                        ...config,
                        webhooks: { ...config.webhooks, signingSecret: newSecret },
                      });
                    }}
                    className="px-3 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs uppercase"
                  >
                    Roll Secret
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-2">
                  Subscribed Telemetry Events:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-2 border-black p-3 bg-zinc-50">
                  {[
                    { id: 'generation.completed', label: 'generation.completed (Render finished)' },
                    { id: 'batch.archive_ready', label: 'batch.archive_ready (ZIP prepared)' },
                    { id: 'quota.warning', label: 'quota.warning (80% credits consumed)' },
                    { id: 'threat.origin_blocked', label: 'threat.origin_blocked (403 Origin violation)' },
                  ].map((evt) => (
                    <label key={evt.id} className="flex items-center gap-2 text-xs font-mono font-bold">
                      <input
                        type="checkbox"
                        checked={config.webhooks.events.includes(evt.id)}
                        onChange={(e) => {
                          const current = config.webhooks.events;
                          const next = e.target.checked
                            ? [...current, evt.id]
                            : current.filter((x) => x !== evt.id);
                          setConfig({
                            ...config,
                            webhooks: { ...config.webhooks, events: next },
                          });
                        }}
                        className="accent-black"
                      />
                      <span>{evt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: HOW TO CONNECT API CONFIGURATION & DEVELOPER DOCS                  */}
        {/* ========================================================================= */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Multi-Language SDK & Live Config Snippets */}
              <div className="lg:col-span-7 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
                  <h3 className="text-base font-black uppercase flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    <span>API Connection Code &amp; SDKs</span>
                  </h3>
                  <button
                    onClick={() => {
                      let snippet = '';
                      if (snippetLang === 'curl') {
                        snippet = `curl -X POST https://nedject.com/api/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Origin: https://myapp.com" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "${testService}",
    "payload": "${testPayload}",
    "format": "${config.qr.defaultFormat}",
    "options": {
      "dpi": ${config.qr.defaultDpi},
      "errorCorrection": "${config.qr.errorCorrection}",
      "colorSeparation": "${config.qr.colorSeparation}",
      "symbology": "${config.barcode.defaultSymbology}"
    }
  }'`;
                      } else if (snippetLang === 'nodejs') {
                        snippet = `// TypeScript / Node.js
import axios from 'axios';

const API_KEY = process.env.NEDJECT_API_KEY;
const ORIGIN = 'https://myapp.com'; // Whitelisted in Pear Gateway

// 1. Fetch user's saved B2B configuration
const configRes = await axios.get(
  \`https://nedject.com/api/user/config?userId=\${encodeURIComponent('${useridParam}')}\`,
  { headers: { Authorization: \`Bearer \${API_KEY}\` } }
);

// 2. Generate asset using defaults
const response = await axios.post(
  'https://nedject.com/api/v1/generate',
  {
    type: '${testService}',
    payload: '${testPayload}',
    format: configRes.data.config.qr.defaultFormat,
    options: {
      dpi: configRes.data.config.qr.defaultDpi,
      errorCorrection: configRes.data.config.qr.errorCorrection,
    },
  },
  {
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      Origin: ORIGIN,
      'Content-Type': 'application/json',
    },
  }
);

console.log('Asset URL:', response.data.assetUrl);
console.log('Credits Remaining:', response.headers['x-credits-remaining']);`;
                      } else if (snippetLang === 'python') {
                        snippet = `# Python 3 (Requests)
import os
import requests

API_KEY = os.environ.get("NEDJECT_API_KEY")
ORIGIN = "https://myapp.com"

# 1. Fetch user B2B service configuration
cfg = requests.get(
    "https://nedject.com/api/user/config?userId=${useridParam}",
    headers={"Authorization": f"Bearer {API_KEY}"}
).json().get("config", {})

# 2. Render optical asset
res = requests.post(
    "https://nedject.com/api/v1/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Origin": ORIGIN,
        "Content-Type": "application/json"
    },
    json={
        "type": "${testService}",
        "payload": "${testPayload}",
        "format": cfg.get("qr", {}).get("defaultFormat", "svg"),
        "options": {
            "dpi": cfg.get("qr", {}).get("defaultDpi", 300),
            "symbology": cfg.get("barcode", {}).get("defaultSymbology", "CODE128")
        }
    }
)

print("HTTP", res.status_code, res.json())
print("Credits Remaining:", res.headers.get("x-credits-remaining"))`;
                      } else {
                        snippet = `# 1. Read stored B2B configurations for tenant
curl -X GET "https://nedject.com/api/user/config?userId=${useridParam}" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# 2. Update service configurations programmatically
curl -X POST "https://nedject.com/api/user/config" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "${useridParam}",
    "config": {
      "qr": { "errorCorrection": "H", "defaultDpi": 600, "colorSeparation": "CMYK-FOGRA39" },
      "barcode": { "defaultSymbology": "EAN13" }
    }
  }'`;
                      }
                      copyCode(snippet);
                    }}
                    className="px-3 py-1 border-2 border-black bg-zinc-100 hover:bg-[#ccff00] text-xs font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000000]"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Snippet Language Selector */}
                <div className="flex flex-wrap items-center gap-1 text-xs font-black">
                  {[
                    { id: 'curl', label: 'cURL Gateway' },
                    { id: 'nodejs', label: 'TypeScript / Node' },
                    { id: 'python', label: 'Python (Requests)' },
                    { id: 'configApi', label: 'Config Sync API' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSnippetLang(lang.id as any)}
                      className={`px-3 py-1.5 border-2 border-black uppercase text-[11px] cursor-pointer shadow-[2px_2px_0px_#000000] ${
                        snippetLang === lang.id
                          ? 'bg-black text-[#ccff00]'
                          : 'bg-white text-zinc-800 hover:bg-zinc-100'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic Code Viewer */}
                <div className="bg-black text-[#ccff00] p-4 font-mono text-xs overflow-x-auto border-2 border-black max-h-96">
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {snippetLang === 'curl' &&
                      `curl -X POST https://nedject.com/api/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Origin: https://myapp.com" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "${testService}",
    "payload": "${testPayload}",
    "format": "${config.qr.defaultFormat}",
    "options": {
      "dpi": ${config.qr.defaultDpi},
      "errorCorrection": "${config.qr.errorCorrection}",
      "colorSeparation": "${config.qr.colorSeparation}",
      "symbology": "${config.barcode.defaultSymbology}"
    }
  }'`}
                    {snippetLang === 'nodejs' &&
                      `// TypeScript / Node.js
import axios from 'axios';

const API_KEY = process.env.NEDJECT_API_KEY;
const ORIGIN = 'https://myapp.com'; // Whitelisted in Pear Gateway

// 1. Fetch user's saved B2B configuration
const configRes = await axios.get(
  \`https://nedject.com/api/user/config?userId=\${encodeURIComponent('${useridParam}')}\`,
  { headers: { Authorization: \`Bearer \${API_KEY}\` } }
);

// 2. Generate asset using defaults
const response = await axios.post(
  'https://nedject.com/api/v1/generate',
  {
    type: '${testService}',
    payload: '${testPayload}',
    format: configRes.data.config.qr.defaultFormat,
    options: {
      dpi: configRes.data.config.qr.defaultDpi,
      errorCorrection: configRes.data.config.qr.errorCorrection,
    },
  },
  {
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      Origin: ORIGIN,
      'Content-Type': 'application/json',
    },
  }
);

console.log('Asset URL:', response.data.assetUrl);
console.log('Credits Remaining:', response.headers['x-credits-remaining']);`}
                    {snippetLang === 'python' &&
                      `# Python 3 (Requests)
import os
import requests

API_KEY = os.environ.get("NEDJECT_API_KEY")
ORIGIN = "https://myapp.com"

# 1. Fetch user B2B service configuration
cfg = requests.get(
    "https://nedject.com/api/user/config?userId=${useridParam}",
    headers={"Authorization": f"Bearer {API_KEY}"}
).json().get("config", {})

# 2. Render optical asset
res = requests.post(
    "https://nedject.com/api/v1/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Origin": ORIGIN,
        "Content-Type": "application/json"
    },
    json={
        "type": "${testService}",
        "payload": "${testPayload}",
        "format": cfg.get("qr", {}).get("defaultFormat", "svg"),
        "options": {
            "dpi": cfg.get("qr", {}).get("defaultDpi", 300),
            "symbology": cfg.get("barcode", {}).get("defaultSymbology", "CODE128")
        }
    }
)

print("HTTP", res.status_code, res.json())
print("Credits Remaining:", res.headers.get("x-credits-remaining"))`}
                    {snippetLang === 'configApi' &&
                      `# 1. Read stored B2B configurations for tenant
curl -X GET "https://nedject.com/api/user/config?userId=${useridParam}" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# 2. Update service configurations programmatically
curl -X POST "https://nedject.com/api/user/config" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "${useridParam}",
    "config": {
      "qr": { "errorCorrection": "H", "defaultDpi": 600, "colorSeparation": "CMYK-FOGRA39" },
      "barcode": { "defaultSymbology": "EAN13" }
    }
  }'`}
                  </pre>
                </div>

                <div className="bg-zinc-50 border-2 border-black p-3 text-xs space-y-1">
                  <div className="font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Origin Whitelist & Threat Defense:</span>
                  </div>
                  <p className="text-zinc-600 font-mono text-[11px]">
                    All incoming requests are strictly checked against your allowed origins configured in the{' '}
                    <Link href={`/${useridParam}/pear`} className="underline font-bold text-black">
                      Pear API Gateway
                    </Link>. Requests from unauthorized origins receive an immediate 403 Forbidden response.
                  </p>
                </div>
              </div>

              {/* Right 5 cols: Live Interactive Test Runner */}
              <div className="lg:col-span-5 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
                <div className="border-b-2 border-black pb-3">
                  <h3 className="text-base font-black uppercase flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Interactive Test Runner
                  </h3>
                  <p className="text-xs text-zinc-600 font-mono">
                    Execute a live render test using your active B2B configurations.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTestService('qr')}
                      className={`py-2 border-2 border-black font-black text-xs uppercase ${
                        testService === 'qr' ? 'bg-[#ccff00]' : 'bg-zinc-100'
                      }`}
                    >
                      Test QR Engine
                    </button>
                    <button
                      onClick={() => setTestService('barcode')}
                      className={`py-2 border-2 border-black font-black text-xs uppercase ${
                        testService === 'barcode' ? 'bg-[#ccff00]' : 'bg-zinc-100'
                      }`}
                    >
                      Test Barcode
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Test Payload:
                    </label>
                    <input
                      type="text"
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      className="w-full border-2 border-black p-2 font-mono text-xs bg-zinc-50 shadow-[2px_2px_0px_#000000]"
                    />
                  </div>

                  <button
                    onClick={handleRunTest}
                    disabled={testingApi}
                    className="w-full py-2.5 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {testingApi ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Executing Render...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Send Test Generation Request</span>
                      </>
                    )}
                  </button>

                  {/* Test Output Console */}
                  {testResult && (
                    <div
                      className={`border-2 border-black p-3 font-mono text-xs shadow-[3px_3px_0px_#000000] ${
                        testResult.ok ? 'bg-emerald-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-black/20 pb-1 mb-2 font-bold">
                        <span className={testResult.ok ? 'text-emerald-800' : 'text-red-700'}>
                          HTTP {testResult.status} {testResult.ok ? 'OK' : 'ERROR'}
                        </span>
                        <span className="text-zinc-600 text-[10px]">{testResult.latencyMs}ms</span>
                      </div>

                      <div className="text-[10px] space-y-0.5 mb-2 text-zinc-700 font-mono">
                        <div>Origin-Verified: {testResult.headers?.['x-origin-verified']}</div>
                        <div>Credits-Remaining: {testResult.headers?.['x-credits-remaining']}</div>
                      </div>

                      <pre className="text-[10px] overflow-x-auto bg-black text-white p-2 border border-black max-h-40">
                        {JSON.stringify(testResult.body || testResult.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Complete API Architecture & Developer Integration Specifications */}
            <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-black pb-3">
                <FileText className="w-5 h-5 text-black" />
                <h3 className="text-base font-black uppercase text-black">
                  API Configuration &amp; Integration Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                {/* Step 1 */}
                <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
                  <span className="bg-black text-[#ccff00] text-[10px] px-1.5 py-0.5 font-bold uppercase inline-block">
                    STEP 1 // KEYS &amp; ORIGIN
                  </span>
                  <h4 className="font-black text-black">Pear API Gateway Key</h4>
                  <p className="text-[11px] text-zinc-600 font-sans">
                    Generate an API key (<code className="bg-zinc-200 px-1 font-bold">ndj_live_...</code>) in{' '}
                    <Link href={`/${useridParam}/pear`} className="underline font-bold text-black">
                      Pear API
                    </Link>{' '}
                    and whitelist your application network domains.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
                  <span className="bg-black text-[#ccff00] text-[10px] px-1.5 py-0.5 font-bold uppercase inline-block">
                    STEP 2 // CONFIG SYNC
                  </span>
                  <h4 className="font-black text-black">Fetch Service Config</h4>
                  <p className="text-[11px] text-zinc-600 font-sans">
                    Call <code className="bg-zinc-200 px-1 font-bold">GET /api/user/config</code> on application startup
                    to synchronize tenant prepress DPI, barcode types, and error correction.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
                  <span className="bg-black text-[#ccff00] text-[10px] px-1.5 py-0.5 font-bold uppercase inline-block">
                    STEP 3 // GENERATE
                  </span>
                  <h4 className="font-black text-black">Optical Generation</h4>
                  <p className="text-[11px] text-zinc-600 font-sans">
                    Send <code className="bg-zinc-200 px-1 font-bold">POST /api/v1/generate</code> with your payload and
                    custom option overrides. Receive high-res SVG, PNG, or PDF.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="border-2 border-black bg-zinc-50 p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
                  <span className="bg-black text-[#ccff00] text-[10px] px-1.5 py-0.5 font-bold uppercase inline-block">
                    STEP 4 // WEBHOOKS
                  </span>
                  <h4 className="font-black text-black">HMAC-SHA256 Relays</h4>
                  <p className="text-[11px] text-zinc-600 font-sans">
                    Validate incoming webhook signatures via the{' '}
                    <code className="bg-zinc-200 px-1 font-bold">X-Nedject-Signature</code> header using your signing secret.
                  </p>
                </div>
              </div>

              {/* Threat Codes & Headers Table */}
              <div className="border-2 border-black overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-black text-[#ccff00] border-b-2 border-black">
                      <th className="p-2 border-r border-zinc-700">HTTP STATUS</th>
                      <th className="p-2 border-r border-zinc-700">CODE / REASON</th>
                      <th className="p-2 border-r border-zinc-700">TELEMETRY HEADER</th>
                      <th className="p-2">PREVENTION &amp; RESOLUTION ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-200 bg-white">
                      <td className="p-2 font-black text-emerald-700 border-r border-zinc-200">200 OK</td>
                      <td className="p-2 font-bold border-r border-zinc-200">SUCCESS</td>
                      <td className="p-2 border-r border-zinc-200">x-credits-remaining</td>
                      <td className="p-2 text-zinc-600 font-sans">Asset rendered. Atomic generation credit decremented.</td>
                    </tr>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <td className="p-2 font-black text-amber-700 border-r border-zinc-200">401 UNAUTHORIZED</td>
                      <td className="p-2 font-bold border-r border-zinc-200">INVALID_KEY</td>
                      <td className="p-2 border-r border-zinc-200">x-threat-defense: key_invalid</td>
                      <td className="p-2 text-zinc-600 font-sans">Ensure Authorization header contains active &quot;Bearer ndj_live_...&quot;.</td>
                    </tr>
                    <tr className="border-b border-zinc-200 bg-white">
                      <td className="p-2 font-black text-rose-700 border-r border-zinc-200">403 FORBIDDEN</td>
                      <td className="p-2 font-bold border-r border-zinc-200">ORIGIN_FORBIDDEN</td>
                      <td className="p-2 border-r border-zinc-200">x-threat-defense: origin_blocked</td>
                      <td className="p-2 text-zinc-600 font-sans">Network Origin header did not match whitelisted origins in Pear API Gateway.</td>
                    </tr>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <td className="p-2 font-black text-amber-700 border-r border-zinc-200">402 PAYMENT REQUIRED</td>
                      <td className="p-2 font-bold border-r border-zinc-200">CREDITS_EXHAUSTED</td>
                      <td className="p-2 border-r border-zinc-200">x-credits-remaining: 0</td>
                      <td className="p-2 text-zinc-600 font-sans">Monthly quota reached. Upgrade plan in /pay-to-use to increase limits.</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-black text-purple-700 border-r border-zinc-200">429 RATE LIMIT</td>
                      <td className="p-2 font-bold border-r border-zinc-200">RATE_LIMIT_EXCEEDED</td>
                      <td className="p-2 border-r border-zinc-200">x-ratelimit-reset</td>
                      <td className="p-2 text-zinc-600 font-sans">Request rate surpassed RPM quota. Implement exponential backoff.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. BOTTOM ACTION & UTILITY BAR */}
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_#000000] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <label className="px-3.5 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-6 py-2.5 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving Configurations...' : 'Save All Configurations'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
