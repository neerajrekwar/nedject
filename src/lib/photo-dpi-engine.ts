import { jsPDF } from 'jspdf';
import { insertDpiIntoPngBlob } from './qr-engine';

export type BWToneMode =
  | 'am-line'          // AM diagonal line halftone (newspaper/engraving line screen)
  | 'am-dot'           // AM clustered dot halftone (newspaper/rotogravure round dot screen)
  | 'am-crosshatch'    // AM intersecting dual diagonal lines
  | 'am-diamond'       // AM diamond/elliptical dot screen
  | 'floyd-steinberg'  // 1-bit error diffusion stochastic dither
  | 'bayer-ordered'    // 8x8 ordered Bayer matrix dither
  | 'high-contrast'    // Commercial 21:1 continuous-tone silver
  | 'silver-gelatin'   // Darkroom S-curve analog film
  | 'hard-threshold'   // Binary silhouette stencil
  | 'halftone-screen'; // Legacy alias for am-dot

export type CanvasFrameStyle =
  | 'none'
  | 'heritage'
  | 'vintage'
  | 'polaroid'
  | 'industrial'
  | 'passepartout'
  | 'cyber-hud';

export type FrameColorPalette =
  | 'monochrome'
  | 'heritage-gold'
  | 'darkroom-red'
  | 'cyber-lime'
  | 'blueprint';

export interface PhotoDPIOptions {
  dpi: number;                  // Output Printer Resolution: 300, 600, 1200, 2400
  lpi: number;                  // Screen Frequency (Lines Per Inch): 45 to 150 (default: 55)
  screenAngle: number;          // Screen Angle in degrees: default 45° (0°, 15°, 45°, 75°, 90°)
  toneMode: BWToneMode;
  contrast: number;             // 0.5 to 3.0 (default: 1.45)
  brightness: number;           // 0.5 to 2.0 (default: 1.0)
  sharpness: number;            // 0 to 100 (default: 35)
  invert: boolean;
  threshold: number;            // 0 to 255 (default: 128)
  halftoneDotSize: number;      // fallback dot pitch (derived from DPI/LPI)
  targetWidthInches: number;
  targetHeightInches: number;
  aspectRatio: string;          // '1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '4:3', 'A4', 'custom'
  aspectMode: 'cover' | 'contain' | 'original';
  frameStyle: CanvasFrameStyle;
  frameWidthPercent: number;    // Frame margin: 2 to 16% (default: 6)
  frameColorPalette: FrameColorPalette;
  frameCaption: string;         // Label shown on plaque/polaroid/industrial stamp
}

export interface PhotoDPIExportResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
  format: 'PNG' | 'PDF' | 'SVG';
  widthPx: number;
  heightPx: number;
  dpi: number;
  physicalWidthInches: number;
  physicalHeightInches: number;
}

// 8x8 Bayer Ordered Dither Matrix normalized to 0..255
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((val) => Math.round((val / 64) * 255)));

/**
 * Loads an image from string, File, or Image element
 */
export function loadSourceImage(source: HTMLImageElement | string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (source instanceof HTMLImageElement) {
      if (source.complete && source.naturalWidth > 0) {
        resolve(source);
        return;
      }
      source.onload = () => resolve(source);
      source.onerror = (e) => reject(e);
      return;
    }

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = reader.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = source;
  });
}

/**
 * Renders source image onto canvas with calibrated DPI resolution, monochrome filtering,
 * AM halftone screening (line, dot, crosshatch), and customizable canvas frames.
 */
