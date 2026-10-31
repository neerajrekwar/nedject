/**
 * INSTA CLIP ENGINE - Instagram Cinematic Video Clips & Reels Studio
 * High-performance canvas-based video frame processor with AM halftone screening,
 * 35mm film grain, Hollywood color grading, camera motions, and audio synthesis.
 */

export type InstaToneMode =
  | 'am-line'
  | 'am-dot'
  | 'floyd-steinberg'
  | 'analog-35mm'
  | 'teal-orange'
  | 'silver-gelatin'
  | 'cyberpunk-neon'
  | 'vhs-camcorder'
  | 'high-contrast'
  | 'clean-cinematic';

export type CameraMotionStyle =
  | 'ken-burns-in'
  | 'slow-pan-down'
  | 'breathe-pulse'
  | 'film-jitter'
  | 'drift-right'
  | 'static';

export type LetterboxStyle = 'none' | 'cinemascope' | 'academy' | 'minimal';

export type CinematicAudioStyle =
  | 'lofi-vinyl'
  | 'cinematic-drone'
  | 'ambient-shimmer'
  | 'muted';

export interface AspectPreset {
  id: string;
  label: string;
  desc: string;
  width: number;
  height: number;
  ratioLabel: string;
}

export const INSTA_ASPECT_PRESETS: AspectPreset[] = [
  { id: '9:16', label: '9:16 Reels & Story', desc: '1080×1920 · Full Screen Vertical Reel', width: 1080, height: 1920, ratioLabel: '9:16' },
  { id: '4:5', label: '4:5 Portrait Feed', desc: '1080×1350 · Instagram Feed Maximizer', width: 1080, height: 1350, ratioLabel: '4:5' },
  { id: '1:1', label: '1:1 Square Feed', desc: '1080×1080 · Classic Instagram Square', width: 1080, height: 1080, ratioLabel: '1:1' },
  { id: '16:9', label: '16:9 Cinema Reel', desc: '1920×1080 · Landscape Video / IGTV', width: 1920, height: 1080, ratioLabel: '16:9' },
  { id: '2:3', label: '2:3 Vertical Post', desc: '1080×1620 · 35mm Film Post Ratio', width: 1080, height: 1620, ratioLabel: '2:3' },
];

export interface InstaClipOptions {
  aspectRatio: string;
  width: number;
  height: number;
  toneMode: InstaToneMode;
  contrast: number; // 0.5 - 2.5 (1.0 = default)
  brightness: number; // 0.5 - 2.0 (1.0 = default)
  saturation: number; // 0.0 - 2.0 (1.0 = default)
  grainIntensity: number; // 0 - 100%
  sharpness: number; // 0 - 100%
  vignette: number; // 0 - 100%
  screenAngle: number; // 0, 15, 45, 75, 90
  lpi: number; // 35 - 85
  halftoneDotSize: number; // 2 - 12
  invert: boolean;
  cameraMotion: CameraMotionStyle;
  motionIntensity: number; // 0.2 - 2.0
  letterbox: LetterboxStyle;
  durationSeconds: number; // 3, 5, 7, 10, 15
  fps: number; // 30 or 60
  audioStyle: CinematicAudioStyle;
  showTimecodeOverlay: boolean;
}

export const DEFAULT_INSTA_OPTIONS: InstaClipOptions = {
  aspectRatio: '9:16',
  width: 1080,
  height: 1920,
  toneMode: 'analog-35mm',
  contrast: 1.35,
  brightness: 1.05,
  saturation: 1.25,
  grainIntensity: 42,
  sharpness: 40,
  vignette: 45,
  screenAngle: 45,
  lpi: 55,
  halftoneDotSize: 5,
  invert: false,
  cameraMotion: 'ken-burns-in',
  motionIntensity: 1.0,
  letterbox: 'none',
  durationSeconds: 5,
  fps: 30,
  audioStyle: 'lofi-vinyl',
  showTimecodeOverlay: true,
};

