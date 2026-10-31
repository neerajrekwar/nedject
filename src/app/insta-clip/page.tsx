'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Download,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Video,
  Sparkles,
  SlidersHorizontal,
  Eye,
  ArrowLeft,
  Film,
  Camera,
  Layers,
  Lock,
  Maximize2,
  CheckCircle2,
  Radio,
  Type,
  Music,
  Zap,
  Disc,
  Flame,
  Tv,
  Share2,
} from 'lucide-react';
import {
  InstaClipOptions,
  InstaToneMode,
  InstaEffectType,
  CameraMotionStyle,
  CinematicAudioStyle,
  LetterboxStyle,
  CaptionOptions,
  CaptionFontStyle,
  CaptionPosition,
  CaptionBadgeStyle,
  INSTA_ASPECT_PRESETS,
  INSTA_TONE_MODES,
  INSTA_EFFECTS_CATALOG,
  CAPTION_STYLES_LIST,
  AUDIO_STYLES_CATALOG,
  CINEMATIC_SPECIMENS,
  DEFAULT_INSTA_OPTIONS,
  DEFAULT_CAPTION_OPTIONS,
  renderInstaClipFrame,
  recordInstaClipVideo,
  exportInstaPoster,
  createCinematicAudioStream,
} from '@/lib/insta-clip-engine';
import { UsageBanner } from '@/components/auth/UsageBanner';
import { useSession } from 'next-auth/react';
import { consumeToolQuota } from '@/lib/usage-limits';
import { QuotaLimitModal } from '@/components/auth/QuotaLimitModal';
import { enforceFeatureAccess, getMaxClipDuration, PlanTier } from '@/lib/plan-capabilities';

const CAMERA_MOTIONS: { id: CameraMotionStyle; label: string; desc: string }[] = [
  { id: 'ken-burns-in', label: 'Ken Burns Slow Zoom-In', desc: 'Epic cinematic slow push towards center' },
  { id: 'slow-pan-down', label: 'Slow Tilt Down', desc: 'Dramatic vertical reveal from top to bottom' },
  { id: 'breathe-pulse', label: 'Subtle Breathe & Pulse', desc: 'Rhythmic cinematic lens expansion' },
  { id: 'film-jitter', label: '16mm Film Jitter', desc: 'Authentic mechanical projector gate weave' },
  { id: 'drift-right', label: 'Anamorphic Drift Right', desc: 'Smooth horizontal cinematic dolly track' },
  { id: 'static', label: 'Static Optical Stillness', desc: 'Zero camera move; pure optical grade' },
];

const LETTERBOX_STYLES: { id: LetterboxStyle; label: string; desc: string }[] = [
  { id: 'none', label: 'None (Full Bleed)', desc: 'Edge-to-edge Instagram Reel coverage' },
  { id: 'cinemascope', label: '2.39:1 CinemaScope', desc: 'Anamorphic widescreen black cinema bars' },
  { id: 'academy', label: '1.85:1 Academy Flat', desc: 'Classic cinematic theatrical matte' },
  { id: 'minimal', label: 'Minimal 6% Accent', desc: 'Subtle clean top & bottom black strip' },
];

const TEXT_COLOR_SWATCHES = [
  { color: '#ccff00', label: 'Volt Neon' },
  { color: '#ffffff', label: 'Pure White' },
  { color: '#ffe600', label: 'Anime Yellow' },
  { color: '#00ffff', label: 'Cyber Cyan' },
  { color: '#ff3366', label: 'Crimson Red' },
  { color: '#ff9900', label: 'Warm Orange' },
];