export async function renderPhotoToDPICanvas(
  canvas: HTMLCanvasElement,
  imageSource: HTMLImageElement | string | File,
  options: PhotoDPIOptions
): Promise<{ widthPx: number; heightPx: number }> {
  const img = await loadSourceImage(imageSource);

  const {
    dpi = 300,
    lpi = 55,
    screenAngle = 45,
    toneMode = 'am-line',
    contrast = 1.45,
    brightness = 1.0,
    sharpness = 35,
    invert = false,
    threshold = 128,
    targetWidthInches = 5,
    targetHeightInches = 7,
    aspectMode = 'cover',
    frameStyle = 'none',
    frameWidthPercent = 6,
    frameColorPalette = 'monochrome',
    frameCaption = 'ARCHIVAL SPECIMEN',
  } = options;

  let widthPx = Math.round(targetWidthInches * dpi);
  let heightPx = Math.round(targetHeightInches * dpi);

  if (aspectMode === 'original') {
    const aspect = img.naturalWidth / img.naturalHeight;
    if (aspect > 1) {
      widthPx = Math.round(targetWidthInches * dpi);
      heightPx = Math.round(widthPx / aspect);
    } else {
      heightPx = Math.round(targetHeightInches * dpi);
      widthPx = Math.round(heightPx * aspect);
    }
  }

  canvas.width = widthPx;
  canvas.height = heightPx;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { widthPx, heightPx };

  // Calculate inner photo area inside frame
  let photoX = 0;
  let photoY = 0;
  let photoW = widthPx;
  let photoH = heightPx;

  if (frameStyle !== 'none') {
    const margin = Math.round(Math.min(widthPx, heightPx) * (frameWidthPercent / 100));
    if (frameStyle === 'polaroid') {
      // Polaroid has equal sides and top, with bottom-heavy margin (3x)
      photoX = margin;
      photoY = margin;
      photoW = widthPx - margin * 2;
      photoH = heightPx - Math.round(margin * 3.4);
    } else {
      photoX = margin;
      photoY = margin;
      photoW = widthPx - margin * 2;
      photoH = heightPx - margin * 2;
    }
  }

  // Prevent degenerate photo dimensions
  photoW = Math.max(10, photoW);
  photoH = Math.max(10, photoH);

  // 1. Offscreen canvas for the photo content processing
  const offscreen = document.createElement('canvas');
  offscreen.width = photoW;
  offscreen.height = photoH;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return { widthPx, heightPx };

  // Fill base white
  offCtx.fillStyle = '#ffffff';
  offCtx.fillRect(0, 0, photoW, photoH);

  // Compute crop and draw photo onto offscreen canvas
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const photoAspect = photoW / photoH;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (aspectMode === 'cover') {
    if (imgAspect > photoAspect) {
      sw = img.naturalHeight * photoAspect;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / photoAspect;
      sy = (img.naturalHeight - sh) / 2;
    }
    offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, photoW, photoH);
  } else if (aspectMode === 'contain') {
    let dw = photoW;
    let dh = photoH;
    let dx = 0;
    let dy = 0;
    if (imgAspect > photoAspect) {
      dh = photoW / imgAspect;
      dy = (photoH - dh) / 2;
    } else {
      dw = photoH * imgAspect;
      dx = (photoW - dw) / 2;
    }
    offCtx.drawImage(img, dx, dy, dw, dh);
  } else {
    offCtx.drawImage(img, 0, 0, photoW, photoH);
  }

  // 2. Pixel buffer luminance & contrast processing
  const imgData = offCtx.getImageData(0, 0, photoW, photoH);
  const data = imgData.data;
  const grayBuffer = new Float32Array(photoW * photoH);

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Standard Rec. 601 Luminance
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply contrast and brightness adjustments
    lum = (lum - 128) * contrast + 128 + (brightness - 1.0) * 128;
    if (invert) lum = 255 - lum;

    grayBuffer[idx] = Math.max(0, Math.min(255, lum));
  }

  // 3. Unsharp Mask Sharpness Pass
  if (sharpness > 0) {
    const sharpWeight = (sharpness / 100) * 0.8;
    const copy = new Float32Array(grayBuffer);

    for (let y = 1; y < photoH - 1; y++) {
      for (let x = 1; x < photoW - 1; x++) {
        const center = copy[y * photoW + x];
        const blur = (
          copy[(y - 1) * photoW + x] +
          copy[(y + 1) * photoW + x] +
          copy[y * photoW + (x - 1)] +
          copy[y * photoW + (x + 1)]
        ) * 0.25;

        const sharp = center + (center - blur) * sharpWeight;
        grayBuffer[y * photoW + x] = Math.max(0, Math.min(255, sharp));
      }
    }
  }

  // 4. Halftone Screening Engine (AM Line, AM Dot, Crosshatch, Floyd-Steinberg, Bayer, etc.)
  // Cell size in pixels calibrated to Printer DPI and Screen Frequency LPI:
  // cellSize = DPI / LPI
  const effectiveLpi = Math.max(10, Math.min(200, lpi));
  const cellSize = Math.max(2, dpi / effectiveLpi);
  const angleRad = (screenAngle * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  if (toneMode === 'am-line') {
    // Amplitude Modulated Line Halftone (Diagonal Lines / Banknote Engraving)
    // Continuous shades of gray converted into diagonal line patterns where line thickness varies
    for (let y = 0; y < photoH; y++) {
      for (let x = 0; x < photoW; x++) {
        const idx = y * photoW + x;
        const lum = grayBuffer[idx];
        const inkFraction = 1.0 - lum / 255.0; // 0 = white paper, 1 = solid black ink

        // Rotate coordinates by screenAngle (default 45 degrees)
        const rotX = x * cosA - y * sinA;
        const cellU = ((rotX % cellSize) + cellSize) % cellSize;
        const distFromCenter = Math.abs(cellU - cellSize / 2);
        const halfLineWidth = (cellSize / 2) * inkFraction;

        grayBuffer[idx] = distFromCenter <= halfLineWidth ? 0 : 255;
      }
    }
  } else if (toneMode === 'am-dot' || toneMode === 'halftone-screen') {
    // Amplitude Modulated Clustered Dot Halftone (45° Rotated Newspaper / Rotogravure Dots)
    for (let y = 0; y < photoH; y++) {
      for (let x = 0; x < photoW; x++) {
        const idx = y * photoW + x;
        const lum = grayBuffer[idx];
        const inkFraction = 1.0 - lum / 255.0;

        const rotX = x * cosA - y * sinA;
        const rotY = x * sinA + y * cosA;

        const cellU = ((rotX % cellSize) + cellSize) % cellSize - cellSize / 2;
        const cellV = ((rotY % cellSize) + cellSize) % cellSize - cellSize / 2;
        const dist = Math.sqrt(cellU * cellU + cellV * cellV);
        const dotRadius = Math.sqrt(inkFraction) * (cellSize / 2) * 1.15;

        grayBuffer[idx] = dist <= dotRadius ? 0 : 255;
      }
    }
  } else if (toneMode === 'am-crosshatch') {
    // AM Intersecting Crosshatch Lines (+45° and -45°)
    const cosCross = Math.cos(-angleRad);
    const sinCross = Math.sin(-angleRad);

    for (let y = 0; y < photoH; y++) {
      for (let x = 0; x < photoW; x++) {
        const idx = y * photoW + x;
        const lum = grayBuffer[idx];
        const inkFraction = 1.0 - lum / 255.0;

        const rot1 = x * cosA - y * sinA;
        const u1 = Math.abs(((rot1 % cellSize) + cellSize) % cellSize - cellSize / 2);

        const rot2 = x * cosCross - y * sinCross;
        const u2 = Math.abs(((rot2 % cellSize) + cellSize) % cellSize - cellSize / 2);

        const halfWidth = (cellSize / 2) * (inkFraction * 0.7);
        const isInk = u1 <= halfWidth || (inkFraction > 0.4 && u2 <= halfWidth);
        grayBuffer[idx] = isInk ? 0 : 255;
      }
    }
  } else if (toneMode === 'am-diamond') {
    // AM Diamond / Elliptical Dots
    for (let y = 0; y < photoH; y++) {
      for (let x = 0; x < photoW; x++) {
        const idx = y * photoW + x;
        const lum = grayBuffer[idx];
        const inkFraction = 1.0 - lum / 255.0;

        const rotX = x * cosA - y * sinA;
        const rotY = x * sinA + y * cosA;

        const cellU = Math.abs(((rotX % cellSize) + cellSize) % cellSize - cellSize / 2);
        const cellV = Math.abs(((rotY % cellSize) + cellSize) % cellSize - cellSize / 2);
        const manhattan = cellU + cellV;
        const maxManhattan = cellSize * 0.75 * Math.sqrt(inkFraction);

        grayBuffer[idx] = manhattan <= maxManhattan ? 0 : 255;
      }
    }
  } else if (toneMode === 'floyd-steinberg') {
    // 1-Bit Error Diffusion Dithering
    for (let y = 0; y < photoH; y++) {
      for (let x = 0; x < photoW; x++) {
        const idx = y * photoW + x;
        const oldVal = grayBuffer[idx];
        const newVal = oldVal < threshold ? 0 : 255;
        grayBuffer[idx] = newVal;
        const err = oldVal - newVal;

        if (x + 1 < photoW) grayBuffer[idx + 1] += (err * 7) / 16;
        if (x - 1 >= 0 && y + 1 < photoH) grayBuffer[(y + 1) * photoW + (x - 1)] += (err * 3) / 16;
        if (y + 1 < photoH) grayBuffer[(y + 1) * photoW + x] += (err * 5) / 16;
        if (x + 1 < photoW && y + 1 < photoH) grayBuffer[(y + 1) * photoW + (x + 1)] += (err * 1) / 16;
      }
    }
  } else if (toneMode === 'bayer-ordered') {
    // 8x8 Bayer Ordered Dither Matrix
    for (let y = 0; y < photoH; y++) {
      for (let x = 0; x < photoW; x++) {
        const idx = y * photoW + x;
        const lum = grayBuffer[idx];
        const bayerVal = BAYER_8X8[y % 8][x % 8];
        grayBuffer[idx] = lum < bayerVal ? 0 : 255;
      }
    }
  } else if (toneMode === 'hard-threshold') {
    // Binary High-Contrast Silhouette
    for (let i = 0; i < grayBuffer.length; i++) {
      grayBuffer[i] = grayBuffer[i] < threshold ? 0 : 255;
    }
  } else if (toneMode === 'silver-gelatin') {
    // S-curve Darkroom Film Response
    for (let i = 0; i < grayBuffer.length; i++) {
      const v = grayBuffer[i] / 255;
      const s = v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2;
      grayBuffer[i] = Math.round(s * 255);
    }
  }

  // Write processed pixels back to offscreen canvas
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.round(grayBuffer[i / 4]);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  offCtx.putImageData(imgData, 0, 0);

  // 5. Render to main canvas with chosen frame system
  ctx.save();

  // Clear main canvas background
  const bgPalette = getPaletteColors(frameColorPalette);
  ctx.fillStyle = bgPalette.background;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Draw the processed photo inside the photo rect
  ctx.drawImage(offscreen, photoX, photoY, photoW, photoH);

  // 6. Draw Canvas Frame overlays (Heritage, Vintage, Polaroid, Industrial, etc.)
  if (frameStyle === 'heritage') {
    drawHeritageFrame(ctx, widthPx, heightPx, photoX, photoY, photoW, photoH, bgPalette, frameCaption, options);
  } else if (frameStyle === 'vintage') {
    drawVintageFrame(ctx, widthPx, heightPx, photoX, photoY, photoW, photoH, bgPalette, frameCaption, options);
  } else if (frameStyle === 'polaroid') {
    drawPolaroidFrame(ctx, widthPx, heightPx, photoX, photoY, photoW, photoH, bgPalette, frameCaption, options);
  } else if (frameStyle === 'industrial') {
    drawIndustrialFrame(ctx, widthPx, heightPx, photoX, photoY, photoW, photoH, bgPalette, frameCaption, options);
  } else if (frameStyle === 'passepartout') {
    drawPassepartoutFrame(ctx, widthPx, heightPx, photoX, photoY, photoW, photoH, bgPalette, frameCaption);
  } else if (frameStyle === 'cyber-hud') {
    drawCyberHudFrame(ctx, widthPx, heightPx, photoX, photoY, photoW, photoH, bgPalette, frameCaption, options);
  } else if (frameStyle === 'none') {
    // Simple 1px crisp registration border around image
    ctx.strokeStyle = bgPalette.accent;
    ctx.lineWidth = Math.max(1, Math.round(dpi / 300));
    ctx.strokeRect(0, 0, widthPx, heightPx);
  }

  ctx.restore();
  return { widthPx, heightPx };
}