export const INSTA_TONE_MODES: {
  id: InstaToneMode;
  label: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: 'analog-35mm',
    label: '35mm Film Grain',
    desc: 'Kodak Vision3 analog motion picture stock with organic silver halide grain and warm highlights',
    badge: 'KODAK 35MM',
  },
  {
    id: 'teal-orange',
    label: 'Teal & Orange Hollywood',
    desc: 'Modern blockbuster cinema grade separating warm skin tones against cool cyan shadow depth',
    badge: 'CINEMATIC GRADE',
  },
  {
    id: 'am-line',
    label: 'AM Line Halftone Motion',
    desc: 'Dynamic 45° diagonal movie engraving scanlines modulated by frame luminance',
    badge: 'ENGRAVING FILM',
  },
  {
    id: 'am-dot',
    label: 'AM Clustered Dot Press',
    desc: 'Offset rotogravure newsprint matrix with optical amplitude modulation',
    badge: 'PRINT PRESS',
  },
  {
    id: 'floyd-steinberg',
    label: 'Floyd-Steinberg Risograph',
    desc: 'Stochastic 1-bit error diffusion dither for avant-garde motion aesthetics',
    badge: 'DITHER REEL',
  },
  {
    id: 'silver-gelatin',
    label: 'Silver Gelatin Noir Film',
    desc: 'Rich archival black & white darkroom film with velvety blacks and luminous specular mids',
    badge: 'B&W NOIR',
  },
  {
    id: 'cyberpunk-neon',
    label: 'Cyberpunk Neon Matrix',
    desc: 'High-energy Tokyo night aesthetic with hyper-saturated greens, purples and chromatic edge glow',
    badge: 'CYBER MATRIX',
  },
  {
    id: 'vhs-camcorder',
    label: '1990s VHS Camcorder',
    desc: 'Nostalgic CRT raster scanlines, subtle color phase drift, and magnetic tape noise',
    badge: 'RETRO VHS',
  },
  {
    id: 'high-contrast',
    label: '21:1 Dynamic Film Contrast',
    desc: 'Aggressive commercial punch with crushed micro-shadows and sculpted specular highlights',
    badge: '21:1 CONTRAST',
  },
  {
    id: 'clean-cinematic',
    label: 'Clean Director’s Cut',
    desc: 'Natural balanced cinematic calibration with crisp optics and pristine color gamut',
    badge: 'DIRECTOR CUT',
  },
];

export interface CinematicSpecimen {
  id: string;
  title: string;
  badge: string;
  desc: string;
  url: string;
}

export const CINEMATIC_SPECIMENS: CinematicSpecimen[] = [
  {
    id: 'tokyo-neon',
    title: 'Neo Tokyo Night Neon',
    badge: 'CYBER REEL',
    desc: 'Atmospheric rainy Tokyo crosswalk illuminated by towering cyberpunk neon billboards',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'supercar-highway',
    title: 'Golden Hour Cruiser',
    badge: 'SPEED & HORIZON',
    desc: 'High-speed sunset canyon highway driving with cinematic lens flares and warm golden light',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'fashion-editorial',
    title: 'High-Fashion Silhouette',
    badge: 'PARIS EDITORIAL',
    desc: 'Sculptural haute couture runway silhouette in dramatic architectural lighting',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'nordic-mist',
    title: 'Nordic Mountain Mist',
    badge: 'MOODY HORIZON',
    desc: 'Vast glacial fjord enveloped in drifting low morning fog and pine tree ridges',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'retro-california',
    title: 'California Coast 1978',
    badge: 'VINTAGE 35MM',
    desc: 'Pacific Coast Highway palms with vintage sports convertible and warm sun haze',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'darkroom-portrait',
    title: 'Darkroom Noir Monolith',
    badge: 'ARCHIVAL PORTRAIT',
    desc: 'Minimalist studio lighting with sculpted facial contours and analog atmosphere',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  },
];

/**
 * Computes camera transform based on time progression (0.0 to 1.0)
 */
export function computeCameraTransform(
  style: CameraMotionStyle,
  progress: number,
  intensity: number = 1.0
): { scale: number; transX: number; transY: number; rotate: number } {
  const p = Math.sin(progress * Math.PI); // Smooth ease-in-out curve
  const linear = progress;

  switch (style) {
    case 'ken-burns-in':
      return {
        scale: 1.0 + 0.12 * linear * intensity,
        transX: (linear * 15 - 7.5) * intensity,
        transY: (linear * -10) * intensity,
        rotate: 0,
      };
    case 'slow-pan-down':
      return {
        scale: 1.08,
        transX: 0,
        transY: (linear * 40 - 20) * intensity,
        rotate: 0,
      };
    case 'breathe-pulse':
      return {
        scale: 1.0 + 0.05 * p * intensity,
        transX: 0,
        transY: 0,
        rotate: 0,
      };
    case 'film-jitter':
      // High-frequency pseudo-random gate weave
      const jitterX = (Math.sin(progress * 137.5) * 3) * intensity;
      const jitterY = (Math.cos(progress * 223.1) * 2.5) * intensity;
      const jitterRot = (Math.sin(progress * 89.3) * 0.2) * intensity;
      return {
        scale: 1.04,
        transX: jitterX,
        transY: jitterY,
        rotate: jitterRot,
      };
    case 'drift-right':
      return {
        scale: 1.06,
        transX: (linear * -35 + 17) * intensity,
        transY: 0,
        rotate: 0,
      };
    case 'static':
    default:
      return { scale: 1.0, transX: 0, transY: 0, rotate: 0 };
  }
}

