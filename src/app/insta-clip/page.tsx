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
  Unlock,
  Maximize2,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  Share2,
} from 'lucide-react';
import {
  InstaClipOptions,
  InstaToneMode,
  CameraMotionStyle,
  CinematicAudioStyle,
  LetterboxStyle,
  INSTA_ASPECT_PRESETS,
  INSTA_TONE_MODES,
  CINEMATIC_SPECIMENS,
  DEFAULT_INSTA_OPTIONS,
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

const SCREEN_ANGLES = [
  { angle: 45, label: '45° (Optimal Eye Angle)', desc: 'Avoids visual moiré; standard cinema angle' },
  { angle: 0, label: '0° (Orthogonal)', desc: 'Clean horizontal & vertical raster grid' },
  { angle: 15, label: '15° (Cyan Angle)', desc: 'Commercial process cyan orientation' },
  { angle: 75, label: '75° (Magenta Angle)', desc: 'Process magenta orientation' },
  { angle: 90, label: '90° (Vertical Stripes)', desc: 'Direct vertical engraving line style' },
];

const CAMERA_MOTIONS: { id: CameraMotionStyle; label: string; desc: string }[] = [
  { id: 'ken-burns-in', label: 'Ken Burns Slow Zoom-In', desc: 'Epic cinematic slow push towards center' },
  { id: 'slow-pan-down', label: 'Slow Tilt Down', desc: 'Dramatic vertical reveal from top to bottom' },
  { id: 'breathe-pulse', label: 'Subtle Breathe & Pulse', desc: 'Rhythmic cinematic lens expansion' },
  { id: 'film-jitter', label: '16mm Film Jitter', desc: 'Authentic mechanical projector gate weave' },
  { id: 'drift-right', label: 'Anamorphic Drift Right', desc: 'Smooth horizontal cinematic dolly track' },
  { id: 'static', label: 'Static Optical Stillness', desc: 'Zero camera move; pure optical grade' },
];

const AUDIO_STYLES: { id: CinematicAudioStyle; label: string; desc: string }[] = [
  { id: 'lofi-vinyl', label: 'Lo-Fi Vinyl & Tape Hiss', desc: 'Warm 33 RPM needle crackle & organic tape noise' },
  { id: 'cinematic-drone', label: 'Sub-Bass Cinematic Drone', desc: 'Low 55Hz harmonic sub-bass theater resonance' },
  { id: 'ambient-shimmer', label: 'Ambient Cyber Shimmer', desc: 'Soft spatial breeze & atmospheric pink noise' },
  { id: 'muted', label: 'Muted (Silent Video)', desc: 'Export pure video without any audio stream' },
];

const LETTERBOX_STYLES: { id: LetterboxStyle; label: string; desc: string }[] = [
  { id: 'none', label: 'None (Full Bleed)', desc: 'Edge-to-edge Instagram Reel coverage' },
  { id: 'cinemascope', label: '2.39:1 CinemaScope', desc: 'Anamorphic widescreen black cinema bars' },
  { id: 'academy', label: '1.85:1 Academy Flat', desc: 'Classic cinematic theatrical matte' },
  { id: 'minimal', label: 'Minimal 6% Accent', desc: 'Subtle clean top & bottom black strip' },
];

export default function InstaClipPage() {
  const { data: session } = useSession();

  // Active specimen or user media
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string>(CINEMATIC_SPECIMENS[0].id);
  const [mediaSourceUrl, setMediaSourceUrl] = useState<string>(CINEMATIC_SPECIMENS[0].url);
  const [mediaFileName, setMediaFileName] = useState<string>('Neo Tokyo Midnight Neon');

  // Options
  const [options, setOptions] = useState<InstaClipOptions>(DEFAULT_INSTA_OPTIONS);
  const [activeTab, setActiveTab] = useState<'tone' | 'halftone' | 'motion' | 'audio' | 'export'>('tone');
  const [isRatioLocked, setIsRatioLocked] = useState(true);

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  // Preload Image Source
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mediaSourceUrl;
    img.onload = () => {
      sourceImageRef.current = img;
    };
  }, [mediaSourceUrl]);

  // Audio preview playback toggle
  useEffect(() => {
    if (previewAudioCtxRef.current) {
      previewAudioCtxRef.current.close().catch(() => {});
      previewAudioCtxRef.current = null;
    }

    if (isPlaying && !isAudioMuted && options.audioStyle !== 'muted') {
      const { context, stream } = createCinematicAudioStream(options.audioStyle);
      if (context && stream) {
        // connect to speakers for live preview
        const audioEl = new Audio();
        audioEl.srcObject = stream;
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
  }, [isPlaying, isAudioMuted, options.audioStyle]);

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

      if (canvasRef.current && sourceImageRef.current) {
        if (showOriginal) {
          // Draw raw source without cinematic processing
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            ctx.drawImage(sourceImageRef.current, 0, 0, w, h);
          }
        } else {
          renderInstaClipFrame(
            canvasRef.current,
            sourceImageRef.current,
            options,
            currentTime
          );
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
  }, [isPlaying, isRecording, currentTime, options, showOriginal]);

  // File upload handler
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMediaSourceUrl(dataUrl);
      setSelectedSpecimenId('custom');
      showToast(`Loaded "${file.name}" for Cinematic Reel processing`);
    };
    reader.readAsDataURL(file);
  };

  // User plan detection
  const isLogged = Boolean(session?.user);
  const userPlan = (((session?.user as any)?.plan || (isLogged ? 'free' : 'guest')) as PlanTier);
  const maxAllowedDuration = getMaxClipDuration(userPlan);

  // Quota verification
  const verifyQuota = async () => {
    const res = await consumeToolQuota('insta_clip', isLogged, userPlan === 'guest' ? 'free' : userPlan);
    return res.allowed;
  };

  // Record & Download Video Clip
  const handleExportVideo = async () => {
    if (!canvasRef.current || !sourceImageRef.current) return;

    // Check duration restriction
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
      showToast('Compiling cinematic video frames & atmospheric audio...');
      const videoBlob = await recordInstaClipVideo(
        canvasRef.current,
        sourceImageRef.current,
        options,
        (percent) => {
          setRecordingProgress(percent);
        }
      );

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      a.download = `InstaClip_${options.aspectRatio.replace(':', 'x')}_${options.toneMode}_${Date.now()}.${ext}`;
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

  // Export Still Poster (Gated 4K for Pro/Enterprise, standard preview for Free)
  const handleExportPoster = async () => {
    if (!canvasRef.current) return;

    // 4K Ultra-HD still poster gate
    if (userPlan === 'guest' || userPlan === 'free') {
      const allowed = enforceFeatureAccess('insta_clip_4k_poster', userPlan, isLogged);
      if (!allowed) return;
    }

    const allowed = await verifyQuota();
    if (!allowed) return;

    try {
      exportInstaPoster(canvasRef.current, options, 'InstaClip-Cinematic-Poster');
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
                9:16 REELS · 35MM FILM GRAIN · AM HALFTONE · KEN BURNS MOTION · 4K POSTERS
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

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Dossier Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-[3px_3px_0px_#000000]">
            <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest text-black uppercase">
              {'// ENGINE: INSTAGRAM CINEMATIC REELS & VIDEO CLIPS OPTICAL PROCESSOR'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-black">
                INSTA CLIP STUDIO
              </h1>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-amber-600">
                CINEMATIC REELS &amp; OPTICS
              </h2>
            </div>

            <p className="font-mono text-xs sm:text-sm text-zinc-700 max-w-xl leading-relaxed">
              Create high-impact <strong>Instagram Reels, Stories, and cinema clips</strong> calibrated with authentic 35mm film grain, AM halftone motion screening, cinematic camera moves, and synthesized analog audio. <strong>Pure borderless cinematic full-bleed visuals</strong> with zero frames.
            </p>
          </div>
        </div>

        {/* QUOTA & FEATURE FLAG MONETIZATION BANNER */}
        <UsageBanner />

        {/* QUICK ASPECT RATIO SELECTOR STRIP */}
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

        {/* CURATED SPECIMEN CHOOSER & MEDIA UPLOADER */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-black" />
              <span className="font-mono text-xs font-black uppercase text-black tracking-wider">
                SELECT CINEMATIC SPECIMEN OR UPLOAD YOUR OWN:
              </span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ccff00] text-black px-3 py-1 font-mono text-xs font-black hover:bg-black hover:text-[#ccff00] transition-colors shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>UPLOAD PHOTO / CLIP</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {CINEMATIC_SPECIMENS.map((specimen) => {
              const isSelected = selectedSpecimenId === specimen.id;
              return (
                <button
                  key={specimen.id}
                  onClick={() => {
                    setSelectedSpecimenId(specimen.id);
                    setMediaSourceUrl(specimen.url);
                    setMediaFileName(specimen.title);
                    showToast(`Loaded Specimen: ${specimen.title}`);
                  }}
                  className={`text-left p-2 border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-[3px_3px_0px_#ccff00]'
                      : 'border-zinc-300 bg-[#fafaf8] text-black hover:border-black'
                  }`}
                >
                  <div className="aspect-[4/3] bg-zinc-200 mb-1.5 relative overflow-hidden border border-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={specimen.url}
                      alt={specimen.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-black text-[#ccff00] text-[8px] font-mono font-bold px-1 py-0.5">
                      {specimen.badge}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] font-black truncate">{specimen.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. DUAL-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: LIVE CANVASES & PLAYER (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_#000000] space-y-4">
              
              {/* Top Viewport Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-rose-600 border border-black inline-block animate-ping" />
                  <span className="font-black uppercase tracking-wider text-black">
                    CINEMATIC LIVE VIEWER
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="border border-black bg-zinc-100 px-2 py-0.5 text-[10px] font-bold hover:bg-[#ccff00] cursor-pointer"
                  >
                    HOLD FOR RAW
                  </button>
                  <span className="bg-black text-[#ccff00] font-black text-[10px] px-1.5 py-0.5">
                    {options.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Responsive Phone / Cinematic Canvas Container */}
              <div className="w-full flex items-center justify-center bg-zinc-950 p-3 sm:p-5 border-2 border-black relative overflow-hidden shadow-inner min-h-[440px]">
                <div
                  className="relative transition-all shadow-[0px_0px_30px_rgba(0,0,0,0.8)] border border-zinc-700 bg-black flex items-center justify-center max-w-full"
                  style={{
                    aspectRatio: `${options.width} / ${options.height}`,
                    maxHeight: '520px',
                    width: options.aspectRatio === '9:16' ? '290px' : options.aspectRatio === '4:5' ? '340px' : '420px',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={options.width}
                    height={options.height}
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Recording overlay modal */}
                  {isRecording && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                      <div className="w-8 h-8 border-4 border-[#ccff00] border-t-transparent animate-spin rounded-full" />
                      <div className="font-mono text-sm font-black text-[#ccff00] uppercase">
                        RECORDING CINEMATIC REEL...
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
              </div>

              {/* Timeline Scrub Bar */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                  <span>00:{(currentTime % 60).toFixed(2).padStart(5, '0')}</span>
                  <span className="text-black font-black uppercase">
                    {options.durationSeconds}s CLIP DURATION
                  </span>
                  <span>00:{options.durationSeconds.toFixed(2).padStart(5, '0')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={options.durationSeconds}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-200 border border-black accent-black cursor-pointer"
                />
              </div>

              {/* Playback Transport Controls */}
              <div className="grid grid-cols-4 gap-2 font-mono text-xs font-black">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="col-span-2 py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-colors flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}</span>
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
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
                  title={isAudioMuted ? 'Unmute preview sound' : 'Mute preview sound'}
                >
                  {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isAudioMuted ? 'MUTED' : 'AUDIO'}</span>
                </button>
              </div>

              {/* Quick Spec Bar */}
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
                  <span className="block font-bold text-zinc-400">CAMERA MOVE</span>
                  <span className="font-black text-black truncate">{options.cameraMotion.replace(/-/g, ' ').toUpperCase()}</span>
                </div>
                <div>
                  <span className="block font-bold text-zinc-400">ATMOSPHERE</span>
                  <span className="font-black text-black truncate">{options.audioStyle.replace(/-/g, ' ').toUpperCase()}</span>
                </div>
              </div>

              {/* EXPORT ACTION BUTTONS */}
              <div className="space-y-2 pt-2 border-t-2 border-black">
                <button
                  onClick={handleExportVideo}
                  disabled={isRecording}
                  className="w-full py-3 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] font-mono text-sm font-black transition-all shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>RECORD &amp; DOWNLOAD REEL (MP4 / WEBM)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportPoster}
                    className="py-2 border-2 border-black bg-white hover:bg-zinc-100 font-mono text-xs font-black transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD STILL POSTER</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast('InstaClip settings link copied to clipboard!');
                      navigator.clipboard?.writeText(window.location.href);
                    }}
                    className="py-2 border-2 border-black bg-white hover:bg-zinc-100 font-mono text-xs font-black transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>SHARE REEL PRESET</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: STUDIO CONTROL PANEL TABS (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000000] space-y-5">
              
              {/* Studio Tabs Navigation */}
              <div className="flex items-center gap-1 border-b-2 border-black pb-2 overflow-x-auto font-mono text-xs font-black">
                <button
                  onClick={() => setActiveTab('tone')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'tone'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  1. CINEMATIC TONE &amp; COLOR
                </button>
                <button
                  onClick={() => setActiveTab('halftone')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'halftone'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  2. AM HALFTONE &amp; OPTICS
                </button>
                <button
                  onClick={() => setActiveTab('motion')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'motion'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  3. CAMERA MOTION &amp; TIMING
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'audio'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  4. ATMOSPHERIC AUDIO
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-3 py-1.5 border-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'export'
                      ? 'border-black bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  5. EXPORT &amp; SPECS
                </button>
              </div>

              {/* TAB 1: CINEMATIC TONE & COLOR */}
              {activeTab === 'tone' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-black uppercase text-black flex items-center justify-between">
                      <span>CHOOSE CINEMATIC FILM GRADE:</span>
                      <span className="text-zinc-500 font-normal">10 MASTER PRESETS</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {INSTA_TONE_MODES.map((mode) => {
                        const isSelected = options.toneMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => {
                              handleUpdate({ toneMode: mode.id });
                              showToast(`Color Grade: ${mode.label}`);
                            }}
                            className={`text-left p-3 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-black bg-black text-white shadow-[4px_4px_0px_#ccff00]'
                                : 'border-zinc-300 bg-[#fafaf8] text-black hover:border-black'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black">{mode.label}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                                  isSelected ? 'bg-[#ccff00] text-black border-black' : 'bg-zinc-200 text-zinc-800 border-zinc-400'
                                }`}>
                                  {mode.badge}
                                </span>
                              </div>
                              <p className={`text-[11px] leading-tight font-mono ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {mode.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MASTER TONAL SLIDERS */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-4 font-mono text-xs">
                    <div className="font-black uppercase text-black flex items-center gap-2 border-b border-zinc-300 pb-2">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>MASTER TONAL &amp; OPTICAL ADJUSTMENTS</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>CONTRAST:</span>
                          <span>{options.contrast.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={options.contrast}
                          onChange={(e) => handleUpdate({ contrast: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>BRIGHTNESS:</span>
                          <span>{options.brightness.toFixed(2)}x</span>
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

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>COLOR VIBRANCY / SATURATION:</span>
                          <span>{options.saturation.toFixed(2)}x</span>
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

                      {/* Film Grain */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>35MM FILM GRAIN NOISE:</span>
                          <span>{options.grainIntensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={options.grainIntensity}
                          onChange={(e) => handleUpdate({ grainIntensity: parseInt(e.target.value, 10) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      {/* Vignette */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>OPTICAL VIGNETTE SHADING:</span>
                          <span>{options.vignette}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={options.vignette}
                          onChange={(e) => handleUpdate({ vignette: parseInt(e.target.value, 10) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      {/* Sharpness */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>MICRO-CONTRAST SHARPNESS:</span>
                          <span>{options.sharpness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={options.sharpness}
                          onChange={(e) => handleUpdate({ sharpness: parseInt(e.target.value, 10) })}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-300">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={options.invert}
                          onChange={(e) => handleUpdate({ invert: e.target.checked })}
                          className="w-4 h-4 accent-black"
                        />
                        <span>INVERT TONES (NEGATIVE FILM SCAN)</span>
                      </label>
                      <button
                        onClick={() => {
                          handleUpdate({
                            contrast: 1.35,
                            brightness: 1.05,
                            saturation: 1.25,
                            grainIntensity: 42,
                            vignette: 45,
                            sharpness: 40,
                            invert: false,
                          });
                          showToast('Reset tonal controls to default');
                        }}
                        className="text-zinc-600 underline hover:text-black font-bold"
                      >
                        Reset Tonal Controls
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AM HALFTONE & OPTICS */}
              {activeTab === 'halftone' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  <div className="p-3 bg-[#fffde6] border-2 border-black space-y-1">
                    <span className="font-black text-black uppercase">
                      {'// AMPLITUDE-MODULATED (AM) SCREENING MATRIX'}
                    </span>
                    <p className="text-[11px] text-zinc-700">
                      Calculates physical offset newspaper &amp; engraving angles for moving images. When AM Line or AM Dot tone mode is selected, these mathematical frequencies dictate optical dot clustering.
                    </p>
                  </div>

                  {/* Screen Angle */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">
                      AM SCREEN ANGLE (MOIRÉ-FREE CALIBRATION):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SCREEN_ANGLES.map((angleItem) => {
                        const isSelected = options.screenAngle === angleItem.angle;
                        return (
                          <button
                            key={angleItem.angle}
                            onClick={() => {
                              handleUpdate({ screenAngle: angleItem.angle });
                              showToast(`Screen Angle: ${angleItem.angle}°`);
                            }}
                            className={`text-left p-2.5 border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[3px_3px_0px_#000000]'
                                : 'border-zinc-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            <div className="font-black text-xs">{angleItem.label}</div>
                            <div className={`text-[10px] ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                              {angleItem.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LPI & Dot Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-black bg-[#fafaf8] p-4">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>LPI (LINES PER INCH):</span>
                        <span>{options.lpi} LPI</span>
                      </div>
                      <input
                        type="range"
                        min="35"
                        max="85"
                        step="5"
                        value={options.lpi}
                        onChange={(e) => handleUpdate({ lpi: parseInt(e.target.value, 10) })}
                        className="w-full accent-black cursor-pointer"
                      />
                      <span className="text-[10px] text-zinc-500">
                        Higher = finer newspaper dots; Lower = bold graphic texture
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>HALFTONE CELL / DOT SIZE:</span>
                        <span>{options.halftoneDotSize} PX</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="1"
                        value={options.halftoneDotSize}
                        onChange={(e) => handleUpdate({ halftoneDotSize: parseInt(e.target.value, 10) })}
                        className="w-full accent-black cursor-pointer"
                      />
                      <span className="text-[10px] text-zinc-500">
                        Adjusts physical stroke width of diagonal matrix
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CAMERA MOTION & TIMING */}
              {activeTab === 'motion' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  {/* Camera Motion */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">
                      CINEMATIC CAMERA MOTION STYLE:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CAMERA_MOTIONS.map((motion) => {
                        const isSelected = options.cameraMotion === motion.id;
                        return (
                          <button
                            key={motion.id}
                            onClick={() => {
                              handleUpdate({ cameraMotion: motion.id });
                              showToast(`Camera Motion: ${motion.label}`);
                            }}
                            className={`text-left p-3 border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-black bg-black text-[#ccff00] shadow-[3px_3px_0px_#000000]'
                                : 'border-zinc-300 bg-[#fafaf8] text-black hover:border-black'
                            }`}
                          >
                            <div className="font-black text-xs">{motion.label}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                              {motion.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Motion Intensity Slider */}
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>MOTION PACE / INTENSITY:</span>
                      <span>{options.motionIntensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={options.motionIntensity}
                      onChange={(e) => handleUpdate({ motionIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  {/* Clip Duration */}
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
                              setCurrentTime(0);
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

                  {/* Letterbox Anamorphic Matte (NO frame, pure cinema bars) */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-black">
                      ANAMORPHIC LETTERBOX MATTE (CINEMA BLACK BARS):
                    </label>
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

                  {/* Timecode Overlay */}
                  <div className="p-3 bg-white border-2 border-black flex items-center justify-between">
                    <div>
                      <span className="font-black text-black">SHOW TIMECODE / TELEMETRY STAMP</span>
                      <p className="text-[10px] text-zinc-600">
                        Overlays brutalist recording badge with live timecode &amp; resolution
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.showTimecodeOverlay}
                      onChange={(e) => handleUpdate({ showTimecodeOverlay: e.target.checked })}
                      className="w-5 h-5 accent-black cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: ATMOSPHERIC AUDIO */}
              {activeTab === 'audio' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  <div className="p-3 bg-[#e8f8f5] border-2 border-black space-y-1">
                    <span className="font-black text-black uppercase">
                      {'// REAL-TIME AUDIO SYNTHESIZER (WEB AUDIO API)'}
                    </span>
                    <p className="text-[11px] text-zinc-700">
                      InstaClip generates 100% synthesized ambient acoustics client-side with zero external assets. When recorded to MP4/WebM, the audio stream is multiplexed directly into the container!
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {AUDIO_STYLES.map((audio) => {
                      const isSelected = options.audioStyle === audio.id;
                      return (
                        <button
                          key={audio.id}
                          onClick={() => {
                            handleUpdate({ audioStyle: audio.id });
                            showToast(`Audio Atmosphere: ${audio.label}`);
                          }}
                          className={`w-full text-left p-3.5 border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-black bg-black text-white shadow-[4px_4px_0px_#ccff00]'
                              : 'border-zinc-300 bg-[#fafaf8] text-black hover:border-black'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-black text-xs flex items-center gap-2">
                              <span>{audio.label}</span>
                              {isSelected && (
                                <span className="bg-[#ccff00] text-black text-[9px] px-1.5 py-0.5 font-black">
                                  ACTIVE SOUNDTRACK
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                              {audio.desc}
                            </p>
                          </div>
                          <Radio className={`w-4 h-4 ${isSelected ? 'text-[#ccff00]' : 'text-zinc-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: EXPORT & SPECS */}
              {activeTab === 'export' && (
                <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
                  <div className="border-2 border-black bg-[#fafaf8] p-4 space-y-3">
                    <span className="font-black text-black uppercase text-xs">
                      EXPORT CALIBRATION SPECIFICATIONS:
                    </span>
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
                      <span className="uppercase text-black">PLAN RESTRICTIONS &amp; LIMITS</span>
                      <span className="bg-black text-[#ccff00] px-2 py-0.5">
                        {session?.user ? ((session.user as any)?.plan || 'FREE').toUpperCase() : 'GUEST'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-700">
                      Free users receive 10 generations across all tools. Pro and Enterprise members enjoy unlimited 4K Ultra HD exports, 60 FPS recording, and instant downloads.
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

        {/* TOAST MESSAGE NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 border-2 border-black bg-black text-[#ccff00] px-4 py-2.5 font-mono text-xs font-black shadow-[4px_4px_0px_#ccff00] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