interface PaletteColors {
  background: string;
  primary: string;
  accent: string;
  accentLight: string;
  pinstripe: string;
}

function getPaletteColors(palette: FrameColorPalette): PaletteColors {
  switch (palette) {
    case 'heritage-gold':
      return {
        background: '#fcf8ee',
        primary: '#2b2118',
        accent: '#9a7b38',
        accentLight: '#d4af37',
        pinstripe: '#785b24',
      };
    case 'darkroom-red':
      return {
        background: '#1a0507',
        primary: '#ffe4e6',
        accent: '#e11d48',
        accentLight: '#fb7185',
        pinstripe: '#9f1239',
      };
    case 'cyber-lime':
      return {
        background: '#09090b',
        primary: '#ffffff',
        accent: '#ccff00',
        accentLight: '#38bdf8',
        pinstripe: '#ccff00',
      };
    case 'blueprint':
      return {
        background: '#0a2540',
        primary: '#ffffff',
        accent: '#38bdf8',
        accentLight: '#7dd3fc',
        pinstripe: '#0284c7',
      };
    case 'monochrome':
    default:
      return {
        background: '#f8f8f6',
        primary: '#09090b',
        accent: '#000000',
        accentLight: '#52525b',
        pinstripe: '#27272a',
      };
  }
}

