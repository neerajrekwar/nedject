/**
 * INSTA CLIP ENGINE - Instagram Cinematic Video Clips & Reels Studio
 * High-performance canvas-based video frame processor supporting:
 * - Direct video (.mp4, .webm, .mov) and image media playback & synthesis
 * - 17 Visual Effects (including Digital RGB Glitch, VHS, 35mm Grain, Halftone, etc.)
 * - Font Captions with 8 typographic styles, customizable positions & badges
 * - Ambient Synthesizer (7 acoustic styles) + Custom Audio File Upload
 * - Multi-ratio Instagram export (9:16 Reels, 4:5 Feed, 1:1 Square, 16:9 Cinema, 2:3)
 */

export type InstaToneMode =
  | 'analog-35mm'
  | 'teal-orange'
  | 'am-line'
  | 'am-dot'
  | 'floyd-steinberg'
  | 'silver-gelatin'
  | 'cyberpunk-neon'
  | 'vhs-camcorder'
  | 'high-contrast'
  | 'clean-cinematic';

export type InstaEffectType =
  | 'none'
  | 'rgb-glitch'            // 1. Digital RGB Split Glitch & Slice Tear
  | 'vhs-tape'              // 2. VHS Tape Scanlines & Tracking Static
  | 'analog-35mm'           // 3. 35mm Analog Film Grain & Dust Scratches
  | 'crt-barrel'            // 4. CRT Phosphor Barrel Distortion
  | 'am-dot-halftone'       // 5. AM Halftone Dot Matrix (Rotogravure)
  | 'am-line-engraving'     // 6. AM Halftone Banknote Diagonal Linework
  | 'bayer-8bit-dither'     // 7. 8-Bit Bayer Ordered Dither
  | 'cyberpunk-neon'        // 8. Cyberpunk Neon Bloom & Glow
  | 'noir-darkroom'         // 9. Noir 21:1 Hard Monochrome
  | 'super8-sepia'          // 10. Vintage Super 8 Warm Sepia Vignette
  | 'anamorphic-flare'      // 11. Anamorphic Blue Streak Lens Flare
  | 'thermal-heatmap'       // 12. Thermal FLIR False-Color Heatmap
  | 'matrix-rain'           // 13. Matrix Green Digital Rain & Phosphor
  | 'hologram-shimmer'      // 14. Hologram Shimmer & Scan Interlace
  | 'prism-rainbow'         // 15. Prism Rainbow Lens Dispersion
  | 'strobe-paparazzi'      // 16. Strobe Flash & Paparazzi Flicker
  | 'risograph-duotone';    // 17. Retro Risograph Two-Tone Duotone

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
  | 'synthwave-80s'
  | 'dark-techno'
  | 'theatrical-braam'
  | 'chill-rhodes'
  | 'custom'
  | 'none'
  | 'muted';

export type CaptionFontStyle =
  | 'brutalist-mono'
  | 'cinematic-serif'
  | 'bold-impact'
  | 'retro-anime-yellow'
  | 'cyber-neon'
  | 'vintage-typewriter'
  | 'glitch-split'
  | 'theatrical-sub';

export type CaptionPosition = 'bottom' | 'center' | 'top';
export type CaptionBadgeStyle = 'solid-black' | 'translucent' | 'neon-border' | 'shadow-only';

export interface CaptionOptions {
  enabled: boolean;
  text: string;
  kickerText?: string;
  fontStyle: CaptionFontStyle;
  position: CaptionPosition;
  badgeStyle: CaptionBadgeStyle;
  fontSize: number; // 20 - 72
  textColor: string; // #ffffff, #ffe600, #ccff00, #00ffff, #ff3366, etc.
  letterSpacing: number; // -1 to 8
  animation: 'none' | 'fade-pulse' | 'typewriter' | 'glow-breath';
}

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
  effect: InstaEffectType;
  effectIntensity: number; // 0 - 100%
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
  durationSeconds: number; // 3 - 60
  fps: number; // 30 or 60
  audioStyle: CinematicAudioStyle;
  customAudioUrl?: string;
  customAudioName?: string;
  audioVolume: number; // 0.0 - 1.5
  // DUAL AUDIO BLENDING CAPABILITIES:
  useOriginalAudio?: boolean; // Auto-detect and use original video audio track
  videoAudioVolume?: number; // 0.0 - 1.5 (Level of original video audio)
  isOriginalAudioMuted?: boolean;
  secondaryAudioVolume?: number; // 0.0 - 1.5 (Level of second custom/preset audio)
  isSecondaryAudioMuted?: boolean;
  blendAudios?: boolean; // Whether to blend both audios together
  showTimecodeOverlay: boolean;
  caption: CaptionOptions;
}

export const DEFAULT_CAPTION_OPTIONS: CaptionOptions = {
  enabled: true,
  text: 'NEO TOKYO // PROTOCOL 2026',
  kickerText: 'ARCHIVAL OPTICAL GRADE',
  fontStyle: 'brutalist-mono',
  position: 'bottom',
  badgeStyle: 'solid-black',
  fontSize: 32,
  textColor: '#ccff00',
  letterSpacing: 2,
  animation: 'glow-breath',
};

