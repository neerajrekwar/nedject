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
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Eye,
  RefreshCw,
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Settings2,
  Monitor,
  ZoomIn,
  ZoomOut,
  Ratio,
} from 'lucide-react';
import { toCanvas } from 'html-to-image';
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
type AspectRatioOption = 'free' | '16:9' | '4:3' | '1:1' | '9:16' | '4:5' | '3:2' | '21:9';
type FramingMode = 'contain' | 'cover';

interface PurposePreset {
  id: string;
  name: string;
  category: 'Ideal Mockup' | 'Showcase' | 'Social' | 'Display' | 'Master';
  width: number;
  height: number;
  ratio: string;
  idealFor: string;
}

interface SavedCustomResolution {
  id: string;
  name: string;
  width: number;
  height: number;
  ratio: string;
  createdAt: number;
}

const IDEAL_PURPOSE_PRESETS: PurposePreset[] = [
  // Ideal Mockups & Showcase
  {
    id: 'dribbble-std',
    name: 'Dribbble Shot Standard',
    category: 'Ideal Mockup',
    width: 1600,
    height: 1200,
    ratio: '4:3',
    idealFor: 'Standard Dribbble portfolio post',
  },
  {
    id: 'dribbble-hd',
    name: 'Dribbble 2K Retina',
    category: 'Ideal Mockup',
    width: 2800,
    height: 2100,
    ratio: '4:3',
    idealFor: 'Ultra-crisp high density Dribbble showcase',
  },
  {
    id: 'behance-cover',
    name: 'Behance Project Cover',
    category: 'Showcase',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    idealFor: 'High-impact Behance project presentation',
  },
  {
    id: 'behance-4k',
    name: 'Behance 4K Master',
    category: 'Showcase',
    width: 3840,
    height: 2100,
    ratio: '16:9',
    idealFor: 'Ultra-HD portfolio case study',
  },
  {
    id: 'producthunt',
    name: 'Product Hunt Gallery',
    category: 'Showcase',
    width: 1270,
    height: 760,
    ratio: '1.67:1',
    idealFor: 'Optimal launch day product mockup gallery',
  },
  // Social Media
  {
    id: 'ig-square',
    name: 'Instagram Square Post',
    category: 'Social',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    idealFor: 'Standard square Instagram grid presentation',
  },
  {
    id: 'ig-portrait',
    name: 'Instagram Portrait Carousel',
    category: 'Social',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    idealFor: 'High engagement vertical mobile carousel',
  },
  {
    id: 'story-reel',
    name: 'Story / Reel / TikTok',
    category: 'Social',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    idealFor: 'Full-screen 9:16 vertical smartphone presentation',
  },
  {
    id: 'twitter-card',
    name: 'Twitter / X Post Card',
    category: 'Social',
    width: 1200,
    height: 675,
    ratio: '16:9',
    idealFor: 'High-conversion Twitter / X feed card',
  },
  {
    id: 'twitter-header',
    name: 'Twitter / X Profile Header',
    category: 'Social',
    width: 1500,
    height: 500,
    ratio: '3:1',
    idealFor: 'Panoramic brand banner',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Feed Banner',
    category: 'Social',
    width: 1200,
    height: 627,
    ratio: '1.91:1',
    idealFor: 'Professional network case study card',
  },
  // Display & Prepress Master
  {
    id: 'uhd-4k',
    name: '4K Ultra-HD Display',
    category: 'Display',
    width: 3840,
    height: 2160,
    ratio: '16:9',
    idealFor: '4K wallpaper & client display presentation',
  },
  {
    id: 'qhd-2k',
    name: '2K QHD Display',
    category: 'Display',
    width: 2560,
    height: 1440,
    ratio: '16:9',
    idealFor: 'High-resolution desktop monitor showcase',
  },
  {
    id: 'fhd-1080',
    name: 'Full HD 1080p',
    category: 'Display',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    idealFor: 'Standard 1080p desktop slide graphics',
  },
  {
    id: 'print-300dpi',
    name: '300 DPI Prepress Master',
    category: 'Master',
    width: 3600,
    height: 2400,
    ratio: '3:2',
    idealFor: 'Museum-grade industrial physical print',
  },
];

const LOCAL_STORAGE_CUSTOM_RESOLUTIONS_KEY = 'nedject_saved_custom_mockup_resolutions';