/**
 * Draws Ornate Heritage Frame with baroque corner filigree, museum pinstriping, and plaque
 */
function drawHeritageFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  colors: PaletteColors,
  caption: string,
  options: PhotoDPIOptions
) {
  const scale = w / 1500;
  const line1 = Math.max(2, Math.round(scale * 3));
  const line2 = Math.max(1, Math.round(scale * 1.5));
  const inset = Math.max(6, Math.round(scale * 14));

  // Outer solid border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = line1;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

  // Inner secondary gold pinstripe
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = line2;
  const pInset = inset + Math.max(4, Math.round(scale * 6));
  ctx.strokeRect(pInset, pInset, w - pInset * 2, h - pInset * 2);

  // Photo border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, Math.round(scale * 2));
  ctx.strokeRect(px, py, pw, ph);

  // Ornate Baroque Corner Filigree
  const drawCornerFlourish = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = colors.accent;
    ctx.fillStyle = colors.accent;
    ctx.lineWidth = Math.max(1.5, scale * 2);

    // Acanthus scroll 1
    ctx.beginPath();
    ctx.moveTo(8 * scale, 8 * scale);
    ctx.bezierCurveTo(24 * scale, 10 * scale, 40 * scale, 18 * scale, 48 * scale, 8 * scale);
    ctx.bezierCurveTo(42 * scale, 28 * scale, 28 * scale, 42 * scale, 8 * scale, 48 * scale);
    ctx.bezierCurveTo(18 * scale, 40 * scale, 10 * scale, 24 * scale, 8 * scale, 8 * scale);
    ctx.stroke();

    // Corner rosette dot
    ctx.beginPath();
    ctx.arc(14 * scale, 14 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Delicate feather line
    ctx.beginPath();
    ctx.moveTo(14 * scale, 14 * scale);
    ctx.lineTo(38 * scale, 38 * scale);
    ctx.stroke();

    ctx.restore();
  };

  drawCornerFlourish(pInset, pInset, 1, 1);
  drawCornerFlourish(w - pInset, pInset, -1, 1);
  drawCornerFlourish(pInset, h - pInset, 1, -1);
  drawCornerFlourish(w - pInset, h - pInset, -1, -1);

  // Bottom Museum Plaque
  const plaqueW = Math.min(w * 0.75, Math.max(260, scale * 340));
  const plaqueH = Math.max(30, scale * 46);
  const plaqueX = (w - plaqueW) / 2;
  const plaqueY = h - inset - plaqueH - Math.max(4, scale * 8);

  ctx.fillStyle = colors.background;
  ctx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = line2;
  ctx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(plaqueX + 3, plaqueY + 3, plaqueW - 6, plaqueH - 6);

  // Plaque Typography
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(Math.max(10, scale * 13))}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const labelText = caption.toUpperCase() || 'ARCHIVAL HERITAGE SPECIMEN';
  ctx.fillText(labelText, w / 2, plaqueY + plaqueH * 0.4);

  // Small subtitle
  ctx.fillStyle = colors.accent;
  ctx.font = `italic ${Math.round(Math.max(8, scale * 9))}px Georgia, serif`;
  ctx.fillText(`ETCHED AT ${options.dpi} DPI · ${options.lpi} LPI · ANGLE ${options.screenAngle}°`, w / 2, plaqueY + plaqueH * 0.75);
}

