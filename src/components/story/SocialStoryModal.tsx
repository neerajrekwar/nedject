'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  X,
  Layers,
  Code2,
  ExternalLink,
  Camera,
  QrCode,
  Palette,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

export interface SocialStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle?: string;
  pageUrl?: string;
  pageDescription?: string;
  category?: string;
}

export type StoryTheme = 'neo-brutalist' | 'cyber-dark' | 'glass-cyan' | 'minimal-light';

export const SocialStoryModal: React.FC<SocialStoryModalProps> = ({
  isOpen,
  onClose,
  pageTitle: initialTitle,
  pageUrl: initialUrl,
  pageDescription: initialDesc,
  category = 'TOOL // NEDJECT',
}) => {
  const [title, setTitle] = useState(initialTitle || 'Nedject - 300 DPI Photo QR Studio');
  const [url, setUrl] = useState(initialUrl || 'https://nedject.com');
  const [description, setDescription] = useState(
    initialDesc || 'Ultra-crisp 300 DPI Photo QR codes, vector barcode engine, and telemetry analytics.'
  );
  const [theme, setTheme] = useState<StoryTheme>('neo-brutalist');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWebStoryCode, setCopiedWebStoryCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'vector' | 'webstory'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-detect current page URL and title on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = initialUrl || window.location.href;
      const currentTitle = initialTitle || document.title || 'Nedject - 300 DPI Photo QR Studio';
      const metaDesc =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        initialDesc ||
        'Ultra-crisp 300 DPI Photo QR codes and vector barcodes.';

      setUrl(currentUrl);
      setTitle(currentTitle);
      setDescription(metaDesc);
    }
  }, [initialTitle, initialUrl, initialDesc, isOpen]);

  // Generate QR code for the current URL
  useEffect(() => {
    if (!url) return;

    // High quality QR Code data URL
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 480,
      color: {
        dark: theme === 'cyber-dark' || theme === 'glass-cyan' ? '#000000' : '#000000',
        light: '#ffffff',
      },
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => console.error('[Story] QR code error:', err));

    // Vector SVG representation
    QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((svg) => {
        setQrSvgString(svg);
      })
      .catch((err) => console.error('[Story] SVG QR code error:', err));
  }, [url, theme]);

  // Draw 1080x1920 9:16 vertical canvas for export
  useEffect(() => {
    if (!canvasRef.current || !qrDataUrl) return;

    const canvas = canvasRef.current;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Theme backgrounds & accents
    if (theme === 'neo-brutalist') {
      // Bold Neo-Brutalist Lime & Yellow Split
      ctx.fillStyle = '#fafaf5';
      ctx.fillRect(0, 0, 1080, 1920);

      // Top Header Block
      ctx.fillStyle = '#ccff00';
      ctx.fillRect(0, 0, 1080, 240);
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(0, 0, 1080, 240);

      // Dot grid pattern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      for (let x = 60; x < 1080; x += 60) {
        for (let y = 300; y < 1920; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (theme === 'cyber-dark') {
      // Dark Obsidian Cyberpunk
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 1080, 1920);

      // Neon grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 1080; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1920);
        ctx.stroke();
      }
      for (let y = 0; y <= 1920; y += 120) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }

      // Glowing Cyber Header
      const grad = ctx.createLinearGradient(0, 0, 1080, 300);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(1, '#818cf8');
      ctx.fillStyle = grad;
      ctx.fillRect(60, 80, 960, 16);
    } else if (theme === 'glass-cyan') {
      // Radiant Cyan Ocean
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#082f49');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Cyber circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(900, 300, 320, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Minimal Light Paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 1000, 1840);
    }

    // Top Brand Badge
    ctx.font = '900 36px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = theme === 'cyber-dark' || theme === 'glass-cyan' ? '#38bdf8' : '#000000';
    ctx.fillText('NEDJECT // INSTAGRAM STORY & WEB CARD', 80, 150);

    // Category pill
    ctx.fillStyle = theme === 'neo-brutalist' ? '#000000' : '#ccff00';
    ctx.fillRect(80, 280, 360, 60);
    ctx.font = '900 28px monospace';
    ctx.fillStyle = theme === 'neo-brutalist' ? '#ccff00' : '#000000';
    ctx.fillText(category.toUpperCase(), 104, 322);

    // Page Title
    ctx.font = '900 68px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'cyber-dark' || theme === 'glass-cyan' ? '#ffffff' : '#000000';
    const words = title.split(' ');
    let line = '';
    let y = 430;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 920 && n > 0) {
        ctx.fillText(line.trim(), 80, y);
        line = words[n] + ' ';
        y += 84;
        if (y > 640) break; // limit lines
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 80, y);

    // Page Description
    ctx.font = '500 34px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'cyber-dark' || theme === 'glass-cyan' ? '#94a3b8' : '#52525b';
    const descWords = description.split(' ');
    let descLine = '';
    let descY = y + 70;
    for (let i = 0; i < descWords.length; i++) {
      const test = descLine + descWords[i] + ' ';
      if (ctx.measureText(test).width > 920 && i > 0) {
        ctx.fillText(descLine.trim(), 80, descY);
        descLine = descWords[i] + ' ';
        descY += 48;
        if (descY > y + 170) break;
      } else {
        descLine = test;
      }
    }
    ctx.fillText(descLine.trim(), 80, descY);

    // Center Card for QR Code (Neo-Brutalist Frame)
    const cardY = 820;
    const cardW = 920;
    const cardH = 820;
    const cardX = (1080 - cardW) / 2;

    // Shadow
    ctx.fillStyle = '#000000';
    ctx.fillRect(cardX + 24, cardY + 24, cardW, cardH);

    // Card Body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Quiet Zone corner markers
    ctx.font = '700 24px monospace';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('┌ QUIET ZONE 300 DPI', cardX + 32, cardY + 54);
    ctx.fillText('SCAN VERIFIED ┘', cardX + cardW - 270, cardY + cardH - 32);

    // Load and draw the QR code inside the card
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 560;
      const qrX = cardX + (cardW - qrSize) / 2;
      const qrY = cardY + 90;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Scannability badge below QR
      ctx.fillStyle = '#ccff00';
      ctx.fillRect(cardX + (cardW - 480) / 2, cardY + 680, 480, 64);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(cardX + (cardW - 480) / 2, cardY + 680, 480, 64);

      ctx.fillStyle = '#000000';
      ctx.font = '900 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ SCAN CODE OR TAP LINK ★', 1080 / 2, cardY + 722);

      // Bottom Story Footer: Instagram Link Sticker hint
      ctx.textAlign = 'center';
      ctx.font = '900 36px monospace';
      ctx.fillStyle = theme === 'cyber-dark' || theme === 'glass-cyan' ? '#ffffff' : '#000000';
      ctx.fillText('STICKER LINK: ' + url.replace(/^https?:\/\//, '').slice(0, 36), 1080 / 2, 1720);

      ctx.font = '600 28px system-ui, sans-serif';
      ctx.fillStyle = theme === 'cyber-dark' || theme === 'glass-cyan' ? '#38bdf8' : '#71717a';
      ctx.fillText('Add Link Sticker on Instagram Story for 1-Tap Access', 1080 / 2, 1770);
    };
    qrImg.src = qrDataUrl;
  }, [theme, title, url, description, category, qrDataUrl]);

  if (!isOpen) return null;

  // Handle Native Web Share (Instagram, WhatsApp, Messages)
  const handleShareStory = async () => {
    setIsGenerating(true);
    setShareFeedback(null);

    try {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      );

      if (!blob) {
        throw new Error('Failed to create story image blob');
      }

      const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}_story.png`, {
        type: 'image/png',
      });

      // Check if navigator.canShare with files is available
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: title,
          text: `Check out ${title} on Nedject! Tap the sticker link: ${url}`,
          url: url,
        });
        setShareFeedback('Shared directly to Story via device sheet!');
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        // Fallback to text + url share and trigger PNG download
        await navigator.share({
          title: title,
          text: `Check out this page: ${title}`,
          url: url,
        });
        handleDownloadPng();
        setShareFeedback('Shared link! Image downloaded to attach to Instagram Story.');
      } else {
        // Fallback: download image and copy link
        handleDownloadPng();
        handleCopyLink();
        setShareFeedback('Story PNG downloaded & Link copied! Ready for Instagram sticker.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[Share] Story sharing error:', err);
        handleDownloadPng();
        handleCopyLink();
        setShareFeedback('Story image downloaded & Link copied for Instagram!');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Download high-res PNG (1080x1920)
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-instagram-story.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download Vector SVG (infinite crispness)
  const handleDownloadSvg = () => {
    const svgContent = generateVectorStorySvg();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-story-vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  // Copy Link for Instagram Link Sticker
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Generate Complete Clean SVG Vector
  const generateVectorStorySvg = (): string => {
    const bgColor =
      theme === 'neo-brutalist'
        ? '#fafaf5'
        : theme === 'cyber-dark'
        ? '#09090b'
        : theme === 'glass-cyan'
        ? '#082f49'
        : '#ffffff';
    const textColor = theme === 'cyber-dark' || theme === 'glass-cyan' ? '#ffffff' : '#000000';
    const accentColor = theme === 'neo-brutalist' ? '#ccff00' : '#38bdf8';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <style>
      .title { font-family: system-ui, -apple-system, sans-serif; font-weight: 900; font-size: 64px; fill: ${textColor}; }
      .desc { font-family: system-ui, -apple-system, sans-serif; font-size: 32px; fill: #71717a; }
      .mono { font-family: monospace; font-weight: 900; }
    </style>
  </defs>

  <!-- Background Canvas -->
  <rect width="1080" height="1920" fill="${bgColor}"/>

  <!-- Neo-Brutalist Frame & Accent -->
  <rect x="0" y="0" width="1080" height="240" fill="${accentColor}" stroke="#000000" stroke-width="12"/>
  <text x="80" y="150" class="mono" font-size="36" fill="#000000">NEDJECT // INSTAGRAM STORY &amp; VECTOR SPECIMEN</text>

  <!-- Category Badge -->
  <rect x="80" y="290" width="360" height="54" fill="#000000"/>
  <text x="100" y="328" class="mono" font-size="28" fill="${accentColor}">${escapeXml(category)}</text>

  <!-- Title & Description -->
  <text x="80" y="440" class="title">${escapeXml(title)}</text>
  <text x="80" y="520" class="desc">${escapeXml(description.slice(0, 90))}...</text>

  <!-- Central Card Shadow -->
  <rect x="104" y="824" width="920" height="820" fill="#000000"/>
  <!-- Central Card -->
  <rect x="80" y="800" width="920" height="820" fill="#ffffff" stroke="#000000" stroke-width="10"/>

  <text x="110" y="850" class="mono" font-size="24" fill="#a1a1aa">┌ QUIET ZONE VECTOR 300 DPI</text>

  <!-- Embedded QR Code Vector Graphic -->
  <g transform="translate(260, 920) scale(1.16)">
    ${qrSvgString.replace(/<\?xml.*?\?>/g, '').replace(/<svg.*?>/g, '').replace(/<\/svg>/g, '')}
  </g>

  <!-- Action Callout Bar -->
  <rect x="300" y="1500" width="480" height="64" fill="${accentColor}" stroke="#000000" stroke-width="6"/>
  <text x="540" y="1542" class="mono" font-size="28" text-anchor="middle" fill="#000000">★ SCAN OR TAP LINK STICKER ★</text>

  <!-- Footer Link URL -->
  <text x="540" y="1740" class="mono" font-size="34" text-anchor="middle" fill="${textColor}">${escapeXml(
      url.replace(/^https?:\/\//, '')
    )}</text>
  <text x="540" y="1790" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle" fill="#a1a1aa">Open Instagram &gt; Stickers &gt; Link to Add Direct CTA</text>
</svg>`;
  };

  const escapeXml = (unsafe: string) =>
    unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case '\'':
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    });

  // Google Web Story AMP HTML snippet
  const webStoryAmpCode = `<!-- Google Web Story (AMP Story) Markup for: ${title} -->
<!doctype html>
<html ⚡ lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link rel="canonical" href="${url}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  </head>
  <body>
    <amp-story standalone
      title="${title}"
      publisher="Nedject"
      publisher-logo-src="https://nedject.com/icon.svg"
      poster-portrait-src="${url}/api/og?page=story">
      <amp-story-page id="page-1">
        <amp-story-grid-layer template="vertical">
          <h1 style="color:#ccff00; background:#000; padding:12px; font-family:monospace;">${title}</h1>
          <p style="color:#fff; background:#18181b; padding:12px;">${description}</p>
        </amp-story-grid-layer>
        <amp-story-page-outlink layout="nodisplay">
          <a href="${url}">OPEN ON NEDJECT</a>
        </amp-story-page-outlink>
      </amp-story-page>
    </amp-story>
  </body>
</html>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto font-mono">
      <div className="relative w-full max-w-4xl border-4 border-black bg-white shadow-[10px_10px_0px_#000000] my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="border-b-4 border-black bg-[#ccff00] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-black bg-black text-[#ccff00] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase text-black tracking-wider flex items-center gap-2">
                <span>SHARE PAGE TO INSTAGRAM &amp; WEB STORY</span>
                <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-bold">9:16 VERTICAL</span>
              </h2>
              <p className="text-[11px] font-semibold text-zinc-800">
                Ultra-crisp vector SVG &amp; 1080x1920 Story image with dynamic scannable QR code.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close story share dialog"
            className="border-2 border-black bg-white p-1 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="border-b-2 border-black bg-zinc-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs font-black border-2 border-black transition-all ${
              activeTab === 'preview' ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]' : 'bg-white text-black'
            }`}
          >
            STORY PREVIEW &amp; SHARE
          </button>
          <button
            onClick={() => setActiveTab('vector')}
            className={`px-3 py-1 text-xs font-black border-2 border-black transition-all ${
              activeTab === 'vector' ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]' : 'bg-white text-black'
            }`}
          >
            VECTOR SVG CODE
          </button>
          <button
            onClick={() => setActiveTab('webstory')}
            className={`px-3 py-1 text-xs font-black border-2 border-black transition-all ${
              activeTab === 'webstory' ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]' : 'bg-white text-black'
            }`}
          >
            WEB STORY (AMP) CODE
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive 9:16 Vertical Story Mockup */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="text-[11px] font-bold text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-black" />
                  <span>9:16 Instagram Story Canvas (1080x1920)</span>
                </div>

                <div className="relative w-full max-w-[280px] aspect-[9/16] border-4 border-black bg-black p-2 shadow-[6px_6px_0px_#000000]">
                  {/* Phone notch bar */}
                  <div className="w-20 h-3 bg-zinc-800 rounded-full mx-auto mb-1.5" />

                  {/* Rendered Canvas Preview */}
                  <div className="w-full h-[calc(100%-24px)] overflow-hidden bg-white border border-zinc-700 relative">
                    <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-zinc-500 font-bold text-center">
                  Vector-grounded QR code verified scannable on mobile screens.
                </div>
              </div>

              {/* Right Column: Customization Controls & Sharing Actions */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Theme Selector */}
                <div>
                  <label className="text-xs font-black uppercase text-black block mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Story Visual Aesthetic</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'neo-brutalist', name: 'Neo-Brutal', color: '#ccff00' },
                      { id: 'cyber-dark', name: 'Cyber Dark', color: '#09090b' },
                      { id: 'glass-cyan', name: 'Glass Cyan', color: '#06b6d4' },
                      { id: 'minimal-light', name: 'Minimalist', color: '#ffffff' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as StoryTheme)}
                        className={`p-2 border-2 border-black text-left font-mono text-[11px] font-black transition-all ${
                          theme === t.id
                            ? 'bg-black text-[#ccff00] shadow-[3px_3px_0px_#000000]'
                            : 'bg-white text-black hover:bg-zinc-50'
                        }`}
                      >
                        <div
                          className="w-4 h-4 border border-black mb-1"
                          style={{ backgroundColor: t.color }}
                        />
                        <span>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Story Metadata */}
                <div className="space-y-3 bg-[#fafaf5] p-3 border-2 border-black">
                  <div>
                    <label className="text-[11px] font-black text-zinc-700 uppercase block mb-1">
                      Story Headline
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border-2 border-black p-2 text-xs font-bold bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-zinc-700 uppercase block mb-1">
                      Story Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border-2 border-black p-2 text-xs font-medium bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-zinc-700 uppercase block mb-1">
                      Target Page URL (Embedded in QR &amp; Story Sticker)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full border-2 border-black p-2 text-xs font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                      />
                      <button
                        onClick={handleCopyLink}
                        title="Copy URL for Instagram Link Sticker"
                        className="px-3 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-black" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Share Feedback Toast */}
                {shareFeedback && (
                  <div className="border-2 border-black bg-emerald-100 p-2.5 text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{shareFeedback}</span>
                  </div>
                )}

                {/* Direct Share & Download Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleShareStory}
                    disabled={isGenerating}
                    className="w-full inline-flex items-center justify-center gap-2 border-4 border-black bg-[#ccff00] text-black px-5 py-3 text-sm font-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000] transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>SHARE TO INSTAGRAM / DEVICE STORY</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadPng}
                      className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black text-white px-3 py-2 text-xs font-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>DOWNLOAD 1080P PNG</span>
                    </button>

                    <button
                      onClick={handleDownloadSvg}
                      className="inline-flex items-center justify-center gap-2 border-2 border-black bg-white text-black px-3 py-2 text-xs font-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-black" />
                      <span>DOWNLOAD VECTOR SVG</span>
                    </button>
                  </div>

                  <div className="border border-black bg-zinc-50 p-2.5 text-[11px] text-zinc-600 font-medium">
                    <span className="font-bold text-black">Instagram Tip:</span> Download the 1080x1920 image, open Instagram &gt; Add Story &gt; choose sticker icon &gt; select <strong>&quot;Link&quot;</strong> and paste the copied URL so viewers can swipe or tap directly to this page!
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'vector' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-black">Infinite Resolution Vector SVG</h3>
                  <p className="text-[11px] text-zinc-600">Standard SVG format compatible with Figma, Illustrator, and web graphics.</p>
                </div>
                <button
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000000]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT .SVG FILE</span>
                </button>
              </div>

              <div className="relative border-2 border-black bg-zinc-950 p-3 overflow-x-auto max-h-[360px]">
                <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre">
                  {generateVectorStorySvg()}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'webstory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-black">Google Web Story (AMP Story) Markup</h3>
                  <p className="text-[11px] text-zinc-600">Valid AMP story page format for Google Discover and Web Story search results.</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webStoryAmpCode);
                    setCopiedWebStoryCode(true);
                    setTimeout(() => setCopiedWebStoryCode(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000000]"
                >
                  {copiedWebStoryCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebStoryCode ? 'COPIED!' : 'COPY AMP HTML'}</span>
                </button>
              </div>

              <div className="relative border-2 border-black bg-zinc-950 p-3 overflow-x-auto max-h-[360px]">
                <pre className="text-[11px] text-cyan-400 font-mono whitespace-pre">
                  {webStoryAmpCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black bg-zinc-100 p-3 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-zinc-600 font-bold">
            <QrCode className="w-3.5 h-3.5 text-black" />
            <span>Target: {url.replace(/^https?:\/\//, '').slice(0, 40)}</span>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-4 py-1 text-xs font-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-800"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
};