export default function InstaClipPage() {
  const { data: session } = useSession();

  // Media Source Management (Video vs Image)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string>(CINEMATIC_SPECIMENS[0].id);
  const [mediaSourceUrl, setMediaSourceUrl] = useState<string>(CINEMATIC_SPECIMENS[0].url);
  const [mediaFileName, setMediaFileName] = useState<string>('Neo Tokyo Midnight Neon');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 1200 });

  // Custom Audio State
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);

  // Options & Tabs
  const [options, setOptions] = useState<InstaClipOptions>(DEFAULT_INSTA_OPTIONS);
  const [activeTab, setActiveTab] = useState<'effects' | 'captions' | 'audio' | 'tone' | 'export'>('effects');
  const [effectsFilter, setEffectsFilter] = useState<'All' | 'Glitch & CRT' | 'Film & Retro' | 'Halftone & Print' | 'Color & Lens'>('All');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Recording / Export State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const previewAudioCtxRef = useRef<AudioContext | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleUpdate = (updates: Partial<InstaClipOptions>) => {
    setOptions((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleUpdateCaption = (updates: Partial<CaptionOptions>) => {
    setOptions((prev) => ({
      ...prev,
      caption: {
        ...prev.caption,
        ...updates,
      },
    }));
  };

  // Plan detection
  const isLogged = Boolean(session?.user);
  const userPlan = (((session?.user as any)?.plan || (isLogged ? 'free' : 'guest')) as PlanTier);
  const maxAllowedDuration = getMaxClipDuration(userPlan);

  // Load Image when mediaSourceUrl changes and mediaType is 'image'
  useEffect(() => {
    if (mediaType !== 'image') return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mediaSourceUrl;
    img.onload = () => {
      sourceImageRef.current = img;
    };
  }, [mediaSourceUrl, mediaType]);

  // Load and configure Video Element when mediaType is 'video'
  useEffect(() => {
    if (mediaType !== 'video') return;

    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.playsInline = true;
    vid.muted = true;
    vid.loop = true;
    vid.preload = 'auto';
    vid.src = mediaSourceUrl;

    vid.onloadedmetadata = () => {
      sourceVideoRef.current = vid;
      const dur = Math.max(1, Math.round(vid.duration || 5));
      setVideoDuration(vid.duration || 5);
      setVideoDimensions({ width: vid.videoWidth, height: vid.videoHeight });

      // Automatically align duration (capped to plan limit)
      const targetDuration = Math.min(dur, maxAllowedDuration);
      handleUpdate({ durationSeconds: targetDuration });
      showToast(`Loaded video: ${vid.videoWidth}×${vid.videoHeight}px (${dur}s duration)`);
      if (isPlaying) {
        vid.play().catch(() => {});
      }
    };

    vid.onerror = (e) => {
      console.error('Failed to load video element:', e);
      showToast('Video decoding notice: format may be unsupported by browser.');
    };

    return () => {
      vid.pause();
      vid.src = '';
      sourceVideoRef.current = null;
    };
  }, [mediaSourceUrl, mediaType, maxAllowedDuration]);

  // Handle Play/Pause synchronization with video and audio
  useEffect(() => {
    if (mediaType === 'video' && sourceVideoRef.current) {
      if (isPlaying && !isRecording) {
        sourceVideoRef.current.play().catch(() => {});
      } else {
        sourceVideoRef.current.pause();
      }
    }
  }, [isPlaying, isRecording, mediaType]);

  // Handle user scrubbing video timeline
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (mediaType === 'video' && sourceVideoRef.current) {
      sourceVideoRef.current.currentTime = time % (sourceVideoRef.current.duration || options.durationSeconds);
    }
  };

  // Audio preview playback toggle
  useEffect(() => {
    if (previewAudioCtxRef.current) {
      previewAudioCtxRef.current.close().catch(() => {});
      previewAudioCtxRef.current = null;
    }

    if (isPlaying && !isAudioMuted && options.audioStyle !== 'muted') {
      const { context, stream } = createCinematicAudioStream(
        options.audioStyle,
        customAudioRef.current
      );
      if (context && stream) {
        const audioEl = new Audio();
        audioEl.srcObject = stream;
        audioEl.volume = options.audioVolume ?? 1.0;
        audioEl.play().catch(() => {});
        previewAudioCtxRef.current = context;
      }
    }

    return () => {
      if (previewAudioCtxRef.current) {
        previewAudioCtxRef.current.close().catch(() => {});
        previewAudioCtxRef.current = null;
      }
    };
  }, [isPlaying, isAudioMuted, options.audioStyle, options.audioVolume, customAudioUrl]);

  // Animation render loop
  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlaying && !isRecording) {
        setCurrentTime((prev) => {
          const next = prev + deltaSec;
          return next >= options.durationSeconds ? 0 : next;
        });
      }

      if (canvasRef.current) {
        const currentSource = mediaType === 'video' ? sourceVideoRef.current : sourceImageRef.current;
        if (currentSource) {
          if (showOriginal) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              const w = canvasRef.current.width;
              const h = canvasRef.current.height;
              ctx.drawImage(currentSource, 0, 0, w, h);
            }
          } else {
            renderInstaClipFrame(canvasRef.current, currentSource, options, currentTime);
          }
        }
      }

      if (active) {
        animationFrameIdRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, isRecording, currentTime, options, showOriginal, mediaType]);

  // Universal File Upload Handler (Supports both Video and Image files)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFileName(file.name);
    setSelectedSpecimenId('custom');

    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);

    if (isVid) {
      setMediaType('video');
      const blobUrl = URL.createObjectURL(file);
      setMediaSourceUrl(blobUrl);
      showToast(`Loaded video "${file.name}". Preparing canvas decoder...`);
    } else {
      setMediaType('image');
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setMediaSourceUrl(dataUrl);
        showToast(`Loaded image "${file.name}" for Cinematic Reel`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom Audio Track Upload
  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    setCustomAudioUrl(audioUrl);
    setCustomAudioName(file.name);
    handleUpdate({
      audioStyle: 'custom',
      customAudioUrl: audioUrl,
      customAudioName: file.name,
    });

    if (!customAudioRef.current) {
      customAudioRef.current = new Audio(audioUrl);
      customAudioRef.current.loop = true;
    } else {
      customAudioRef.current.src = audioUrl;
    }

    showToast(`Loaded custom audio track "${file.name}"`);
  };

  // Quota verification
  const verifyQuota = async () => {
    const res = await consumeToolQuota('insta_clip', isLogged, userPlan === 'guest' ? 'free' : userPlan);
    return res.allowed;
  };

  // Record & Download Video Clip
  const handleExportVideo = async () => {
    const currentSource = mediaType === 'video' ? sourceVideoRef.current : sourceImageRef.current;
    if (!canvasRef.current || !currentSource) return;

    if (options.durationSeconds > maxAllowedDuration) {
      const allowed = enforceFeatureAccess('insta_clip_long_duration', userPlan, isLogged);
      if (!allowed) {
        showToast(`Free preview limited to ${maxAllowedDuration}s. Upgrade to Pro for 30s clips!`);
        return;
      }
    }

    const allowed = await verifyQuota();
    if (!allowed) return;

    setIsRecording(true);
    setIsPlaying(false);
    setRecordingProgress(0);

    try {
      showToast('Compiling cinematic frames, 17-effect shaders & audio multiplexer...');
      const videoBlob = await recordInstaClipVideo(
        canvasRef.current,
        currentSource,
        options,
        (percent) => {
          setRecordingProgress(percent);
        },
        customAudioRef.current
      );

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      a.download = `InstaClip_${options.aspectRatio.replace(':', 'x')}_${options.effect}_${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Video Clip successfully exported (${ext.toUpperCase()})!`);
    } catch (err) {
      console.error(err);
      showToast('Video export failed. Please try a shorter duration.');
    } finally {
      setIsRecording(false);
      setIsPlaying(true);
      setRecordingProgress(0);
    }
  };

  // Export Still Poster
  const handleExportPoster = async () => {
    if (!canvasRef.current) return;

    if (userPlan === 'guest' || userPlan === 'free') {
      const allowed = enforceFeatureAccess('insta_clip_4k_poster', userPlan, isLogged);
      if (!allowed) return;
    }

    const allowed = await verifyQuota();
    if (!allowed) return;

    try {
      exportInstaPoster(canvasRef.current, options, 'InstaClip-Poster');
      showToast('Exported 4K Still Poster frame (PNG)!');
    } catch (err) {
      console.error(err);
      showToast('Poster export failed');
    }
  };

  const selectRatio = (preset: typeof INSTA_ASPECT_PRESETS[0]) => {
    handleUpdate({
      aspectRatio: preset.id,
      width: preset.width,
      height: preset.height,
    });
    showToast(`Aspect Ratio: ${preset.label} (${preset.width}×${preset.height})`);
  };

  const megapixels = ((options.width * options.height) / 1000000).toFixed(2);
  const activeEffectMeta = INSTA_EFFECTS_CATALOG.find((e) => e.id === options.effect) || INSTA_EFFECTS_CATALOG[1];

  const filteredEffects = effectsFilter === 'All'
    ? INSTA_EFFECTS_CATALOG
    : INSTA_EFFECTS_CATALOG.filter((e) => e.category === effectsFilter);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex flex-col">
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="relative z-20 w-full bg-[#f5f5f0] border-b-2 border-black">
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
                <span>INSTA CLIP STUDIO // CINEMATIC REELS ENGINE</span>
                <span className="w-1.5 h-1.5 bg-[#ccff00] border border-black inline-block animate-pulse" />
              </div>
              <div className="font-mono text-[10px] text-zinc-600 tracking-wider">
                VIDEO &amp; PHOTO · 17 SHADER EFFECTS · FONT CAPTIONS · CUSTOM AUDIO · 9:16 REELS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
              <span className="border-2 border-black bg-[#ccff00] text-black px-2.5 py-1 font-black shadow-[2px_2px_0px_#000000]">
                {options.aspectRatio} · {options.width}×{options.height} PX
              </span>
              <span className="border-2 border-black bg-black text-[#ccff00] px-2.5 py-1 font-black shadow-[2px_2px_0px_#000000]">
                {options.fps} FPS · {options.durationSeconds}S REEL
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

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-[3px_3px_0px_#000000]">
            <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest text-black uppercase">
              {'// ENGINE: INSTAGRAM CINEMATIC REELS & VIDEO CLIPS PROCESSOR'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-black">
                INSTA CLIP STUDIO
              </h1>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-amber-600">
                VIDEO · 17 EFFECTS · CAPTIONS
              </h2>
            </div>

            <p className="font-mono text-xs sm:text-sm text-zinc-700 max-w-xl leading-relaxed">
              Upload <strong>any MP4/WebM video or photo</strong>, apply 17 visual effects including <strong>Digital RGB Glitch</strong>, overlay stylized font captions, synthesize analog audio or mix your own audio track, and export broadcast-ready Instagram Reels.
            </p>
          </div>
        </div>

        {/* QUOTA BANNER */}
        <UsageBanner />

        {/* QUICK ASPECT RATIO SELECTOR */}
        <div className="border-2 border-black bg-white p-3 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black inline-block" />
              <span className="font-mono text-xs font-black uppercase text-black tracking-wider whitespace-nowrap">
                ASPECT RATIO (INSTAGRAM SPECS):
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {INSTA_ASPECT_PRESETS.map((p) => {
                const isSelected = options.aspectRatio === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectRatio(p)}
                    className={`px-3 py-1.5 font-mono text-xs font-black transition-all cursor-pointer whitespace-nowrap border border-black flex items-center gap-1.5 ${
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
        </div>

        {/* MEDIA CHOOSER & UNIVERSAL UPLOADER (VIDEO + PHOTO) */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-black" />
              <span className="font-mono text-xs font-black uppercase text-black tracking-wider">
                SOURCE MEDIA ({mediaType === 'video' ? 'VIDEO FILE LOADED' : 'IMAGE SPECIMEN'}):
              </span>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 border border-black ${
                mediaType === 'video' ? 'bg-[#ccff00] text-black' : 'bg-zinc-200 text-zinc-800'
              }`}>
                {mediaType === 'video' ? '▶ VIDEO' : '📷 PHOTO'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black px-3 py-1 font-mono text-xs font-black hover:bg-black hover:text-[#ccff00] transition-colors shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>UPLOAD VIDEO OR PHOTO</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="font-mono text-xs text-zinc-600 flex items-center justify-between">
            <span className="truncate">Active Media: <strong>{mediaFileName}</strong></span>
            <span className="text-[11px] text-zinc-500">Supports .mp4, .mov, .webm, .jpg, .png</span>
          </div>

          {/* Preset Specimens */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-zinc-200">
            {CINEMATIC_SPECIMENS.map((specimen) => {
              const isSelected = selectedSpecimenId === specimen.id;
              return (
                <button
                  key={specimen.id}
                  onClick={() => {
                    setSelectedSpecimenId(specimen.id);
                    setMediaType('image');
                    setMediaSourceUrl(specimen.url);
                    setMediaFileName(specimen.title);
                    showToast(`Loaded "${specimen.title}"`);
                  }}
                  className={`p-2 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-[3px_3px_0px_#ccff00]'
                      : 'border-zinc-300 bg-[#fafaf8] text-black hover:border-black'
                  }`}
                >
                  <div className="w-full h-16 bg-zinc-200 border border-black mb-1.5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={specimen.url} alt={specimen.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-mono text-[10px] font-black truncate">{specimen.title}</div>
                  <div className="text-[9px] text-zinc-500">{specimen.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MAIN WORKSPACE: CANVAS VIEWPORT & CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: LIVE CANVAS VIEWPORT & TRANSPORT CONTROLS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border-4 border-black bg-white p-4 sm:p-5 shadow-[8px_8px_0px_#000000] space-y-4">
              
              {/* Canvas Header Telemetry */}
              <div className="flex items-center justify-between font-mono text-xs border-b-2 border-black pb-2">
                <span className="font-black uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 inline-block animate-ping" />
                  <span>VIEWPORT // {options.aspectRatio}</span>
                </span>
                <span className="text-[10px] bg-black text-[#ccff00] px-2 py-0.5 font-bold">
                  {options.effect.toUpperCase()}
                </span>
              </div>

              {/* Canvas Container */}
              <div className="relative border-2 border-black bg-zinc-950 flex items-center justify-center overflow-hidden aspect-[9/16] max-h-[580px] w-full mx-auto">
                <canvas
                  ref={canvasRef}
                  width={options.width}
                  height={options.height}
                  className="w-full h-full object-contain block select-none pointer-events-none"
                />

                {/* Recording In-Progress Banner */}
                {isRecording && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                    <div className="w-8 h-8 border-4 border-[#ccff00] border-t-transparent animate-spin rounded-full" />
                    <div className="font-mono text-sm font-black text-[#ccff00] tracking-wider uppercase">
                      RECORDING CINEMATIC REEL
                    </div>
                    <div className="w-full bg-zinc-800 border border-black h-3 overflow-hidden">
                      <div
                        className="bg-[#ccff00] h-full transition-all duration-100"
                        style={{ width: `${recordingProgress}%` }}
                      />
                    </div>
                    <div className="font-mono text-xs font-bold text-white">
                      {recordingProgress}% Encoded · 1080p 60FPS
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Scrub Bar */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                  <span>00:{(currentTime % 60).toFixed(2).padStart(5, '0')}</span>
                  <span className="text-black font-black uppercase">
                    {options.durationSeconds}S DURATION
                  </span>
                  <span>00:{options.durationSeconds.toFixed(2).padStart(5, '0')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={options.durationSeconds}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-200 border border-black accent-black cursor-pointer"
                />
              </div>

              {/* Playback Controls */}
              <div className="grid grid-cols-4 gap-2 font-mono text-xs font-black">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="col-span-2 py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-colors flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}</span>
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="py-2.5 border-2 border-black bg-white hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000] cursor-pointer"
                  title="Reset to 0s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>

                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`py-2.5 border-2 border-black transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000] cursor-pointer ${
                    isAudioMuted
                      ? 'bg-zinc-200 text-zinc-600'
                      : 'bg-emerald-400 text-black font-black'
                  }`}
                  title={isAudioMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isAudioMuted ? 'MUTED' : 'AUDIO'}</span>
                </button>
              </div>

              {/* Quick Spec Readout */}
              <div className="p-2.5 bg-[#fafaf8] border border-black grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-zinc-700">
                <div>
                  <span className="block font-bold text-zinc-400">RESOLUTION</span>
                  <span className="font-black text-black">{options.width}×{options.height}</span>
                </div>
                <div>
                  <span className="block font-bold text-zinc-400">MEGAPIXELS</span>
                  <span className="font-black text-black">{megapixels} MP</span>
                </div>
                <div>
                  <span className="block font-bold text-zinc-400">EFFECT</span>
                  <span className="font-black text-black truncate">{activeEffectMeta.name}</span>
                </div>
                <div>
                  <span className="block font-bold text-zinc-400">AUDIO</span>
                  <span className="font-black text-black truncate">{options.audioStyle.toUpperCase()}</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: CONTROLS & STUDIO TABS (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000000] space-y-5">
              
              {/* Studio Tabs Navigation */}
              <div className="flex items-center gap-1 border-b-2 border-black pb-2 overflow-x-auto font-mono text-xs font-black">
                <button
                  onClick={() => setActiveTab('effects')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'effects'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1. 17 SHADER EFFECTS</span>
                </button>

                <button
                  onClick={() => setActiveTab('captions')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'captions'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>2. FONT CAPTIONS</span>
                </button>

                <button
                  onClick={() => setActiveTab('audio')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'audio'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>3. AUDIO &amp; CUSTOM</span>
                </button>

                <button
                  onClick={() => setActiveTab('tone')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'tone'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>4. COLOR &amp; MOTION</span>
                </button>

                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'export'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>5. EXPORT REEL</span>
                </button>
              </div>

              {/* ======================================================== */}
              {/* TAB 1: 17 VISUAL EFFECTS (RGB GLITCH, VHS, CRT, ETC.)    */}
              {/* ======================================================== */}
              {activeTab === 'effects' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(['All', 'Glitch & CRT', 'Film & Retro', 'Halftone & Print', 'Color & Lens'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEffectsFilter(cat)}
                        className={`px-2.5 py-1 border font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                          effectsFilter === cat
                            ? 'border-black bg-black text-[#ccff00]'
                            : 'border-zinc-300 bg-white text-zinc-700 hover:border-black'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Intensity Slider */}
                  <div className="p-3 bg-[#fafaf8] border-2 border-black space-y-1.5">
                    <div className="flex justify-between items-center font-black uppercase text-black">
                      <span>EFFECT INTENSITY:</span>
                      <span className="text-[#000000] bg-[#ccff00] px-2 py-0.5 border border-black font-black">
                        {options.effectIntensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={options.effectIntensity}
                      onChange={(e) => handleUpdate({ effectIntensity: parseInt(e.target.value) })}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  {/* 17 Effects Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {filteredEffects.map((eff) => {
                      const isSelected = options.effect === eff.id;
                      const isGlitch = eff.id === 'rgb-glitch';
                      return (
                        <button
                          key={eff.id}
                          onClick={() => {
                            handleUpdate({ effect: eff.id });
                            showToast(`Applied Effect: ${eff.name}`);
                          }}
                          className={`p-3 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-black bg-black text-white shadow-[4px_4px_0px_#ccff00]'
                              : isGlitch
                              ? 'border-black bg-[#fffde6] text-black hover:border-black'
                              : 'border-zinc-300 bg-white text-black hover:border-black'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs">{eff.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                                isSelected
                                  ? 'bg-[#ccff00] text-black border-black'
                                  : isGlitch
                                  ? 'bg-rose-500 text-white border-black animate-pulse'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-400'
                              }`}>
                                {eff.badge}
                              </span>
                            </div>
                            <p className={`text-[10px] leading-relaxed line-clamp-2 ${
                              isSelected ? 'text-zinc-300' : 'text-zinc-600'
                            }`}>
                              {eff.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: FONT CAPTIONS & SUBTITLES                         */}
              {/* ======================================================== */}
              {activeTab === 'captions' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  
                  {/* Enable Switch */}
                  <div className="p-3 bg-[#fafaf8] border-2 border-black flex items-center justify-between">
                    <div>
                      <span className="font-black uppercase text-black">DISPLAY FONT CAPTIONS</span>
                      <p className="text-[10px] text-zinc-600">Overlay typographic titles or subtitles</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.caption.enabled}
                      onChange={(e) => handleUpdateCaption({ enabled: e.target.checked })}
                      className="w-5 h-5 accent-black cursor-pointer"
                    />
                  </div>

                  {/* Main Caption Text Input */}
                  <div className="space-y-1.5">
                    <label className="font-black uppercase text-black">CAPTION TEXT (HEADLINE):</label>
                    <input
                      type="text"
                      value={options.caption.text}
                      onChange={(e) => handleUpdateCaption({ text: e.target.value })}
                      placeholder="Enter subtitle or headline..."
                      className="w-full p-2.5 border-2 border-black bg-white font-mono text-xs font-black shadow-[2px_2px_0px_#000000]"
                    />
                  </div>

                  {/* Secondary Sub-heading Kicker */}
                  <div className="space-y-1.5">
                    <label className="font-black uppercase text-black">SECONDARY KICKER (OPTIONAL):</label>
                    <input
                      type="text"
                      value={options.caption.kickerText || ''}
                      onChange={(e) => handleUpdateCaption({ kickerText: e.target.value })}
                      placeholder="Optional top micro kicker..."
                      className="w-full p-2 border border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>

                  {/* Font Typography Style Cards */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">FONT TYPOGRAPHY STYLE:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CAPTION_STYLES_LIST.map((style) => {
                        const isSelected = options.caption.fontStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            onClick={() => {
                              handleUpdateCaption({ fontStyle: style.id });
                              showToast(`Caption Font: ${style.label}`);
                            }}
                            className={`p-2.5 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[3px_3px_0px_#000000]'
                                : 'border-zinc-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            <span className="font-black text-xs">{style.label}</span>
                            <span className="text-[10px] opacity-75 mt-0.5 truncate">{style.sample}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Caption Position & Badge Style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-black uppercase text-black">POSITION ON FRAME:</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['top', 'center', 'bottom'] as CaptionPosition[]).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => handleUpdateCaption({ position: pos })}
                            className={`py-1.5 border border-black font-black uppercase text-[11px] ${
                              options.caption.position === pos
                                ? 'bg-black text-[#ccff00]'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black uppercase text-black">BADGE / MATTE STYLE:</label>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { id: 'solid-black', label: 'Solid Box' },
                          { id: 'translucent', label: 'Translucent' },
                          { id: 'neon-border', label: 'Neon Border' },
                          { id: 'shadow-only', label: 'Shadow Only' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            onClick={() => handleUpdateCaption({ badgeStyle: b.id as CaptionBadgeStyle })}
                            className={`py-1 border border-black font-bold text-[10px] ${
                              options.caption.badgeStyle === b.id
                                ? 'bg-black text-[#ccff00]'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text Color Swatches & Font Size Slider */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200">
                    <div className="space-y-1.5">
                      <label className="font-black uppercase text-black">TEXT COLOR:</label>
                      <div className="flex items-center gap-1.5">
                        {TEXT_COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.color}
                            onClick={() => handleUpdateCaption({ textColor: swatch.color })}
                            className={`w-6 h-6 border-2 border-black transition-transform ${
                              options.caption.textColor === swatch.color ? 'scale-125 shadow-[1px_1px_0px_#000000]' : ''
                            }`}
                            style={{ backgroundColor: swatch.color }}
                            title={swatch.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-black uppercase text-black">
                        <span>FONT SIZE:</span>
                        <span>{options.caption.fontSize} PX</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="64"
                        step="2"
                        value={options.caption.fontSize}
                        onChange={(e) => handleUpdateCaption({ fontSize: parseInt(e.target.value) })}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: AUDIO SOUNDSCAPES & CUSTOM AUDIO UPLOAD           */}
              {/* ======================================================== */}
              {activeTab === 'audio' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  
                  {/* Custom Audio Upload Box */}
                  <div className="p-3.5 bg-[#f0fde8] border-2 border-black space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black uppercase text-black flex items-center gap-1.5">
                        <Disc className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span>CUSTOM AUDIO TRACK (UPLOAD YOUR OWN):</span>
                      </span>
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="border border-black bg-black text-[#ccff00] px-2.5 py-1 font-black text-[11px] hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer"
                      >
                        CHOOSE MP3 / WAV
                      </button>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/mp3,audio/wav,audio/aac,audio/m4a,audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </div>
                    {customAudioName ? (
                      <div className="text-[11px] font-bold text-emerald-800">
                        Active Custom Track: <strong>{customAudioName}</strong>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-600">
                        Upload any background music, beat, or voiceover file. Audio will be multiplexed into exported MP4/WebM!
                      </p>
                    )}
                  </div>

                  {/* Master Volume */}
                  <div className="p-3 bg-[#fafaf8] border-2 border-black space-y-1.5">
                    <div className="flex justify-between items-center font-black uppercase text-black">
                      <span>AUDIO VOLUME:</span>
                      <span className="bg-black text-[#ccff00] px-2 py-0.5 border border-black font-black">
                        {Math.round((options.audioVolume ?? 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.05"
                      value={options.audioVolume ?? 1.0}
                      onChange={(e) => handleUpdate({ audioVolume: parseFloat(e.target.value) })}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  {/* Preset Audio Soundscapes */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">SYNTHESIZED ACOUSTIC PRESETS:</label>
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {AUDIO_STYLES_CATALOG.map((audio) => {
                        const isSelected = options.audioStyle === audio.id;
                        return (
                          <button
                            key={audio.id}
                            onClick={() => {
                              handleUpdate({ audioStyle: audio.id });
                              showToast(`Audio Atmosphere: ${audio.label}`);
                            }}
                            className={`w-full p-2.5 border-2 text-left font-black transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'border-zinc-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            <div>
                              <div className="text-xs">{audio.label}</div>
                              <div className={`text-[10px] font-normal ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                {audio.desc}
                              </div>
                            </div>
                            <Radio className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#ccff00]' : 'text-zinc-400'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: COLOR, CONTRAST & CAMERA MOTION                   */}
              {/* ======================================================== */}
              {activeTab === 'tone' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  
                  {/* Tonal Controls */}
                  <div className="p-3 bg-[#fafaf8] border-2 border-black space-y-3">
                    <span className="font-black uppercase text-black block">OPTICAL TONAL GRADING:</span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>CONTRAST</span>
                          <span>{options.contrast.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="2.5"
                          step="0.05"
                          value={options.contrast}
                          onChange={(e) => handleUpdate({ contrast: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>BRIGHTNESS</span>
                          <span>{Math.round(options.brightness * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="1.6"
                          step="0.05"
                          value={options.brightness}
                          onChange={(e) => handleUpdate({ brightness: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>SATURATION</span>
                          <span>{Math.round(options.saturation * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="2.0"
                          step="0.05"
                          value={options.saturation}
                          onChange={(e) => handleUpdate({ saturation: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Camera Motions (For still images or dynamic pan) */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">CINEMATIC CAMERA MOTIONS:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CAMERA_MOTIONS.map((motion) => {
                        const isSelected = options.cameraMotion === motion.id;
                        return (
                          <button
                            key={motion.id}
                            onClick={() => {
                              handleUpdate({ cameraMotion: motion.id });
                              showToast(`Camera: ${motion.label}`);
                            }}
                            className={`p-2 border-2 text-left font-black transition-all cursor-pointer ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'border-zinc-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            <div className="text-[11px] truncate">{motion.label}</div>
                            <div className="text-[9px] text-zinc-500 truncate mt-0.5">{motion.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Anamorphic Letterbox Matte */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">LETTERBOX MATTE (BLACK BARS):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LETTERBOX_STYLES.map((lb) => {
                        const isSelected = options.letterbox === lb.id;
                        return (
                          <button
                            key={lb.id}
                            onClick={() => {
                              handleUpdate({ letterbox: lb.id });
                              showToast(`Letterbox: ${lb.label}`);
                            }}
                            className={`p-2 border-2 text-left font-black transition-all cursor-pointer ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'border-zinc-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            <div className="text-[11px] truncate">{lb.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: EXPORT REEL & DURATION SPECS                      */}
              {/* ======================================================== */}
              {activeTab === 'export' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  
                  {/* Duration Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-black uppercase text-black text-xs">
                      <span>CLIP DURATION (SECONDS):</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {maxAllowedDuration}S FREE MAX · PRO UNLIMITED (30S)
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[3, 5, 7, 10, 15].map((sec) => {
                        const isSelected = options.durationSeconds === sec;
                        const isProOnly = sec > maxAllowedDuration;
                        return (
                          <button
                            key={sec}
                            onClick={() => {
                              if (isProOnly) {
                                const allowed = enforceFeatureAccess('insta_clip_long_duration', userPlan, isLogged);
                                if (!allowed) return;
                              }
                              handleUpdate({ durationSeconds: sec });
                              handleSeek(0);
                              showToast(`Duration: ${sec} Seconds`);
                            }}
                            className={`py-2 border-2 font-black transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                                : 'border-zinc-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            <span>{sec}s</span>
                            {isProOnly && (
                              <span className="text-[9px] bg-amber-400 text-black px-1 py-0 font-black border border-black -mt-0.5">
                                PRO
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Export Specs Box */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3">
                    <span className="font-black text-black uppercase text-xs">EXPORT SPECIFICATIONS:</span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2 border border-black bg-white">
                        <span className="block text-zinc-500 font-bold">CONTAINER</span>
                        <span className="font-black text-black">MP4 / WebM (Avc1/VP9)</span>
                      </div>
                      <div className="p-2 border border-black bg-white">
                        <span className="block text-zinc-500 font-bold">BITRATE</span>
                        <span className="font-black text-black">8.0 Mbps Master</span>
                      </div>
                      <div className="p-2 border border-black bg-white">
                        <span className="block text-zinc-500 font-bold">AUDIO FREQ</span>
                        <span className="font-black text-black">48 kHz Stereo Opus</span>
                      </div>
                      <div className="p-2 border border-black bg-white">
                        <span className="block text-zinc-500 font-bold">FRAME RATE</span>
                        <span className="font-black text-black">{options.fps} FPS Progressive</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Gating Info */}
                  <div className="border-2 border-black bg-[#fffde6] p-4 space-y-2">
                    <div className="flex items-center justify-between font-black">
                      <span className="uppercase text-black">SUBSCRIPTION TIER STATUS</span>
                      <span className="bg-black text-[#ccff00] px-2 py-0.5">
                        {userPlan.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-700">
                      Free accounts receive 10 generations across tools. Pro Studio ($9/mo) unlocks uncompressed 4K still poster frames, 30-second reels, and zero watermarks.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleExportVideo}
                      disabled={isRecording}
                      className="w-full py-3.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Video className="w-4 h-4" />
                      <span>START RECORDING CINEMATIC REEL</span>
                    </button>

                    <button
                      onClick={handleExportPoster}
                      className="w-full py-2.5 border-2 border-black bg-white hover:bg-zinc-100 font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>EXPORT 4K STILL POSTER (PNG)</span>
                      {(userPlan === 'guest' || userPlan === 'free') && (
                        <span className="text-[10px] bg-black text-[#ccff00] px-1.5 py-0.2 font-black">
                          PRO ($9/MO)
                        </span>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 border-2 border-black bg-black text-[#ccff00] px-4 py-2.5 font-mono text-xs font-black shadow-[4px_4px_0px_#ccff00] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>

      <QuotaLimitModal />
    </div>
  );
}