/**
 * Draws Authentic Vintage Frame with postage stamp perforations and cancellation seal
 */
function drawVintageFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  colors: PaletteColors,
  caption: string,
  options: PhotoDPIOptions
) {
  const scale = w / 1500;

  // Postage Stamp Scalloped Edge Cutouts
  const perfRadius = Math.max(4, Math.round(scale * 7));
  const perfSpacing = perfRadius * 3;

  ctx.fillStyle = '#ffffff';
  // Top & bottom perforations
  for (let x = perfSpacing; x < w - perfRadius; x += perfSpacing) {
    ctx.beginPath();
    ctx.arc(x, 0, perfRadius, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, h, perfRadius, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  // Left & right perforations
  for (let y = perfSpacing; y < h - perfRadius; y += perfSpacing) {
    ctx.beginPath();
    ctx.arc(0, y, perfRadius, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w, y, perfRadius, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.fill();
  }

  // Double antique inner frame
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1.5, scale * 2);
  ctx.strokeRect(px - 6, py - 6, pw + 12, ph + 12);
  ctx.strokeRect(px, py, pw, ph);

  // Circular Postal Cancellation Rubber Stamp (Angled in top right corner)
  ctx.save();
  const stampX = px + pw - Math.max(60, scale * 90);
  const stampY = py + Math.max(60, scale * 90);
  ctx.translate(stampX, stampY);
  ctx.rotate((-22 * Math.PI) / 180);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, scale * 2);

  // Concentric stamp rings
  const stampR = Math.max(40, scale * 55);
  ctx.beginPath();
  ctx.arc(0, 0, stampR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, stampR * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Stamp text
  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${Math.round(Math.max(7, scale * 9))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POSTE AÉRIENNE', 0, -stampR * 0.45);
  ctx.fillText(`PARIS 1926`, 0, 0);
  ctx.fillText(`VERIFIED ${options.lpi} LPI`, 0, stampR * 0.45);

  // Wavy postal cancellation lines
  ctx.lineWidth = Math.max(1, scale * 1.2);
  for (let wave = -2; wave <= 2; wave++) {
    const wy = wave * 8 * scale;
    ctx.beginPath();
    ctx.moveTo(stampR + 5, wy);
    ctx.bezierCurveTo(
      stampR + 25 * scale,
      wy - 6 * scale,
      stampR + 50 * scale,
      wy + 6 * scale,
      stampR + 80 * scale,
      wy
    );
    ctx.stroke();
  }
  ctx.restore();

  // Bottom letterpress caption
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(Math.max(9, scale * 12))}px Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`★ ${caption.toUpperCase()} ★`, w / 2, h - Math.max(14, scale * 20));
}

/**
 * Draws Classic Polaroid / Instant Film Card with bottom-heavy signature margin
 */
function drawPolaroidFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  colors: PaletteColors,
  caption: string,
  options: PhotoDPIOptions
) {
  const scale = w / 1500;

  // Solid Polaroid White Card Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Film Emulsion Border & Shadow
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(px - 1, py - 1, pw + 2, ph + 2);

  // Inner beveled dark line
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = Math.max(1.5, scale * 2);
  ctx.strokeRect(px, py, pw, ph);

  // Handwritten / Typewriter style caption in bottom margin
  const bottomY = py + ph + (h - (py + ph)) / 2;
  ctx.fillStyle = '#09090b';
  ctx.font = `bold ${Math.round(Math.max(12, scale * 18))}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(caption || 'Instant Specimen // 1976', w / 2, bottomY - Math.max(6, scale * 8));

  // Small date / DPI stamp
  ctx.fillStyle = '#71717a';
  ctx.font = `${Math.round(Math.max(8, scale * 11))}px "Courier New", monospace`;
  ctx.fillText(`${options.dpi} DPI · ${options.lpi} LPI · AM HALFTONE`, w / 2, bottomY + Math.max(12, scale * 14));
}

/**
 * Draws Industrial / Darkroom Proof Frame with millimeter precision rulers, registration targets, and crop marks
 */
function drawIndustrialFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  colors: PaletteColors,
  caption: string,
  options: PhotoDPIOptions
) {
  const scale = w / 1500;
  const tickStep = Math.max(12, Math.round(scale * 20));

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, scale * 1.5);

  // Millimeter Calibration Rulers on Top and Bottom
  ctx.fillStyle = colors.primary;
  ctx.font = `${Math.round(Math.max(7, scale * 8))}px monospace`;
  ctx.textAlign = 'center';

  let tickCount = 0;
  for (let x = px; x <= px + pw; x += tickStep) {
    const isMajor = tickCount % 5 === 0;
    const len = isMajor ? Math.max(8, scale * 12) : Math.max(4, scale * 6);

    // Top ticks
    ctx.beginPath();
    ctx.moveTo(x, py - len);
    ctx.lineTo(x, py);
    ctx.stroke();

    // Bottom ticks
    ctx.beginPath();
    ctx.moveTo(x, py + ph);
    ctx.lineTo(x, py + ph + len);
    ctx.stroke();

    if (isMajor && x + 20 < px + pw) {
      ctx.fillText(`${tickCount * 5}`, x, py - len - 4);
    }
    tickCount++;
  }

  // Left & Right ticks
  let yTick = 0;
  for (let y = py; y <= py + ph; y += tickStep) {
    const isMajor = yTick % 5 === 0;
    const len = isMajor ? Math.max(8, scale * 12) : Math.max(4, scale * 6);

    ctx.beginPath();
    ctx.moveTo(px - len, y);
    ctx.lineTo(px, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px + pw, y);
    ctx.lineTo(px + pw + len, y);
    ctx.stroke();
    yTick++;
  }

  // 4 Corner Precision L-Shaped Crop Marks
  const markLen = Math.max(14, scale * 24);
  const markOffset = Math.max(6, scale * 10);

  const drawCropMark = (cx: number, cy: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * markOffset, cy);
    ctx.lineTo(cx + dx * (markOffset + markLen), cy);
    ctx.moveTo(cx, cy + dy * markOffset);
    ctx.lineTo(cx, cy + dy * (markOffset + markLen));
    ctx.stroke();
  };

  drawCropMark(px, py, -1, -1);
  drawCropMark(px + pw, py, 1, -1);
  drawCropMark(px, py + ph, -1, 1);
  drawCropMark(px + pw, py + ph, 1, 1);

  // Midpoint Registration Calibration Targets (Crosshairs with Circle)
  const drawRegistrationTarget = (cx: number, cy: number) => {
    const r = Math.max(6, scale * 10);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.moveTo(cx - r * 1.5, cy);
    ctx.lineTo(cx + r * 1.5, cy);
    ctx.moveTo(cx, cy - r * 1.5);
    ctx.lineTo(cx, cy + r * 1.5);
    ctx.stroke();
  };

  drawRegistrationTarget(px + pw / 2, py - Math.max(14, scale * 20));
  drawRegistrationTarget(px + pw / 2, py + ph + Math.max(14, scale * 20));
  drawRegistrationTarget(px - Math.max(14, scale * 20), py + ph / 2);
  drawRegistrationTarget(px + pw + Math.max(14, scale * 20), py + ph / 2);

  // Technical Metadata Barcode & Stencil at Bottom
  const bottomY = h - Math.max(10, scale * 14);
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(Math.max(8, scale * 10))}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(`SPECIMEN: ${caption.toUpperCase()} // AM-SCREEN`, px, bottomY);

  ctx.textAlign = 'right';
  ctx.fillText(`DPI: ${options.dpi} · LPI: ${options.lpi} · ANGLE: ${options.screenAngle}° · 100% INK`, px + pw, bottomY);
}