export const DEFAULT_INSTA_OPTIONS: InstaClipOptions = {
  aspectRatio: '9:16',
  width: 1080,
  height: 1920,
  toneMode: 'analog-35mm',
  effect: 'rgb-glitch',
  effectIntensity: 70,
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
  audioVolume: 1.0,
  useOriginalAudio: true,
  videoAudioVolume: 1.0,
  isOriginalAudioMuted: false,
  secondaryAudioVolume: 0.7,
  isSecondaryAudioMuted: false,
  blendAudios: true,
  showTimecodeOverlay: true,
  caption: DEFAULT_CAPTION_OPTIONS,
};

export interface EffectMeta {
  id: InstaEffectType;
  name: string;
  category: 'Glitch & CRT' | 'Film & Retro' | 'Halftone & Print' | 'Color & Lens';
  desc: string;
  badge: string;
}

export const INSTA_EFFECTS_CATALOG: EffectMeta[] = [
  { id: 'none', name: 'Original Pure Grade', category: 'Film & Retro', desc: 'Clean cinematic grade with zero digital distortion', badge: 'CLEAN' },
  { id: 'rgb-glitch', name: 'Digital RGB Split Glitch', category: 'Glitch & CRT', desc: 'High-energy chromatic channel split + horizontal video slice displacement', badge: 'GLITCH TARGET' },
  { id: 'vhs-tape', name: 'VHS Tape Scanlines & Tracking', category: 'Glitch & CRT', desc: '1990s magnetic tape scanline raster, head flutter & bottom tracking static', badge: 'VHS CASSETTE' },
  { id: 'analog-35mm', name: '35mm Film Grain & Scratches', category: 'Film & Retro', desc: 'Kodak Vision3 analog motion picture stock with silver halide noise', badge: 'KODAK 35MM' },
  { id: 'crt-barrel', name: 'CRT Monitor Phosphor Barrel', category: 'Glitch & CRT', desc: 'Curved tube television curvature with subpixel RGB shadow mask', badge: 'CRT DISPLAY' },
  { id: 'am-dot-halftone', name: 'AM Clustered Dot Newspaper', category: 'Halftone & Print', desc: 'Offset rotogravure newsprint matrix with optical amplitude modulation', badge: 'ROTOGRAVURE' },
  { id: 'am-line-engraving', name: 'AM Banknote Line Halftone', category: 'Halftone & Print', desc: 'Diagonal 45° movie engraving scanlines modulated by frame luminance', badge: 'ENGRAVING' },
  { id: 'bayer-8bit-dither', name: '8-Bit Retro Bayer Dither', category: 'Halftone & Print', desc: 'Digital 8×8 ordered dithering matrix for classic game console aesthetic', badge: '8-BIT RETRO' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon Bloom', category: 'Color & Lens', desc: 'Hyper-saturated electric cyan and magenta bloom across specular highlights', badge: 'CYBERPUNK' },
  { id: 'noir-darkroom', name: 'Noir 21:1 Hard Monochrome', category: 'Film & Retro', desc: 'Velvety high-contrast silver gelatin darkroom S-curve for stark editorial', badge: 'DARKROOM NOIR' },
  { id: 'super8-sepia', name: 'Vintage Super 8 Warm Sepia', category: 'Film & Retro', desc: '1970s warm sepia tone with heavy aged edge vignette and dust flecks', badge: 'SUPER 8' },
  { id: 'anamorphic-flare', name: 'Anamorphic Blue Streak Flare', category: 'Color & Lens', desc: 'Horizontal sci-fi anamorphic lens flare streaks across bright highlights', badge: 'ANAMORPHIC' },
  { id: 'thermal-heatmap', name: 'Thermal FLIR Infrared Heatmap', category: 'Color & Lens', desc: 'False-color infrared spectrum mapping thermal gradients across subjects', badge: 'THERMAL FLIR' },
  { id: 'matrix-rain', name: 'Matrix Green Phosphor Rain', category: 'Glitch & CRT', desc: 'Terminal green phosphor decay with falling matrix rain digital glyphs', badge: 'MATRIX TERMINAL' },
  { id: 'hologram-shimmer', name: 'Hologram Shimmer & Interlace', category: 'Glitch & CRT', desc: 'Electric cyan holographic projection with alternating scanline shimmer', badge: 'HOLOGRAM' },
  { id: 'prism-rainbow', name: 'Prism Rainbow Lens Flare', category: 'Color & Lens', desc: 'Refractive prism edge dispersion splitting light into spectral rainbows', badge: 'PRISM OPTIC' },
  { id: 'strobe-paparazzi', name: 'Strobe Flash & Paparazzi Burst', category: 'Film & Retro', desc: 'Rhythmic white flashbulb strobing mimicking red-carpet paparazzi cameras', badge: 'STROBE' },
  { id: 'risograph-duotone', name: 'Retro Risograph Two-Tone', category: 'Halftone & Print', desc: 'Japanese riso press duotone ink blending with paper grain tooth', badge: 'RISOGRAPH' },
];

export const CAPTION_STYLES_LIST: { id: CaptionFontStyle; label: string; desc: string; sample: string }[] = [
  { id: 'brutalist-mono', label: 'Brutalist Monospace', desc: 'Industrial terminal font with bold block styling', sample: 'NEO TOKYO // 2026' },
  { id: 'cinematic-serif', label: 'Cinematic Movie Serif', desc: 'Elegant dramatic theatrical title font', sample: 'The Autumn Solitude' },
  { id: 'bold-impact', label: 'Modern Sans Impact', desc: 'Heavyweight street typography for reels', sample: 'DO NOT FEAR THE VOID' },
  { id: 'retro-anime-yellow', label: 'Retro 90s Anime Subtitle', desc: 'Classic yellow VHS subtitle with black stroke', sample: 'Wait, is that true?' },
  { id: 'cyber-neon', label: 'Cyberpunk Neon Glow', desc: 'Glowing electric cyan with pink outer aura', sample: 'SYSTEM OVERRIDE' },
  { id: 'vintage-typewriter', label: 'Mechanical Typewriter', desc: 'Monochrome ink-ribbon strike typography', sample: 'CHAPTER 04: THE DAWN' },
  { id: 'glitch-split', label: 'Glitch Chromatic Stamp', desc: 'Dual-offset red and cyan shifted text', sample: 'CORRUPTED MEMORY' },
  { id: 'theatrical-sub', label: 'Theatrical Lower Third', desc: 'Minimal clean documentary subtitle', sample: 'Location: Shinjuku, 02:44 AM' },
];

export const AUDIO_STYLES_CATALOG: {
  id: CinematicAudioStyle;
  label: string;
  category: 'Synthesizer' | 'Beats' | 'Custom';
  desc: string;
}[] = [
  { id: 'lofi-vinyl', label: 'Lo-Fi Vinyl & Tape Hiss', category: 'Synthesizer', desc: 'Warm 33 RPM needle crackle & organic tape noise' },
  { id: 'cinematic-drone', label: 'Sub-Bass Cinematic Drone', category: 'Synthesizer', desc: 'Low 55Hz harmonic sub-bass theater resonance' },
  { id: 'ambient-shimmer', label: 'Ambient Cyber Shimmer', category: 'Synthesizer', desc: 'Soft spatial breeze & atmospheric pink noise' },
  { id: 'synthwave-80s', label: 'Retro 80s Synthwave Bass', category: 'Synthesizer', desc: 'Pulsing 110 BPM analog arpeggiator & neon synths' },
  { id: 'dark-techno', label: 'Dark Techno Industrial Kick', category: 'Beats', desc: 'Heavy four-on-the-floor warehouse bass pulse' },
  { id: 'theatrical-braam', label: 'Theatrical Inception Braam', category: 'Synthesizer', desc: 'Epic low brass trailer roar with long reverb tail' },
  { id: 'chill-rhodes', label: 'Chill Hop Rain & Rhodes', category: 'Beats', desc: 'Relaxing rain textures with warm electric piano chords' },
  { id: 'custom', label: 'Custom Audio Track (Uploaded)', category: 'Custom', desc: 'Use your own uploaded MP3, WAV, or AAC audio file' },
  { id: 'none', label: 'No Secondary Audio (Original Video Only)', category: 'Custom', desc: 'Plays pure original video audio without any background music or synths' },
  { id: 'muted', label: 'Muted (Silent Video)', category: 'Custom', desc: 'Export pure video without any audio stream' },
];

export const CINEMATIC_SPECIMENS = [
  {
    id: 'neo-tokyo',
    title: 'Neo Tokyo Midnight Neon',
    badge: 'CYBERPUNK',
    desc: 'Rain-slicked asphalt reflecting vibrant magenta & electric cyan neon signage',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cinematic-desert',
    title: 'Dune Solitude Golden Hour',
    badge: 'CINEMASCOPE',
    desc: 'Sweeping undulating desert sand dunes under deep amber and warm haze',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
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
    case 'film-jitter': {
      const jitterX = Math.sin(progress * 137.5) * 3 * intensity;
      const jitterY = Math.cos(progress * 223.1) * 2.5 * intensity;
      const jitterRot = Math.sin(progress * 89.3) * 0.2 * intensity;
      return { scale: 1.04, transX: jitterX, transY: jitterY, rotate: jitterRot };
    }
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
 * Renders font caption overlay directly onto the canvas frame
 */
export function renderCaptionOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  caption: CaptionOptions,
  timeSeconds: number
) {
  if (!caption.enabled || !caption.text.trim()) return;

  ctx.save();

  // Position calculation
  let targetY = h * 0.85; // Bottom default
  if (caption.position === 'center') targetY = h * 0.5;
  if (caption.position === 'top') targetY = h * 0.15;

  const centerX = w / 2;
  const fontSize = Math.max(16, Math.round((caption.fontSize / 1080) * Math.min(w, h)));

  // Font Family resolution
  let fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  if (caption.fontStyle === 'cinematic-serif') {
    fontFamily = '"Georgia", "Times New Roman", serif';
  } else if (caption.fontStyle === 'bold-impact') {
    fontFamily = '"Impact", "Arial Black", sans-serif';
  } else if (caption.fontStyle === 'vintage-typewriter') {
    fontFamily = '"Courier New", Courier, monospace';
  }

  // Animation pulse
  let animAlpha = 1.0;
  if (caption.animation === 'fade-pulse') {
    animAlpha = 0.8 + 0.2 * Math.sin(timeSeconds * 4);
  } else if (caption.animation === 'glow-breath') {
    animAlpha = 0.85 + 0.15 * Math.sin(timeSeconds * 3);
  }

  ctx.globalAlpha = animAlpha;

  // Measure text
  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(caption.text);
  const textWidth = metrics.width;
  const paddingX = Math.round(fontSize * 0.6);
  const paddingY = Math.round(fontSize * 0.35);
  const boxW = textWidth + paddingX * 2;
  const boxH = fontSize * 1.35 + (caption.kickerText ? fontSize * 0.6 : 0);
  const boxX = centerX - boxW / 2;
  const boxY = targetY - fontSize * 0.95;

  // 1. Draw Badge / Pill Background
  if (caption.badgeStyle === 'solid-black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = caption.textColor || '#ccff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
  } else if (caption.badgeStyle === 'translucent') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
  } else if (caption.badgeStyle === 'neon-border') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ccff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
  }

  // 2. Kicker Text (Sub-heading)
  if (caption.kickerText && caption.kickerText.trim()) {
    ctx.font = `700 ${Math.round(fontSize * 0.36)}px ui-monospace, monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(caption.kickerText.toUpperCase(), centerX, targetY - fontSize * 0.45);
  }

  // 3. Main Headline Text
  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';

  if (caption.fontStyle === 'retro-anime-yellow') {
    // Japanese anime subtitle style: yellow text with thick black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.14));
    ctx.lineJoin = 'round';
    ctx.strokeText(caption.text, centerX, targetY);
    ctx.fillStyle = '#ffe600';
    ctx.fillText(caption.text, centerX, targetY);
  } else if (caption.fontStyle === 'glitch-split') {
    // Red / Cyan split chromatic glitch
    const jitter = Math.sin(timeSeconds * 25) * 4;
    ctx.fillStyle = 'rgba(255, 0, 60, 0.85)';
    ctx.fillText(caption.text, centerX - jitter, targetY);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.fillText(caption.text, centerX + jitter, targetY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption.text, centerX, targetY);
  } else if (caption.fontStyle === 'cyber-neon') {
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(caption.text, centerX, targetY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption.text, centerX, targetY);
    ctx.shadowBlur = 0;
  } else {
    // Standard text render with drop shadow
    if (caption.badgeStyle === 'shadow-only') {
      ctx.shadowColor = 'rgba(0,0,0,0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    ctx.fillStyle = caption.textColor || '#ffffff';
    ctx.fillText(caption.text, centerX, targetY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.restore();
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
  const isVideo = source instanceof HTMLVideoElement;
  
  // For video, only apply slight camera motion if requested, or keep static to avoid double movement
  const camera = computeCameraTransform(
    options.cameraMotion,
    progress,
    isVideo ? options.motionIntensity * 0.4 : options.motionIntensity
  );

  // Clear canvas
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Source aspect ratio math (Cover fit)
  const srcW = (isVideo ? source.videoWidth : source.naturalWidth) || 1200;
  const srcH = (isVideo ? source.videoHeight : source.naturalHeight) || 1200;

  const srcAspect = srcW / srcH;
  const targetAspect = w / h;

  let drawW = w;
  let drawH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (srcAspect > targetAspect) {
    drawH = h;
    drawW = h * srcAspect;
    offsetX = (w - drawW) / 2;
  } else {
    drawW = w;
    drawH = w / srcAspect;
    offsetY = (h - drawH) / 2;
  }

  // Apply Camera Motion Transformations
  ctx.translate(w / 2, h / 2);
  if (camera.rotate !== 0) ctx.rotate((camera.rotate * Math.PI) / 180);
  ctx.scale(camera.scale, camera.scale);
  ctx.translate(-w / 2 + camera.transX, -h / 2 + camera.transY);

  // Draw source image or video frame
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
  const effect = options.effect || 'none';
  const effectAmt = (options.effectIntensity || 70) / 100;

  // Pixel manipulation loop
  for (let i = 0; i < pixelCount; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness & Contrast
    r += brightnessOffset;
    g += brightnessOffset;
    b += brightnessOffset;

    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // 2. Saturation
    if (saturation !== 1.0) {
      r = lum + (r - lum) * saturation;
      g = lum + (g - lum) * saturation;
      b = lum + (b - lum) * saturation;
    }

    // 3. Specific Effect Processing (17 Effects)
    if (effect === 'rgb-glitch') {
      // Channel phase offset will be applied after loop in secondary pass
    } else if (effect === 'thermal-heatmap') {
      // Map luminance 0-255 to false thermal colors (Navy -> Purple -> Orange -> Yellow -> White)
      const norm = Math.max(0, Math.min(255, lum)) / 255;
      if (norm < 0.25) {
        r = 10;
        g = 15;
        b = Math.round(norm * 4 * 200 + 40);
      } else if (norm < 0.5) {
        const sub = (norm - 0.25) * 4;
        r = Math.round(sub * 200 + 10);
        g = 20;
        b = Math.round(240 - sub * 80);
      } else if (norm < 0.75) {
        const sub = (norm - 0.5) * 4;
        r = 240;
        g = Math.round(sub * 200);
        b = 10;
      } else {
        const sub = (norm - 0.75) * 4;
        r = 255;
        g = Math.round(200 + sub * 55);
        b = Math.round(sub * 255);
      }
    } else if (effect === 'matrix-rain') {
      // Terminal phosphor green
      r = Math.round(lum * 0.12);
      g = Math.round(lum * 1.35 + 25);
      b = Math.round(lum * 0.18);
    } else if (effect === 'super8-sepia') {
      // Aged warm sepia
      r = lum * 1.18 + 24;
      g = lum * 0.98 + 10;
      b = lum * 0.76 - 10;
    } else if (effect === 'noir-darkroom') {
      // Extreme 21:1 stark darkroom S-curve
      lum = lum < 128 ? (lum / 128) ** 1.8 * 115 : 128 + ((lum - 128) / 128) ** 0.8 * 127;
      r = lum;
      g = lum;
      b = lum;
    } else if (effect === 'risograph-duotone') {
      // Fluorescent pink (#FF007F) & Deep Teal (#004C54)
      const norm = Math.max(0, Math.min(255, lum)) / 255;
      r = Math.round(norm * 255 + (1 - norm) * 0);
      g = Math.round(norm * 20 + (1 - norm) * 76);
      b = Math.round(norm * 135 + (1 - norm) * 84);
    } else if (effect === 'cyberpunk-neon') {
      if (lum > 130) {
        r = Math.min(255, r * 1.3 + 25);
        g = Math.min(255, g * 0.55);
        b = Math.min(255, b * 1.4 + 45);
      } else {
        r = Math.max(0, r * 0.55);
        g = Math.min(255, g * 1.25 + 15);
        b = Math.max(0, b * 0.9);
      }
    }

    // Invert if active
    if (options.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Put modified pixels back
  ctx.putImageData(imgData, 0, 0);

  // 4. Secondary Pass: RGB Split Glitch & Horizontal Slice Tears (User requested!)
  if (effect === 'rgb-glitch' && effectAmt > 0) {
    ctx.save();
    const glitchDist = Math.round(effectAmt * 18);
    const sliceCount = Math.round(effectAmt * 6);

    // Chromatic RGB Channel Shift
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(targetCanvas, -glitchDist, 0); // Red shift
    ctx.drawImage(targetCanvas, glitchDist, 0);  // Cyan shift

    // Horizontal Slice Displacement
    for (let s = 0; s < sliceCount; s++) {
      const sliceY = (Math.sin(timeSeconds * 12.5 + s * 17) * 0.5 + 0.5) * h;
      const sliceH = 8 + (s % 4) * 14;
      const sliceOffset = (Math.sin(timeSeconds * 42 + s * 9) * 2 - 1) * glitchDist * 1.8;
      ctx.drawImage(targetCanvas, 0, sliceY, w, sliceH, sliceOffset, sliceY, w, sliceH);
    }
    ctx.restore();
  }

  // 5. VHS Scanlines & Bottom Tracking Noise
  if (effect === 'vhs-tape') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }
    // Bottom tracking noise band
    const trackingY = h - 60 + Math.sin(timeSeconds * 3) * 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let x = 0; x < w; x += 6) {
      if (Math.random() > 0.4) {
        ctx.fillRect(x, trackingY + Math.random() * 20, 4, 2);
      }
    }
    ctx.restore();
  }

  // 6. CRT Phosphor Barrel Distortion & Scanlines
  if (effect === 'crt-barrel') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    // Vignette barrel edge
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 7. AM Halftone Dot Matrix
  if (effect === 'am-dot-halftone') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#000000';
    const dotStep = Math.max(4, Math.round(options.halftoneDotSize * 2.2));
    for (let y = 0; y < h; y += dotStep) {
      for (let x = 0; x < w; x += dotStep) {
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, options.halftoneDotSize * 0.45), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 8. AM Banknote Line Halftone
  if (effect === 'am-line-engraving') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(options.halftoneDotSize * 0.4));
    const angleRad = (options.screenAngle * Math.PI) / 180;
    const step = Math.max(4, Math.round(options.halftoneDotSize * 1.8));
    const maxDim = Math.hypot(w, h);
    ctx.beginPath();
    for (let d = -maxDim; d < maxDim; d += step) {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      ctx.moveTo(w / 2 + d * cos - maxDim * sin, h / 2 + d * sin + maxDim * cos);
      ctx.lineTo(w / 2 + d * cos + maxDim * sin, h / 2 + d * sin - maxDim * cos);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 9. Anamorphic Blue Streak Lens Flare
  if (effect === 'anamorphic-flare') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const flareY = h * 0.42 + Math.sin(timeSeconds * 1.5) * 40;
    const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);
    flareGrad.addColorStop(0, 'rgba(0, 200, 255, 0)');
    flareGrad.addColorStop(0.3, 'rgba(0, 200, 255, 0.15)');
    flareGrad.addColorStop(0.5, 'rgba(180, 240, 255, 0.85)');
    flareGrad.addColorStop(0.7, 'rgba(0, 200, 255, 0.15)');
    flareGrad.addColorStop(1, 'rgba(0, 200, 255, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, flareY - 12, w, 24);
    ctx.restore();
  }

  // 10. Hologram Shimmer & Interlace
  if (effect === 'hologram-shimmer') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(0, 255, 240, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 255, 240, 0.22)';
    const scanOffset = (timeSeconds * 60) % 8;
    for (let y = scanOffset; y < h; y += 8) {
      ctx.fillRect(0, y, w, 3);
    }
    ctx.restore();
  }

  // 11. Strobe Paparazzi Flash
  if (effect === 'strobe-paparazzi') {
    const isFlash = Math.sin(timeSeconds * 16) > 0.88;
    if (isFlash) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  // 12. Prism Rainbow Lens Dispersion
  if (effect === 'prism-rainbow') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const rainbowGrad = ctx.createRadialGradient(w * 0.85, h * 0.15, 10, w * 0.85, h * 0.15, w * 0.6);
    rainbowGrad.addColorStop(0, 'rgba(255, 0, 0, 0.45)');
    rainbowGrad.addColorStop(0.2, 'rgba(255, 165, 0, 0.4)');
    rainbowGrad.addColorStop(0.4, 'rgba(255, 255, 0, 0.35)');
    rainbowGrad.addColorStop(0.6, 'rgba(0, 255, 0, 0.3)');
    rainbowGrad.addColorStop(0.8, 'rgba(0, 200, 255, 0.35)');
    rainbowGrad.addColorStop(1, 'rgba(238, 130, 238, 0)');
    ctx.fillStyle = rainbowGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 13. Film Grain (Always applied based on grainIntensity)
  if (options.grainIntensity > 0) {
    const grainCanvas = document.createElement('canvas');
    const gw = Math.min(w, 360);
    const gh = Math.min(h, 360);
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

  // 14. Anamorphic Letterbox Matte (Cinema Black Bars)
  if (options.letterbox !== 'none') {
    let barHeight = 0;
    if (options.letterbox === 'cinemascope') {
      barHeight = Math.max(0, (h - w / 2.39) / 2);
    } else if (options.letterbox === 'academy') {
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

  // 15. Render Font Captions
  if (options.caption && options.caption.enabled) {
    renderCaptionOverlay(ctx, w, h, options.caption, timeSeconds);
  }

  // 16. Brutalist Timecode Overlay
  if (options.showTimecodeOverlay) {
    ctx.save();
    const curSeconds = timeSeconds % options.durationSeconds;
    const mins = Math.floor(curSeconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(curSeconds % 60).toString().padStart(2, '0');
    const frames = Math.floor((curSeconds % 1) * options.fps).toString().padStart(2, '0');
    const timecode = `REC [${mins}:${secs}:${frames}] · 60FPS · ${options.aspectRatio} · ${options.effect.toUpperCase()}`;

    ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillStyle = '#000000';
    ctx.fillRect(24, 24, ctx.measureText(timecode).width + 20, 24);
    ctx.fillStyle = '#ccff00';
    ctx.fillText(timecode, 34, 40);
    ctx.restore();
  }
}

/**
 * Decodes audio from any video or audio file/blob/URL into an AudioBuffer
 */
export async function decodeMediaAudio(
  mediaUrlOrBlob: string | Blob,
  audioCtx?: AudioContext
): Promise<AudioBuffer | null> {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = audioCtx || new AudioCtx();
    let arrayBuffer: ArrayBuffer;
    if (typeof mediaUrlOrBlob === 'string') {
      const response = await fetch(mediaUrlOrBlob);
      arrayBuffer = await response.arrayBuffer();
    } else {
      arrayBuffer = await mediaUrlOrBlob.arrayBuffer();
    }
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    if (!audioCtx && ctx.state !== 'closed') {
      ctx.close().catch(() => {});
    }
    return audioBuffer;
  } catch (err) {
    console.warn('Could not decode audio track (media may be silent):', err);
    return null;
  }
}

export interface AudioMixerSources {
  videoElement?: HTMLVideoElement | null;
  videoAudioBuffer?: AudioBuffer | null;
  customAudioElement?: HTMLAudioElement | null;
  customAudioBuffer?: AudioBuffer | null;
}

/**
 * Dual Audio Mixer & Synthesizer Engine using Web Audio API
 * Generates continuous audio streams (synthesized presets or custom track)
 * AND blends original video audio with independent gain channels!
 */
export function createCinematicAudioStream(
  audioStyleOrOptions: CinematicAudioStyle | InstaClipOptions,
  customAudioElementOrSources?: HTMLAudioElement | null | AudioMixerSources
): {
  context: AudioContext;
  stream: MediaStream | null;
  videoGainNode?: GainNode;
  secondaryGainNode?: GainNode;
  masterGainNode?: GainNode;
} {
  if (typeof window === 'undefined') {
    return { context: null as any, stream: null };
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return { context: null as any, stream: null };

  const ctx = new AudioCtx();
  const dest = ctx.createMediaStreamDestination();

  const isOptionsObj = typeof audioStyleOrOptions === 'object' && audioStyleOrOptions !== null;
  const options: InstaClipOptions = isOptionsObj
    ? (audioStyleOrOptions as InstaClipOptions)
    : ({
        audioStyle: audioStyleOrOptions as CinematicAudioStyle,
        audioVolume: 1.0,
        useOriginalAudio: false,
        videoAudioVolume: 1.0,
        isOriginalAudioMuted: false,
        secondaryAudioVolume: 0.7,
        isSecondaryAudioMuted: false,
      } as any);

  let sources: AudioMixerSources = {};
  if (customAudioElementOrSources) {
    if (customAudioElementOrSources instanceof HTMLAudioElement) {
      sources = { customAudioElement: customAudioElementOrSources };
    } else {
      sources = customAudioElementOrSources;
    }
  }

  const masterGain = ctx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(dest);

  let hasAnyActiveAudio = false;

  // CHANNEL 1: Original Video Audio
  const useOrig = options.useOriginalAudio ?? true;
  const isOrigMuted = options.isOriginalAudioMuted ?? false;
  const origVol = isOrigMuted ? 0 : (options.videoAudioVolume ?? 1.0);

  const videoGain = ctx.createGain();
  videoGain.gain.value = origVol;
  videoGain.connect(masterGain);

  if (useOrig && origVol > 0) {
    if (sources.videoAudioBuffer) {
      const vidBufferSource = ctx.createBufferSource();
      vidBufferSource.buffer = sources.videoAudioBuffer;
      vidBufferSource.loop = true;
      vidBufferSource.connect(videoGain);
      vidBufferSource.start(0);
      hasAnyActiveAudio = true;
    } else if (sources.videoElement) {
      try {
        const stream = (sources.videoElement as any).captureStream?.() || (sources.videoElement as any).mozCaptureStream?.();
        if (stream && stream.getAudioTracks().length > 0) {
          const track = stream.getAudioTracks()[0];
          const mediaStreamSource = ctx.createMediaStreamSource(new MediaStream([track]));
          mediaStreamSource.connect(videoGain);
          hasAnyActiveAudio = true;
        }
      } catch (err) {
        console.warn('Could not attach video element audio to stream destination:', err);
      }
    }
  }

  // CHANNEL 2: Secondary / Custom Audio & Presets
  const style = options.audioStyle ?? 'muted';
  const isSecMuted = options.isSecondaryAudioMuted ?? false;
  const secVol = isSecMuted || style === 'muted' || style === 'none'
    ? 0
    : (options.secondaryAudioVolume ?? options.audioVolume ?? 0.7);

  const secondaryGain = ctx.createGain();
  secondaryGain.gain.value = secVol;
  secondaryGain.connect(masterGain);

  if (secVol > 0 && style !== 'muted' && style !== 'none') {
    if (style === 'custom') {
      if (sources.customAudioBuffer) {
        const customBufferSource = ctx.createBufferSource();
        customBufferSource.buffer = sources.customAudioBuffer;
        customBufferSource.loop = true;
        customBufferSource.connect(secondaryGain);
        customBufferSource.start(0);
        hasAnyActiveAudio = true;
      } else if (sources.customAudioElement) {
        try {
          const stream = (sources.customAudioElement as any).captureStream?.() || (sources.customAudioElement as any).mozCaptureStream?.();
          if (stream && stream.getAudioTracks().length > 0) {
            const track = stream.getAudioTracks()[0];
            const mediaStreamSource = ctx.createMediaStreamSource(new MediaStream([track]));
            mediaStreamSource.connect(secondaryGain);
            hasAnyActiveAudio = true;
          } else {
            const sourceNode = ctx.createMediaElementSource(sources.customAudioElement);
            sourceNode.connect(secondaryGain);
            hasAnyActiveAudio = true;
          }
        } catch {
          // If already connected
        }
      }
    } else if (style === 'lofi-vinyl') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const base = (Math.random() * 2 - 1) * 0.02;
        const isClick = Math.random() < 0.0006;
        output[i] = base + (isClick ? (Math.random() * 2 - 1) * 0.35 : 0);
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2400;

      whiteNoise.connect(filter);
      filter.connect(secondaryGain);
      whiteNoise.start();
      hasAnyActiveAudio = true;
    } else if (style === 'cinematic-drone') {
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
      droneFilter.connect(secondaryGain);

      osc1.start();
      osc2.start();
      hasAnyActiveAudio = true;
    } else if (style === 'ambient-shimmer') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.035;
      }
      const pinkNoise = ctx.createBufferSource();
      pinkNoise.buffer = noiseBuffer;
      pinkNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 1.2;

      pinkNoise.connect(filter);
      filter.connect(secondaryGain);
      pinkNoise.start();
      hasAnyActiveAudio = true;
    } else if (style === 'synthwave-80s') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 65.4; // C2

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 4.0; // 4Hz pulse
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 400;
      lfo.connect(filter.frequency);
      lfo.start();

      osc.connect(filter);
      filter.connect(secondaryGain);
      osc.start();
      hasAnyActiveAudio = true;
    } else if (style === 'dark-techno') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 50;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;

      osc.connect(filter);
      filter.connect(secondaryGain);
      osc.start();
      hasAnyActiveAudio = true;
    } else if (style === 'theatrical-braam') {
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 43.65; // F1

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 65.4;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(secondaryGain);
      osc1.start();
      osc2.start();
      hasAnyActiveAudio = true;
    } else if (style === 'chill-rhodes') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 220; // A3 warm tone

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;

      osc.connect(filter);
      filter.connect(secondaryGain);
      osc.start();
      hasAnyActiveAudio = true;
    }
  }

  if (!hasAnyActiveAudio) {
    return {
      context: ctx,
      stream: null,
      videoGainNode: videoGain,
      secondaryGainNode: secondaryGain,
      masterGainNode: masterGain,
    };
  }

  return {
    context: ctx,
    stream: dest.stream,
    videoGainNode: videoGain,
    secondaryGainNode: secondaryGain,
    masterGainNode: masterGain,
  };
}

/**
 * Records Canvas animation in real time to MP4/WebM video blob
 * Combines both original video audio and secondary custom/preset audio with precise gain levels!
 */
export async function recordInstaClipVideo(
  sourceCanvas: HTMLCanvasElement,
  sourceMedia: HTMLImageElement | HTMLVideoElement,
  options: InstaClipOptions,
  onProgress?: (percent: number, currentSecond: number) => void,
  customAudioElement?: HTMLAudioElement | null,
  videoAudioBuffer?: AudioBuffer | null,
  customAudioBuffer?: AudioBuffer | null
): Promise<Blob> {
  const recCanvas = document.createElement('canvas');
  recCanvas.width = options.width;
  recCanvas.height = options.height;

  const canvasStream = recCanvas.captureStream(options.fps);
  const { context: audioCtx, stream: audioStream } = createCinematicAudioStream(
    options,
    {
      videoElement: sourceMedia instanceof HTMLVideoElement ? sourceMedia : null,
      videoAudioBuffer,
      customAudioElement,
      customAudioBuffer,
    }
  );

  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
  if (audioStream) {
    audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
  }

  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const chosenMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 8000000,
  });

  const recordedChunks: Blob[] = [];

  return new Promise<Blob>((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
      const finalBlob = new Blob(recordedChunks, { type: chosenMime });
      resolve(finalBlob);
    };

    mediaRecorder.onerror = (e) => {
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
      reject(e);
    };

    mediaRecorder.start(200);

    const totalFrames = Math.round(options.durationSeconds * options.fps);
    const frameIntervalMs = 1000 / options.fps;
    let currentFrame = 0;
    const isVideo = sourceMedia instanceof HTMLVideoElement;
    const startTime = performance.now();

    const renderLoop = async () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const currentSec = (currentFrame / options.fps);

      // If video source, seek video before rendering frame
      if (isVideo && sourceMedia.duration > 0) {
        sourceMedia.currentTime = currentSec % sourceMedia.duration;
        // Small pause to allow frame seek
        await new Promise((r) => setTimeout(r, 10));
      }

      renderInstaClipFrame(recCanvas, sourceMedia, options, currentSec);

      currentFrame++;
      const percent = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
      if (onProgress) {
        onProgress(percent, currentSec);
      }

      // Pace frame generation to match target wall clock time for audio sync
      const targetWallElapsed = currentFrame * frameIntervalMs;
      const actualWallElapsed = performance.now() - startTime;
      const delay = Math.max(4, targetWallElapsed - actualWallElapsed);
      setTimeout(renderLoop, delay);
    };

    renderLoop();
  });
}

/**
 * Exports current canvas as a 4K Still Poster PNG
 */
export function exportInstaPoster(
  canvas: HTMLCanvasElement,
  options: InstaClipOptions,
  filenamePrefix: string = 'InstaClip-Poster'
) {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${options.aspectRatio.replace(':', 'x')}_${options.effect}_${Date.now()}.png`;
  a.click();
}