export default function MochupPage() {
  // =========================================================================
  // 1. SCREEN RESOLUTION (Preview Display Viewport: 100vw × 100vh)
  // =========================================================================
  const [screenResolution, setScreenResolution] = useState<{ width: number; height: number }>({
    width: 1920,
    height: 1080,
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [screenScale, setScreenScale] = useState<number>(1.0);
  const [screenMode, setScreenMode] = useState<'fit' | '100vw-100vh' | 'expanded'>('100vw-100vh');

  // Track live client screen resolution safely on mount & resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScreenSize = () => {
      setScreenResolution({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // =========================================================================
  // 2. PURPOSE RESOLUTION FOR DOWNLOAD (Presets + Custom + Saved Customs)
  // =========================================================================
  const [selectedPurposeId, setSelectedPurposeId] = useState<string>('dribbble-std');
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [aspectRatioLock, setAspectRatioLock] = useState<AspectRatioOption>('16:9');
  const [customPresetName, setCustomPresetName] = useState<string>('');
  const [savedCustoms, setSavedCustoms] = useState<SavedCustomResolution[]>([]);
  const [framingMode, setFramingMode] = useState<FramingMode>('contain');

  // Export Target & File Format
  const [exportTarget, setExportTarget] = useState<ExportTarget>('scene');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');

  // Load Saved Custom Resolutions from localStorage safely after mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_RESOLUTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedCustoms(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading saved custom resolutions from localStorage:', e);
    }
  }, []);

  // Save a new custom resolution to localStorage
  const handleSaveCustomResolution = () => {
    if (customWidth <= 0 || customHeight <= 0) return;
    const name = customPresetName.trim() || `Custom ${customWidth}×${customHeight}`;
    const newPreset: SavedCustomResolution = {
      id: `custom-${Date.now()}`,
      name,
      width: customWidth,
      height: customHeight,
      ratio: aspectRatioLock === 'free' ? `${customWidth}:${customHeight}` : aspectRatioLock,
      createdAt: Date.now(),
    };

    const updated = [newPreset, ...savedCustoms.filter((item) => item.width !== customWidth || item.height !== customHeight)];
    setSavedCustoms(updated);
    setCustomPresetName('');

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_RESOLUTIONS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save custom resolution to localStorage:', e);
      }
    }
  };

  // Delete a saved custom resolution
  const handleDeleteCustomResolution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCustoms.filter((item) => item.id !== id);
    setSavedCustoms(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_RESOLUTIONS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to delete custom resolution from localStorage:', e);
      }
    }
  };

  // Compute active target download dimensions based on user's selected purpose
  const getActivePurposeDimensions = (): { width: number; height: number; ratio: string; label: string } => {
    if (selectedPurposeId === 'custom') {
      return {
        width: Math.max(100, customWidth),
        height: Math.max(100, customHeight),
        ratio: aspectRatioLock === 'free' ? `${customWidth}:${customHeight}` : aspectRatioLock,
        label: `Custom (${customWidth} × ${customHeight} px)`,
      };
    }

    if (selectedPurposeId === 'screen-native') {
      return {
        width: screenResolution.width,
        height: screenResolution.height,
        ratio: '100vw × 100vh',
        label: `Screen Native (${screenResolution.width} × ${screenResolution.height} px)`,
      };
    }

    // Check saved custom resolutions
    const savedMatch = savedCustoms.find((p) => p.id === selectedPurposeId);
    if (savedMatch) {
      return {
        width: savedMatch.width,
        height: savedMatch.height,
        ratio: savedMatch.ratio,
        label: `${savedMatch.name} (${savedMatch.width} × ${savedMatch.height} px)`,
      };
    }

    // Check default ideal purpose presets
    const preset = IDEAL_PURPOSE_PRESETS.find((p) => p.id === selectedPurposeId) || IDEAL_PURPOSE_PRESETS[0];
    return {
      width: preset.width,
      height: preset.height,
      ratio: preset.ratio,
      label: `${preset.name} (${preset.width} × ${preset.height} px)`,
    };
  };

  // Handle Width change with Aspect Ratio Lock calculation
  const handleWidthChange = (val: number) => {
    setCustomWidth(val);
    if (aspectRatioLock !== 'free' && val > 0) {
      const [rw, rh] = parseRatio(aspectRatioLock);
      if (rw && rh) {
        setCustomHeight(Math.round((val * rh) / rw));
      }
    }
  };

  // Handle Height change with Aspect Ratio Lock calculation
  const handleHeightChange = (val: number) => {
    setCustomHeight(val);
    if (aspectRatioLock !== 'free' && val > 0) {
      const [rw, rh] = parseRatio(aspectRatioLock);
      if (rw && rh) {
        setCustomWidth(Math.round((val * rw) / rh));
      }
    }
  };

  const handleRatioLockChange = (ratio: AspectRatioOption) => {
    setAspectRatioLock(ratio);
    if (ratio !== 'free') {
      const [rw, rh] = parseRatio(ratio);
      if (rw && rh && customWidth > 0) {
        setCustomHeight(Math.round((customWidth * rh) / rw));
      }
    }
  };

  function parseRatio(ratioStr: string): [number, number] {
    if (ratioStr === '16:9') return [16, 9];
    if (ratioStr === '4:3') return [4, 3];
    if (ratioStr === '1:1') return [1, 1];
    if (ratioStr === '9:16') return [9, 16];
    if (ratioStr === '4:5') return [4, 5];
    if (ratioStr === '3:2') return [3, 2];
    if (ratioStr === '21:9') return [21, 9];
    return [1, 1];
  }

  // =========================================================================
  // 3. MOCKUP WORKSPACE & SCENE STATE
  // =========================================================================
  const [activeScene, setActiveScene] = useState<SceneMode>('trio');

  // Website Source: Template (Website Itself) vs Custom URL vs Upload
  const [sourceType, setSourceType] = useState<'url' | 'upload' | 'template'>('template');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string>('');
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);

  // Preview Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [previewReady, setPreviewReady] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'snapshot' | 'interactive'>('snapshot');

  // Single Device Controls
  const [selectedDevice, setSelectedDevice] = useState<MockupDevice>(MOCKUP_DEVICES[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [bezelStyle, setBezelStyle] = useState<'chassis' | 'minimal' | 'frameless'>('chassis');
  const [chassisColor, setChassisColor] = useState<'space-black' | 'titanium' | 'silver' | 'gold'>('space-black');
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Scene Appearance Controls (Nedject Industrial Theme)
  const [backdropTheme, setBackdropTheme] = useState<'dark' | 'volt' | 'concrete' | 'white' | 'transparent'>('dark');
  const [shadowIntensity, setShadowIntensity] = useState<number>(1.0);
  const [reflectionEnabled, setReflectionEnabled] = useState<boolean>(true);

  // Export Modal & Download Action State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [downloadPreviewUrl, setDownloadPreviewUrl] = useState<string | null>(null);
  const [readyDownload, setReadyDownload] = useState<{ url: string; filename: string; format: string; width: number; height: number } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL Submission Pipeline
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

  // Clipboard Paste listener (Ctrl+V)
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

  const getBackdropHex = (theme: string): string => {
    switch (theme) {
      case 'volt':
        return '#ccff00';
      case 'concrete':
        return '#e2e2dc';
      case 'white':
        return '#ffffff';
      case 'transparent':
        return 'transparent';
      case 'dark':
      default:
        return '#121316';
    }
  };

  // =========================================================================
  // 4. DOWNLOAD EXPORT ENGINE (Render to Exact Purpose Resolution)
  // =========================================================================
  const handleGenerateDownload = async (directDownload = false) => {
    // 1. Identify which target mockup element to capture
    let targetId = 'mockup-export-target';
    if (exportTarget === 'desktop') targetId = 'mockup-target-desktop';
    if (exportTarget === 'tablet') targetId = 'mockup-target-tablet';
    if (exportTarget === 'mobile') targetId = 'mockup-target-mobile';

    let target = document.getElementById(targetId);
    if (!target) {
      target = document.getElementById('mockup-export-target');
    }
    if (!target) {
      setExportError('Export target container not found on active screen.');
      return;
    }

    const { width: targetWidth, height: targetHeight, ratio: activeRatio } = getActivePurposeDimensions();

    try {
      setIsExporting(true);
      setExportError(null);
      setExportProgress(`Capturing ${exportTarget.toUpperCase()} into ${targetWidth} × ${targetHeight} px (${activeRatio})...`);

      // High-resolution source capture via html-to-image
      const sourceCanvas = await toCanvas(target, {
        pixelRatio: 2.0,
        skipFonts: true,
        fontEmbedCSS: '',
        cacheBust: true,
        backgroundColor: exportFormat === 'jpeg' ? getBackdropHex(backdropTheme) : undefined,
      });

      setExportProgress(`Rendering Purpose Resolution: ${targetWidth} × ${targetHeight} px canvas...`);

      // Create Purpose Canvas with the user's exact requested dimensions
      const purposeCanvas = document.createElement('canvas');
      purposeCanvas.width = targetWidth;
      purposeCanvas.height = targetHeight;
      const ctx = purposeCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D rendering context unavailable.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill backdrop
      if (exportFormat === 'jpeg' || backdropTheme !== 'transparent') {
        ctx.fillStyle = getBackdropHex(backdropTheme);
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // Framing: Contain (default with subtle padding) or Cover (fill frame)
      if (framingMode === 'cover') {
        const scale = Math.max(targetWidth / sourceCanvas.width, targetHeight / sourceCanvas.height);
        const drawW = sourceCanvas.width * scale;
        const drawH = sourceCanvas.height * scale;
        const offsetX = (targetWidth - drawW) / 2;
        const offsetY = (targetHeight - drawH) / 2;
        ctx.drawImage(sourceCanvas, offsetX, offsetY, drawW, drawH);
      } else {
        // Contain mode with 92% aesthetic breathing room
        const scale = Math.min((targetWidth * 0.92) / sourceCanvas.width, (targetHeight * 0.92) / sourceCanvas.height);
        const drawW = sourceCanvas.width * scale;
        const drawH = sourceCanvas.height * scale;
        const offsetX = (targetWidth - drawW) / 2;
        const offsetY = (targetHeight - drawH) / 2;
        ctx.drawImage(sourceCanvas, offsetX, offsetY, drawW, drawH);
      }

      setExportProgress(`Encoding ${exportFormat.toUpperCase()} binary blob...`);

      const cleanHost = submittedUrl ? submittedUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-') : 'nedject';
      const filename = `nedject-mockup-${exportTarget}-${cleanHost}-${targetWidth}x${targetHeight}.${exportFormat}`;

      let blobUrl = '';

      if (exportFormat === 'svg') {
        const pngData = purposeCanvas.toDataURL('image/png');
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
  <rect width="100%" height="100%" fill="${backdropTheme === 'transparent' ? 'none' : getBackdropHex(backdropTheme)}"/>
  <image href="${pngData}" width="${targetWidth}" height="${targetHeight}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        blobUrl = URL.createObjectURL(svgBlob);
      } else {
        const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
        const blob = await new Promise<Blob | null>((resolve) => {
          purposeCanvas.toBlob(resolve, mimeType, 0.96);
        });

        if (!blob) throw new Error('Failed to create image blob.');
        blobUrl = URL.createObjectURL(blob);
      }

      setDownloadPreviewUrl(blobUrl);
      setReadyDownload({
        url: blobUrl,
        filename,
        format: exportFormat.toUpperCase(),
        width: targetWidth,
        height: targetHeight,
      });

      if (directDownload) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setExportProgress('Purpose Resolution mockup preview ready for download!');
      setIsExporting(false);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsExporting(false);
      setExportProgress('');
      setExportError(err?.message || 'Failed to rasterize mockup at selected resolution.');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Universal content renderer for device viewports
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
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      </div>
    );
  }, [sourceType, uploadedScreenshot, selectedTemplate, renderMode, submittedUrl]);

  const activePurpose = getActivePurposeDimensions();

  return (
    <div className="min-h-screen w-screen bg-[#0a0b0e] text-zinc-100 font-sans flex flex-col selection:bg-[#ccff00] selection:text-black overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* TOP HEADER: BRAND + SCREEN RESOLUTION (100vw × 100vh) STATUS BAR   */}
      {/* =================================================================== */}
      <header className="border-b-2 border-black bg-[#121316] text-white px-4 py-2.5 select-none z-30 font-mono">
        <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-black text-[#ccff00] px-2.5 py-1 border-2 border-black font-black text-xs flex items-center gap-1.5 hover:bg-[#ccff00] hover:text-black transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>NEDJECT</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white uppercase">
                Website Mockup Studio
              </span>
              
              {/* Screen Resolution live badge (100vh × 100vw) */}
              <div
                className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-black border border-[#ccff00]/40 rounded text-[10px] font-mono"
                title="Current Screen Resolution (Always rendered in 100vw × 100vh)"
              >
                <Monitor className="w-3 h-3 text-[#ccff00]" />
                <span className="text-zinc-400">SCREEN:</span>
                <span className="text-[#ccff00] font-black">{screenResolution.width} × {screenResolution.height} px</span>
                <span className="text-zinc-500">(100vw × 100vh)</span>
              </div>
            </div>
          </div>

          {/* Screen Display Mode & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Screen Zoom Scale Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-black border border-zinc-700 rounded px-1.5 py-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setScreenScale((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(1))))}
                className="p-1 text-zinc-400 hover:text-white"
                title="Zoom Out Screen View"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="px-1 text-zinc-300 font-bold text-[10px] w-9 text-center">
                {Math.round(screenScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScreenScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(1))))}
                className="p-1 text-zinc-400 hover:text-white"
                title="Zoom In Screen View"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setScreenScale(1.0)}
                className="ml-1 text-[9px] text-[#ccff00] hover:underline uppercase font-bold"
              >
                RESET
              </button>
            </div>

            {/* Fullscreen 100vw × 100vh Toggle */}
            <button
              onClick={toggleFullscreen}
              className="px-2.5 py-1.5 border-2 border-black bg-black hover:bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Browser 100vw × 100vh Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#ccff00]" /> : <Maximize2 className="w-3.5 h-3.5 text-[#ccff00]" />}
              <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULLSCREEN' : '100% FULLSCREEN'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 border-2 border-black bg-black hover:bg-zinc-800 text-zinc-200 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Share2 className="w-3.5 h-3.5 text-zinc-400" />}
              <span className="hidden sm:inline">{copiedLink ? 'COPIED' : 'SHARE'}</span>
            </button>

            {/* Download Mockup Button */}
            <button
              onClick={() => {
                setShowExportModal(true);
                handleGenerateDownload(false);
              }}
              className="px-3.5 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-white text-black font-black text-xs flex items-center gap-2 transition-all shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD MOCKUP</span>
            </button>
          </div>

        </div>
      </header>

      {/* =================================================================== */}
      {/* URL / SOURCE CAPTURE INPUT BAR                                     */}
      {/* =================================================================== */}
      <div className="border-b-2 border-black bg-[#16171b] px-4 py-2.5 select-none z-20 font-mono text-xs">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
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
                className="flex-1 bg-transparent py-2 pr-3 text-xs text-white font-mono focus:outline-none placeholder:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded-lg transition-all border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
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
              className="px-3 py-2 bg-black hover:bg-zinc-800 text-zinc-200 font-bold text-xs rounded-lg border-2 border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Upload your own screenshot or paste image with Ctrl+V"
            >
              <Upload className="w-3.5 h-3.5 text-[#ccff00]" />
              <span className="hidden sm:inline">UPLOAD</span>
            </button>

            {sourceType !== 'template' && (
              <button
                type="button"
                onClick={() => {
                  setSourceType('template');
                  setSelectedTemplate(WEBSITE_TEMPLATES[0]);
                  setWebsiteUrl('');
                  setSubmittedUrl('');
                }}
                className="px-3 py-2 bg-black hover:bg-zinc-800 text-[#ccff00] font-bold text-xs rounded-lg border-2 border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Reset to default website itself"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="hidden sm:inline">WEBSITE ITSELF</span>
              </button>
            )}
          </form>

          {/* Quick Purpose Resolution Trigger Pill */}
          <button
            onClick={() => {
              setShowExportModal(true);
              handleGenerateDownload(false);
            }}
            className="flex items-center gap-2 bg-black border border-zinc-700 hover:border-[#ccff00] px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer group"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#ccff00] group-hover:rotate-45 transition-transform" />
            <div>
              <div className="text-[10px] text-zinc-400 font-mono">PURPOSE RESOLUTION:</div>
              <div className="text-[11px] font-black text-white group-hover:text-[#ccff00]">
                {activePurpose.label}
              </div>
            </div>
          </button>

        </div>

        {/* Live Generation Pipeline Feedback */}
        {isGenerating && (
          <div className="w-full max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-300">
            <span className="text-[#ccff00] font-black">PIPELINE:</span>
            <span>{generationStep}</span>
          </div>
        )}

        {/* Website Itself Indicator */}
        {!isGenerating && sourceType === 'template' && (
          <div className="w-full max-w-7xl mx-auto mt-2 pt-1.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
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
          <div className="w-full max-w-7xl mx-auto mt-2 pt-1.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
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

      {/* =================================================================== */}
      {/* SCENE SWITCHER & CANVAS TOOLBAR                                    */}
      {/* =================================================================== */}
      <div className="border-b-2 border-black bg-[#101114] px-4 py-2 font-mono text-xs select-none">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Scene Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 font-bold uppercase text-[11px] mr-1">SCENE:</span>
            
            <button
              onClick={() => {
                setActiveScene('trio');
                setBackdropTheme('dark');
              }}
              className={`px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeScene === 'single'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Single Device Studio</span>
            </button>
          </div>

          {/* Backdrop & Live Screen Status */}
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
              onClick={() => {
                setShowExportModal(true);
                handleGenerateDownload(false);
              }}
              className="px-3 py-1 bg-[#ccff00] text-black font-black text-xs rounded border border-black hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <Download className="w-3 h-3" />
              <span>EXPORT RESOLUTION</span>
            </button>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* MAIN SCREEN CANVAS: ALWAYS SET IN 100vw × 100vh VIEWPORT PRESENCE    */}
      {/* =================================================================== */}
      <main
        className="flex-1 w-full min-h-[calc(100vh-160px)] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-auto select-none"
        style={{
          transform: screenScale !== 1.0 ? `scale(${screenScale})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
        }}
      >
        
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

        {/* SCENE 4: RESPONSIVE MATRIX */}
        {activeScene === 'matrix' && (
          <div id="mockup-export-target" className="w-full max-w-6xl mx-auto p-4 sm:p-8 bg-[#0c0d10] rounded-2xl border-2 border-black">
            <div className="text-center mb-6 font-mono text-xs text-[#ccff00] font-black uppercase tracking-wider">
              SIMULTANEOUS MULTI-DEVICE RESPONSIVE AUDIT MATRIX
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 overflow-x-auto pb-4">
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

      {/* =================================================================== */}
      {/* FLOATING STICKY ACTION BAR: SCREEN RES + PURPOSE RES STATUS         */}
      {/* =================================================================== */}
      <footer className="border-t-2 border-black bg-[#121316] px-4 py-2.5 font-mono text-xs text-zinc-400 select-none sticky bottom-0 z-30">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Screen:</span>
              <span className="text-[#ccff00] font-black">{screenResolution.width} × {screenResolution.height} px (100vw × 100vh)</span>
            </div>
            <span className="text-zinc-600 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-zinc-400">Export Purpose:</span>
              <span className="text-white font-bold">{activePurpose.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowExportModal(true);
                handleGenerateDownload(false);
              }}
              className="px-4 py-2 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded border-2 border-black transition-all flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CONFIGURE PURPOSE RESOLUTION &amp; DOWNLOAD</span>
            </button>
          </div>

        </div>
      </footer>

      {/* =================================================================== */}
      {/* PURPOSE RESOLUTION FOR DOWNLOAD MODAL (Presets, Customs & Saved)    */}
      {/* =================================================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-mono select-none overflow-y-auto">
          <div className="bg-[#121316] border-2 border-black rounded-xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-black border border-[#ccff00] rounded">
                  <Download className="w-4 h-4 text-[#ccff00]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Purpose Download Resolution Matrix
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Live Screen is 100vw × 100vh. Decide your target purpose resolution, aspect ratio, or save custom dimensions below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setReadyDownload(null);
                  setExportError(null);
                }}
                className="text-zinc-400 hover:text-white text-base font-bold px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 bg-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto pr-1 py-4 space-y-6 flex-1 text-xs">
              
              {/* SECTION A: TWO CORE RESOLUTIONS SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-black border border-zinc-800 rounded-lg">
                <div className="flex items-start gap-2.5">
                  <Monitor className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">1. Active Screen Resolution (Display Viewport):</div>
                    <div className="text-white font-black text-sm">
                      {screenResolution.width} × {screenResolution.height} px <span className="text-[#ccff00] text-xs font-mono font-bold">(100vw × 100vh)</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">Live preview canvas scales automatically to fill 100% of your monitor.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-3">
                  <Ratio className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">2. Selected Purpose Resolution (For Download):</div>
                    <div className="text-[#ccff00] font-black text-sm">
                      {activePurpose.width} × {activePurpose.height} px <span className="text-white text-xs font-mono font-bold">({activePurpose.ratio})</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">{activePurpose.label} • {exportFormat.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* SECTION B: WHICH MOCKUP DEVICE TO EXPORT */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>Step 1: Which Mockup or Scene to Capture:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'scene', label: 'Entire Scene', sub: `${activeScene.toUpperCase()} 3D Studio` },
                    { id: 'desktop', label: 'Desktop Only', sub: 'MacBook Pro Mockup' },
                    { id: 'tablet', label: 'Tablet Only', sub: 'iPad Pro Mockup' },
                    { id: 'mobile', label: 'Mobile Only', sub: 'iPhone 16 Pro Mockup' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setExportTarget(item.id as ExportTarget);
                        setReadyDownload(null);
                      }}
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

              {/* SECTION C: PURPOSE RESOLUTION PRESETS (Ideal Mockups, Social, Display) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span>Step 2: Choose Purpose Download Resolution:</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Presets calibrated for high impact</span>
                </div>

                {/* Preset Chips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  
                  {/* Option: Current Screen Resolution (100vw × 100vh) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPurposeId('screen-native');
                      setReadyDownload(null);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedPurposeId === 'screen-native'
                        ? 'bg-[#ccff00] text-black border-black font-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Current Screen Resolution</span>
                      <span className="text-[9px] px-1 py-0.2 bg-zinc-800 rounded font-bold">100vw × 100vh</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {screenResolution.width} × {screenResolution.height} px • Exact Native Monitor
                    </div>
                  </button>

                  {/* Standard Ideal Mockup Presets */}
                  {IDEAL_PURPOSE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPurposeId(preset.id);
                        setReadyDownload(null);
                      }}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedPurposeId === preset.id
                          ? 'bg-[#ccff00] text-black border-black font-black shadow-[2px_2px_0px_#000000]'
                          : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black leading-tight">{preset.name}</span>
                        <span className="text-[9px] px-1 py-0.2 bg-zinc-800 rounded font-bold">{preset.ratio}</span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        {preset.width} × {preset.height} px • {preset.idealFor}
                      </div>
                    </button>
                  ))}

                  {/* Custom Resolution Selector Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPurposeId('custom');
                      setReadyDownload(null);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedPurposeId === 'custom'
                        ? 'bg-[#ccff00] text-black border-black font-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#ccff00] group-hover:text-black">
                        Custom Download Resolution
                      </span>
                      <span className="text-[9px] px-1 py-0.2 bg-zinc-800 rounded font-bold">User Input</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      Specify exact W × H, lock aspect ratio, &amp; save preset
                    </div>
                  </button>

                </div>
              </div>

              {/* SECTION D: CUSTOM DOWNLOAD RATIO & RESOLUTION (WITH PERSISTENT SAVE) */}
              <div className="p-4 bg-black border-2 border-zinc-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-[#ccff00]" />
                    <span className="font-black text-white uppercase text-xs">
                      Custom Download Resolution &amp; Ratio Configuration
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Dimensions and ratios persist automatically to your browser
                  </span>
                </div>

                {/* Aspect Ratio Lock Pills */}
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold mb-1.5 uppercase">
                    Lock Aspect Ratio (Auto-computes Width/Height):
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['16:9', '4:3', '1:1', '9:16', '4:5', '3:2', '21:9', 'free'] as AspectRatioOption[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => handleRatioLockChange(ratio)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                          aspectRatioLock === ratio
                            ? 'bg-[#ccff00] text-black border-black font-black'
                            : 'bg-[#121316] text-zinc-400 border-zinc-700 hover:text-white'
                        }`}
                      >
                        {ratio === 'free' ? 'Freeform (Unlocked)' : ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width & Height Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                      Target Width (Pixels):
                    </label>
                    <div className="flex items-center bg-[#121316] border border-zinc-700 rounded-lg px-3 py-1.5 focus-within:border-[#ccff00]">
                      <input
                        type="number"
                        min={100}
                        max={10000}
                        value={customWidth}
                        onChange={(e) => {
                          setSelectedPurposeId('custom');
                          handleWidthChange(Number(e.target.value));
                        }}
                        className="bg-transparent w-full text-white font-mono font-bold focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono">PX</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                      Target Height (Pixels):
                    </label>
                    <div className="flex items-center bg-[#121316] border border-zinc-700 rounded-lg px-3 py-1.5 focus-within:border-[#ccff00]">
                      <input
                        type="number"
                        min={100}
                        max={10000}
                        value={customHeight}
                        onChange={(e) => {
                          setSelectedPurposeId('custom');
                          handleHeightChange(Number(e.target.value));
                        }}
                        className="bg-transparent w-full text-white font-mono font-bold focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono">PX</span>
                    </div>
                  </div>
                </div>

                {/* Save Custom Resolution Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-zinc-800">
                  <div className="flex-1 flex items-center bg-[#121316] border border-zinc-700 rounded-lg px-3 py-1.5 focus-within:border-[#ccff00]">
                    <Bookmark className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={customPresetName}
                      onChange={(e) => setCustomPresetName(e.target.value)}
                      placeholder={`Name this custom ratio (e.g. "Hero Banner ${customWidth}x${customHeight}")`}
                      className="bg-transparent w-full text-white text-xs font-mono focus:outline-none placeholder:text-zinc-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCustomResolution}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-[#ccff00] hover:text-black text-white font-bold text-xs rounded-lg border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>SAVE CUSTOM PRESET</span>
                  </button>
                </div>

                {/* Saved Customs List */}
                {savedCustoms.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                      Your Saved Custom Resolutions:
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {savedCustoms.map((saved) => (
                        <div
                          key={saved.id}
                          onClick={() => {
                            setSelectedPurposeId(saved.id);
                            setCustomWidth(saved.width);
                            setCustomHeight(saved.height);
                            setReadyDownload(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            selectedPurposeId === saved.id
                              ? 'bg-[#ccff00] text-black border-black font-black'
                              : 'bg-[#121316] text-zinc-300 border-zinc-700 hover:border-zinc-500'
                          }`}
                        >
                          <span className="font-bold">{saved.name}</span>
                          <span className="text-[10px] opacity-75">
                            ({saved.width} × {saved.height} • {saved.ratio})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomResolution(saved.id, e)}
                            className="p-0.5 hover:text-rose-400 text-zinc-500 ml-0.5 cursor-pointer"
                            title="Delete custom preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* SECTION E: FRAMING FIT & FILE FORMATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Framing Mode */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1.5">
                    Framing within Target Resolution:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFramingMode('contain')}
                      className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        framingMode === 'contain'
                          ? 'bg-[#ccff00] text-black border-black font-black'
                          : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">Contain (Centered)</div>
                      <div className="text-[10px] opacity-75">Full mockup visible with studio backdrop</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFramingMode('cover')}
                      className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        framingMode === 'cover'
                          ? 'bg-[#ccff00] text-black border-black font-black'
                          : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">Cover (Tight Crop)</div>
                      <div className="text-[10px] opacity-75">Scales to fill entire download bounds</div>
                    </button>
                  </div>
                </div>

                {/* File Format */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1.5">
                    Download File Format:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'png', label: 'PNG', note: 'Lossless' },
                      { id: 'jpeg', label: 'JPEG', note: 'Photo 95%' },
                      { id: 'webp', label: 'WEBP', note: 'Web Modern' },
                      { id: 'svg', label: 'SVG', note: 'Vector' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => {
                          setExportFormat(fmt.id as ExportFormat);
                          setReadyDownload(null);
                        }}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
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

              </div>

              {/* SECTION F: DOWNLOAD PREVIEW & GENERATE PIPELINE */}
              {isExporting && (
                <div className="flex items-center gap-2.5 text-xs text-[#ccff00] p-3.5 bg-black border border-[#ccff00]/40 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-[#ccff00] shrink-0" />
                  <span>{exportProgress}</span>
                </div>
              )}

              {readyDownload && !isExporting && (
                <div className="p-4 bg-emerald-950/70 border-2 border-emerald-500 rounded-xl text-emerald-200">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#ccff00]" />
                      <span className="font-black text-xs uppercase text-white">
                        Purpose Mockup Calibrated: {readyDownload.width} × {readyDownload.height} px
                      </span>
                    </div>
                    <span className="text-[10px] bg-black text-[#ccff00] px-2 py-0.5 rounded border border-emerald-600 font-mono font-bold">
                      {readyDownload.format} READY
                    </span>
                  </div>

                  {downloadPreviewUrl && (
                    <div className="my-3 bg-black/60 rounded-lg p-2 border border-emerald-600/40 flex justify-center">
                      <img
                        src={downloadPreviewUrl}
                        alt="Download Ready Preview"
                        className="max-h-56 max-w-full rounded object-contain border border-zinc-800 shadow-md"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <a
                      href={readyDownload.url}
                      download={readyDownload.filename}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ccff00] text-black font-black text-xs rounded-lg border-2 border-black hover:bg-white shadow-[2px_2px_0px_#000000] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>CLICK TO SAVE {readyDownload.format} ({readyDownload.width} × {readyDownload.height} PX)</span>
                    </a>

                    <a
                      href={readyDownload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-black text-zinc-300 font-bold text-xs rounded-lg border border-zinc-700 hover:text-white flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OPEN FULL-RES IMAGE</span>
                    </a>
                  </div>
                </div>
              )}

              {exportError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-lg text-rose-300 text-xs">
                  <strong>Export Notification:</strong> {exportError}
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-zinc-400">
                Target: <span className="text-white font-bold">{exportTarget.toUpperCase()}</span> • Purpose:{' '}
                <span className="text-[#ccff00] font-bold">{activePurpose.width} × {activePurpose.height} px</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExportModal(false);
                    setReadyDownload(null);
                    setExportError(null);
                  }}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                >
                  CLOSE
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateDownload(false)}
                  disabled={isExporting}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg border border-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>PREVIEW PURPOSE RESOLUTION</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateDownload(true)}
                  disabled={isExporting}
                  className="px-5 py-2 bg-[#ccff00] hover:bg-white text-black font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>CALIBRATING...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>DOWNLOAD {exportFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