/**
 * Draws Modern Passe-Partout Museum Gallery Mat with beveled shadow
 */
function drawPassepartoutFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  colors: PaletteColors,
  caption: string
) {
  const scale = w / 1500;

  // Outer fine gallery border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, scale * 1.5);
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Bevel cut 45° shadow around inner photo edge
  const bevel = Math.max(2, Math.round(scale * 4));
  ctx.fillStyle = '#d4d4d8';
  // Top bevel
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + pw, py);
  ctx.lineTo(px + pw - bevel, py + bevel);
  ctx.lineTo(px + bevel, py + bevel);
  ctx.fill();

  // Left bevel
  ctx.fillStyle = '#a1a1aa';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + ph);
  ctx.lineTo(px + bevel, py + ph - bevel);
  ctx.lineTo(px + bevel, py + bevel);
  ctx.fill();

  // Fine floating hairline offset by 8px
  const fOffset = Math.max(6, Math.round(scale * 8));
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(px - fOffset, py - fOffset, pw + fOffset * 2, ph + fOffset * 2);

  // Subtle gallery embossing at bottom center
  ctx.fillStyle = colors.accentLight;
  ctx.font = `italic ${Math.round(Math.max(9, scale * 11))}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`— ${caption} —`, w / 2, h - Math.max(14, scale * 22));
}

/**
 * Draws Cyber-HUD Tactical Frame with corner brackets, hex reticles, and coordinates
 */
function drawCyberHudFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  colors: PaletteColors,
  caption: string,
  options: PhotoDPIOptions
) {
  const scale = w / 1500;
  const bracketLen = Math.max(20, Math.round(scale * 40));
  const bWidth = Math.max(2, Math.round(scale * 3));

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = bWidth;

  // 4 Tactical Corner Brackets with 45° chamfer
  const drawHudCorner = (cx: number, cy: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * bracketLen, cy);
    ctx.lineTo(cx + dx * 10, cy);
    ctx.lineTo(cx, cy + dy * 10);
    ctx.lineTo(cx, cy + dy * bracketLen);
    ctx.stroke();
  };

  drawHudCorner(px - 10, py - 10, 1, 1);
  drawHudCorner(px + pw + 10, py - 10, -1, 1);
  drawHudCorner(px - 10, py + ph + 10, 1, -1);
  drawHudCorner(px + pw + 10, py + ph + 10, -1, -1);

  // Center Target Reticle Crosshairs
  const reticleX = px + pw / 2;
  const reticleY = py + ph / 2;
  const rSize = Math.max(14, scale * 24);

  ctx.strokeStyle = colors.accentLight;
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(reticleX - rSize, reticleY - rSize, rSize * 2, rSize * 2);
  ctx.beginPath();
  ctx.moveTo(reticleX - rSize * 1.5, reticleY);
  ctx.lineTo(reticleX + rSize * 1.5, reticleY);
  ctx.moveTo(reticleX, reticleY - rSize * 1.5);
  ctx.lineTo(reticleX, reticleY + rSize * 1.5);
  ctx.stroke();

  // Top Data Readout
  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${Math.round(Math.max(8, scale * 10))}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(`SYS.OPTIC // SCAN_${options.dpi}DPI // ${options.lpi}LPI`, px, py - 16);

  ctx.textAlign = 'right';
  ctx.fillText(`HUD.LOCK [${caption.toUpperCase()}]`, px + pw, py - 16);
}