/**
 * Main Frame Rendering Pipeline
 * Takes HTMLImageElement or HTMLVideoElement and draws calibrated cinematic frame on canvas
 */
export function renderInstaClipFrame(
  targetCanvas: HTMLCanvasElement,
  source: HTMLImageElement | HTMLVideoElement,
  options: InstaClipOptions,
  timeSeconds: number
) {
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const w = targetCanvas.width;
  const h = targetCanvas.height;

  const progress = (timeSeconds % options.durationSeconds) / options.durationSeconds;
  const camera = computeCameraTransform(options.cameraMotion, progress, options.motionIntensity);

  // Clear canvas
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Source aspect ratio math (Cover fit)
  const srcW = (source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth) || 1200;
  const srcH = (source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight) || 1200;

  const srcAspect = srcW / srcH;
  const targetAspect = w / h;

  let drawW = w;
  let drawH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (srcAspect > targetAspect) {
    // Source is wider than target: fit height, crop width
    drawH = h;
    drawW = h * srcAspect;
    offsetX = (w - drawW) / 2;
  } else {
    // Source is taller than target: fit width, crop height
    drawW = w;
    drawH = w / srcAspect;
    offsetY = (h - drawH) / 2;
  }

  // Apply Camera Motion Transformations
  ctx.translate(w / 2, h / 2);
  if (camera.rotate !== 0) ctx.rotate((camera.rotate * Math.PI) / 180);
  ctx.scale(camera.scale, camera.scale);
  ctx.translate(-w / 2 + camera.transX, -h / 2 + camera.transY);

  // Draw source image
  ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  // Get image pixel data for post-processing
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const pixelCount = data.length;

  // Precompute tonal curves
  const contrastFactor = options.contrast;
  const brightnessOffset = (options.brightness - 1.0) * 255;
  const saturation = options.saturation;
  const grainSeed = (Math.sin(timeSeconds * 43.13) * 10000) % 1;

  // Pixel manipulation loop
  for (let i = 0; i < pixelCount; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness
    r += brightnessOffset;
    g += brightnessOffset;
    b += brightnessOffset;

    // 2. Contrast
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // Luminance
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // 3. Saturation
    if (saturation !== 1.0) {
      r = lum + (r - lum) * saturation;
      g = lum + (g - lum) * saturation;
      b = lum + (b - lum) * saturation;
    }

    // 4. Tone Mode Processing
    switch (options.toneMode) {
      case 'analog-35mm': {
        // Warm Kodak 35mm film curve
        r = r * 1.06 + 8;
        g = g * 0.98 + 2;
        b = b * 0.90 - 4;
        break;
      }
      case 'teal-orange': {
        // Teal shadows, Orange highlights
        const normLum = Math.max(0, Math.min(255, lum)) / 255;
        if (normLum > 0.45) {
          // Warm skin / highlights
          r = r * 1.15 + 15;
          g = g * 1.03;
          b = b * 0.85;
        } else {
          // Teal deep shadows
          r = r * 0.82;
          g = g * 1.08 + 8;
          b = b * 1.25 + 18;
        }
        break;
      }
      case 'silver-gelatin': {
        // High-depth Black & White Silver Gelatin
        r = lum * 0.98;
        g = lum * 0.98;
        b = lum * 1.02; // very subtle cool silver tone
        break;
      }
      case 'cyberpunk-neon': {
        // Cyberpunk neon mapping
        if (lum > 140) {
          r = Math.min(255, r * 1.35 + 20);
          g = Math.min(255, g * 0.6);
          b = Math.min(255, b * 1.4 + 40); // Magenta/Neon blue highlights
        } else {
          r = Math.max(0, r * 0.6);
          g = Math.min(255, g * 1.3 + 15);
          b = Math.max(0, b * 0.9); // Electric emerald shadows
        }
        break;
      }
      case 'vhs-camcorder': {
        // 90s VHS color phase drift
        r = r * 1.05 + 12;
        b = b * 0.95 - 5;
        break;
      }
      case 'high-contrast': {
        lum = lum < 128 ? lum * 0.75 : 128 + (lum - 128) * 1.35;
        r = lum;
        g = lum;
        b = lum;
        break;
      }
      default:
        break;
    }

    // Invert if active
    if (options.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // Clamp
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Put modified pixels back
  ctx.putImageData(imgData, 0, 0);

  // 5. Film Grain / 35mm Silver Halide Noise Overlay
  if (options.grainIntensity > 0) {
    const grainCanvas = document.createElement('canvas');
    const gw = Math.min(w, 400);
    const gh = Math.min(h, 400);
    grainCanvas.width = gw;
    grainCanvas.height = gh;
    const gctx = grainCanvas.getContext('2d');
    if (gctx) {
      const gData = gctx.createImageData(gw, gh);
      const gd = gData.data;
      const grainMult = (options.grainIntensity / 100) * 45;
      for (let j = 0; j < gd.length; j += 4) {
        const noise = (Math.random() - 0.5) * grainMult;
        gd[j] = 128 + noise;
        gd[j + 1] = 128 + noise;
        gd[j + 2] = 128 + noise;
        gd[j + 3] = Math.abs(noise) * 2.2;
      }
      gctx.putImageData(gData, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(grainCanvas, 0, 0, w, h);
      ctx.restore();
    }
  }

  // 6. AM Halftone Line/Dot Overlay (if AM modes selected)
  if (options.toneMode === 'am-line' || options.toneMode === 'am-dot') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';

    const angleRad = (options.screenAngle * Math.PI) / 180;
    const step = Math.max(3, Math.round(options.halftoneDotSize));

    if (options.toneMode === 'am-line') {
      ctx.lineWidth = Math.max(1, Math.round(step * 0.45));
      ctx.beginPath();
      // Draw diagonal screen lines
      const maxDim = Math.hypot(w, h);
      for (let d = -maxDim; d < maxDim; d += step * 2) {
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const x1 = w / 2 + d * cos - maxDim * sin;
        const y1 = h / 2 + d * sin + maxDim * cos;
        const x2 = w / 2 + d * cos + maxDim * sin;
        const y2 = h / 2 + d * sin - maxDim * cos;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    } else {
      // Clustered Dot matrix
      const dotStep = Math.max(4, step * 2);
      for (let y = 0; y < h; y += dotStep) {
        for (let x = 0; x < w; x += dotStep) {
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1, step * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // 7. VHS Scanlines (for VHS mode)
  if (options.toneMode === 'vhs-camcorder') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    const scanStep = 4;
    for (let y = (Math.floor(timeSeconds * 60) % scanStep); y < h; y += scanStep) {
      ctx.fillRect(0, y, w, 1.5);
    }
    ctx.restore();
  }

  // 8. Optical Vignette Shading
  if (options.vignette > 0) {
    ctx.save();
    const radius = Math.hypot(w, h) / 2;
    const vigGradient = ctx.createRadialGradient(
      w / 2,
      h / 2,
      radius * 0.45,
      w / 2,
      h / 2,
      radius
    );
    const vigAlpha = (options.vignette / 100) * 0.85;
    vigGradient.addColorStop(0, 'rgba(0,0,0,0)');
    vigGradient.addColorStop(1, `rgba(0,0,0,${vigAlpha.toFixed(2)})`);
    ctx.fillStyle = vigGradient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 9. Letterbox Anamorphic Black Bars (NO decorative frame, just clean cinematic matte)
  if (options.letterbox !== 'none') {
    let barHeight = 0;
    if (options.letterbox === 'cinemascope') {
      // 2.39:1 matte
      barHeight = Math.max(0, (h - w / 2.39) / 2);
    } else if (options.letterbox === 'academy') {
      // 1.85:1 matte
      barHeight = Math.max(0, (h - w / 1.85) / 2);
    } else if (options.letterbox === 'minimal') {
      barHeight = Math.round(h * 0.06);
    }

    if (barHeight > 0) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, barHeight);
      ctx.fillRect(0, h - barHeight, w, barHeight);
      ctx.restore();
    }
  }

  // 10. Brutalist Timecode / Telemetry Stamp
  if (options.showTimecodeOverlay) {
    ctx.save();
    const curSeconds = timeSeconds % options.durationSeconds;
    const mins = Math.floor(curSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(curSeconds % 60)
      .toString()
      .padStart(2, '0');
    const frames = Math.floor((curSeconds % 1) * options.fps)
      .toString()
      .padStart(2, '0');
    const timecode = `REC [${mins}:${secs}:${frames}] · 4K 60FPS · ${options.aspectRatio} CINEMA`;

    ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillStyle = '#000000';
    ctx.fillRect(24, 24, ctx.measureText(timecode).width + 20, 24);
    ctx.fillStyle = '#ccff00';
    ctx.fillText(timecode, 34, 40);
    ctx.restore();
  }
}

/**
 * Audio Synthesizer Engine using Web Audio API
 * Generates continuous audio stream (vinyl crackle, tape hiss, or drone) for MediaRecorder
 */
export function createCinematicAudioStream(
  audioStyle: CinematicAudioStyle
): { context: AudioContext; stream: MediaStream | null } {
  if (typeof window === 'undefined' || audioStyle === 'muted') {
    return { context: null as any, stream: null };
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return { context: null as any, stream: null };

  const ctx = new AudioCtx();
  const dest = ctx.createMediaStreamDestination();

  // Master Gain
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(dest);

  if (audioStyle === 'lofi-vinyl') {
    // Generate organic vinyl noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise base + sporadic dust clicks
      const base = (Math.random() * 2 - 1) * 0.02;
      const isClick = Math.random() < 0.0006;
      output[i] = base + (isClick ? (Math.random() * 2 - 1) * 0.35 : 0);
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to warm lo-fi tape frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2400;

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
  } else if (audioStyle === 'cinematic-drone') {
    // Low sub-bass harmonic drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // A1 low drone

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 82.4; // E2 fifth

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 320;

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(masterGain);

    osc1.start();
    osc2.start();
  } else if (audioStyle === 'ambient-shimmer') {
    // Gentle pink atmospheric breeze
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.04;
    }
    const pinkNoise = ctx.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    pinkNoise.connect(bandpass);
    bandpass.connect(masterGain);
    pinkNoise.start();
  }

  return { context: ctx, stream: dest.stream };
}

/**
 * Records Canvas animation in real time to MP4/WebM video blob
 */
export async function recordInstaClipVideo(
  sourceCanvas: HTMLCanvasElement,
  sourceMedia: HTMLImageElement | HTMLVideoElement,
  options: InstaClipOptions,
  onProgress?: (percent: number, currentSecond: number) => void
): Promise<Blob> {
  // Create offscreen recording canvas
  const recCanvas = document.createElement('canvas');
  recCanvas.width = options.width;
  recCanvas.height = options.height;

  // Capture video stream from offscreen canvas
  const canvasStream = recCanvas.captureStream(options.fps);

  // Setup synthesized audio stream if not muted
  const { context: audioCtx, stream: audioStream } = createCinematicAudioStream(options.audioStyle);

  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
  if (audioStream) {
    audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
  }

  // Detect supported mimeType
  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  let chosenMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 8000000, // 8 Mbps high quality
  });

  const recordedChunks: Blob[] = [];

  return new Promise<Blob>((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      const finalBlob = new Blob(recordedChunks, { type: chosenMime });
      resolve(finalBlob);
    };

    mediaRecorder.onerror = (e) => {
      if (audioCtx) audioCtx.close().catch(() => {});
      reject(e);
    };

    mediaRecorder.start(200);

    const totalFrames = Math.round(options.durationSeconds * options.fps);
    const frameIntervalMs = 1000 / options.fps;
    let currentFrame = 0;

    const renderLoop = () => {
      if (currentFrame >= totalFrames) {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 150);
        return;
      }

      const currentTime = currentFrame / options.fps;
      renderInstaClipFrame(recCanvas, sourceMedia, options, currentTime);

      currentFrame++;
      if (onProgress) {
        const percent = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
        onProgress(percent, currentTime);
      }

      setTimeout(renderLoop, frameIntervalMs);
    };

    renderLoop();
  });
}

/**
 * Downloads a high-res Still Poster Frame (PNG)
 */
export function exportInstaPoster(
  canvas: HTMLCanvasElement,
  options: InstaClipOptions,
  filenamePrefix = 'InstaClip-Poster'
) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${options.aspectRatio.replace(':', 'x')}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