/**
 * Generates 300 / 600 / 1200 DPI PNG file with physical pHYs metadata chunk
 */
export async function exportPhotoDPI_PNG(
  canvas: HTMLCanvasElement,
  options: PhotoDPIOptions,
  filenamePrefix: string = 'Photo-DPI'
): Promise<PhotoDPIExportResult> {
  const dpi = options.dpi || 600;
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      try {
        const dpiBlob = await insertDpiIntoPngBlob(blob, dpi);
        const dataUrl = URL.createObjectURL(dpiBlob);
        const filename = `${filenamePrefix}-${dpi}DPI-${options.toneMode}-${Date.now()}.png`;

        resolve({
          blob: dpiBlob,
          dataUrl,
          filename,
          format: 'PNG',
          widthPx: canvas.width,
          heightPx: canvas.height,
          dpi,
          physicalWidthInches: options.targetWidthInches,
          physicalHeightInches: options.targetHeightInches,
        });
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}

/**
 * Generates an ISO Print Card PDF with trim crop marks, grayscale density strip, and technical metadata
 */
export async function exportPhotoDPI_PDF(
  canvas: HTMLCanvasElement,
  options: PhotoDPIOptions,
  filenamePrefix: string = 'Photo-Specimen'
): Promise<PhotoDPIExportResult> {
  const dpi = options.dpi || 600;
  const imgData = canvas.toDataURL('image/png');

  // Convert target dimensions in inches to mm
  const wMm = options.targetWidthInches * 25.4;
  const hMm = options.targetHeightInches * 25.4;

  // Margin for crop marks & technical card: 15mm each side
  const pageWMm = wMm + 30;
  const pageHMm = hMm + 40;

  const doc = new jsPDF({
    orientation: wMm > hMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageWMm, pageHMm],
  });

  // Background
  doc.setFillColor(245, 245, 240);
  doc.rect(0, 0, pageWMm, pageHMm, 'F');

  // Outer boundary
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWMm - 10, pageHMm - 10, 'S');

  // Header Banner
  doc.setFillColor(204, 255, 0); // #ccff00 electric lime
  doc.rect(5, 5, pageWMm - 10, 10, 'F');
  doc.rect(5, 5, pageWMm - 10, 10, 'S');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(`PHOTO DPI MAKER // ${dpi} DPI AM-HALFTONE SPECIMEN`, 9, 11.5);
  doc.text(`${options.targetWidthInches}" × ${options.targetHeightInches}" (${canvas.width}×${canvas.height}px)`, pageWMm - 65, 11.5);

  // Position Image on Card
  const imgX = 15;
  const imgY = 20;

  // Solid border around image
  doc.setFillColor(255, 255, 255);
  doc.rect(imgX - 0.5, imgY - 0.5, wMm + 1, hMm + 1, 'F');
  doc.rect(imgX - 0.5, imgY - 0.5, wMm + 1, hMm + 1, 'S');

  // Draw image
  doc.addImage(imgData, 'PNG', imgX, imgY, wMm, hMm, undefined, 'FAST');

  // Corner Crop Marks
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  // Top-left
  doc.line(imgX - 8, imgY, imgX - 2, imgY);
  doc.line(imgX, imgY - 8, imgX, imgY - 2);
  // Top-right
  doc.line(imgX + wMm + 2, imgY, imgX + wMm + 8, imgY);
  doc.line(imgX + wMm, imgY - 8, imgX + wMm, imgY - 2);
  // Bottom-left
  doc.line(imgX - 8, imgY + hMm, imgX - 2, imgY + hMm);
  doc.line(imgX, imgY + hMm + 2, imgX, imgY + hMm + 8);
  // Bottom-right
  doc.line(imgX + wMm + 2, imgY + hMm, imgX + wMm + 8, imgY + hMm);
  doc.line(imgX + wMm, imgY + hMm + 2, imgX + wMm, imgY + hMm + 8);

  // Calibration Tone Strip at Bottom
  const stripY = imgY + hMm + 8;
  const swatchWidth = (wMm) / 10;
  for (let i = 0; i < 10; i++) {
    const val = Math.round(255 * (i / 9));
    doc.setFillColor(val, val, val);
    doc.rect(imgX + i * swatchWidth, stripY, swatchWidth, 4, 'F');
    doc.rect(imgX + i * swatchWidth, stripY, swatchWidth, 4, 'S');
  }

  // Footer Metadata
  doc.setFontSize(6.5);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `CALIBRATION: 10-STEP DENSITY SCALE · DPI: ${dpi} · LPI: ${options.lpi} · ANGLE: ${options.screenAngle}° · TONE: ${options.toneMode.toUpperCase()} · CONTRAST: ${options.contrast}x`,
    imgX,
    stripY + 8
  );

  const pdfBlob = doc.output('blob');
  const filename = `${filenamePrefix}-${dpi}DPI-PrintCard.pdf`;
  const dataUrl = URL.createObjectURL(pdfBlob);

  return {
    blob: pdfBlob,
    dataUrl,
    filename,
    format: 'PDF',
    widthPx: canvas.width,
    heightPx: canvas.height,
    dpi,
    physicalWidthInches: options.targetWidthInches,
    physicalHeightInches: options.targetHeightInches,
  };
}

/**
 * Triggers file download in browser
 */
export function triggerFileDownload(result: PhotoDPIExportResult) {
  const a = document.createElement('a');
  a.href = result.dataUrl;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
