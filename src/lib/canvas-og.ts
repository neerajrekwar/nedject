import { createCanvas, type SKRSContext2D as CanvasRenderingContext2D } from '@napi-rs/canvas';

export type PageCardType =
  | 'home'
  | 'mochup'
  | 'mockup'
  | 'barcode-pick'
  | 'normal-dpi-photo'
  | 'nomral-dpi-photo'
  | 'fitness-glass'
  | 'winter-arc-2026'
  | 'qr-crush'
  | 'payment'
  | 'blog'
  | 'dashboard'
  | 'default';

export interface CardRenderOptions {
  page?: string;
  title?: string;
  description?: string;
  badge?: string;
  url?: string;
}

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Normalizes input string to supported PageCardType
 */
export function normalizePageType(pageStr?: string): PageCardType {
  if (!pageStr) return 'home';
  const clean = pageStr.toLowerCase().trim().replace(/^\//, '').replace(/\/$/, '');
  if (!clean || clean === 'home') return 'home';
  if (clean === 'mochup' || clean === 'mockup') return 'mochup';
  if (clean === 'barcode-pick' || clean === 'barcode') return 'barcode-pick';
  if (clean.includes('normal-dpi') || clean.includes('nomral-dpi')) return 'normal-dpi-photo';
  if (clean.includes('winter-arc')) return 'winter-arc-2026';
  if (clean.includes('fitness')) return 'fitness-glass';
  if (clean.includes('qr-crush') || clean.includes('crush')) return 'qr-crush';
  if (clean.includes('payment') || clean.includes('pricing') || clean.includes('plans')) return 'payment';
  if (clean.includes('blog')) return 'blog';
  if (clean.includes('dashboard')) return 'dashboard';
  return 'default';
}

/**
 * Helper: draw grid dots or lines on canvas
 */
function drawBackgroundGrid(
  ctx: CanvasRenderingContext2D,
  color = 'rgba(255, 255, 255, 0.05)',
  gap = 32
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Helper: draw neo-brutalist badge
 */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  bgColor = '#ccff00',
  textColor = '#000000',
  borderColor = '#000000',
  fontSize = 14
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px monospace`;
  const textWidth = ctx.measureText(text).width;
  const paddingX = 14;
  const height = fontSize + 16;
  const width = textWidth + paddingX * 2;

  // Shadow
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 3, y + 3, width, height);

  // Box
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Text
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + paddingX, y + height / 2 + 1);

  ctx.restore();
  return { width, height };
}

/**
 * Helper: draw word-wrapped text
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        ctx.fillText(words.slice(n).join(' ').slice(0, 50) + '...', x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Common Top Brand Bar across all cards
 */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  pageTag: string,
  sysCode = 'BUILD 2026.4 // ONLINE',
  accentColor = '#ccff00'
) {
  ctx.save();

  // Top Neon Accent Border Line
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, WIDTH, 8);

  // Header Bar Container
  ctx.fillStyle = '#111111';
  ctx.fillRect(40, 36, WIDTH - 80, 56);
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 36, WIDTH - 80, 56);

  // Brand Name Pill
  ctx.fillStyle = accentColor;
  ctx.fillRect(40, 36, 210, 56);
  ctx.fillStyle = '#000000';
  ctx.font = '900 18px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText('NEDJECT // STUDIO', 56, 65);

  // Page Specific Module Pill
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`[ ${pageTag.toUpperCase()} ]`, 270, 65);

  // Status Indicator Dot on Right
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(WIDTH - 240, 64, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(sysCode, WIDTH - 225, 65);

  ctx.restore();
}

/**
 * Common Footer across all cards with author attribution
 */
function drawFooter(
  ctx: CanvasRenderingContext2D,
  metaTags: string[] = ['ISO/IEC 18004 300 DPI', 'CLIENT-SIDE RASTER', 'ZERO TRACKERS'],
  accentColor = '#ccff00'
) {
  ctx.save();
  const y = HEIGHT - 64;

  // Bottom Border Bar
  ctx.fillStyle = '#111111';
  ctx.fillRect(40, y, WIDTH - 80, 42);
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, y, WIDTH - 80, 42);

  // Meta Tags
  let tagX = 56;
  ctx.font = 'bold 11px monospace';
  for (const tag of metaTags) {
    ctx.fillStyle = accentColor;
    ctx.fillText('✔', tagX, y + 22);
    ctx.fillStyle = '#d4d4d8';
    ctx.fillText(tag, tagX + 16, y + 22);
    tagX += ctx.measureText(tag).width + 36;
  }

  // Author stamp
  ctx.fillStyle = '#71717a';
  ctx.font = '11px monospace';
  const authorText = 'DEVELOPED BY NEERAJREKWAR';
  ctx.fillText(authorText, WIDTH - 40 - ctx.measureText(authorText).width - 16, y + 22);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 1. HOME CARD (300 DPI PHOTO QR STUDIO)
// ---------------------------------------------------------------------------
function renderHomeCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#090a0c';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(204, 255, 0, 0.04)', 32);

  drawHeader(ctx, '300 DPI PHOTO QR // ISO 18004', '300 DPI OPTICAL CALIBRATION', '#ccff00');

  drawBadge(ctx, 'INDUSTRIAL PHOTO QR MATRIX', 50, 120, '#ccff00', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('Industrial 300 DPI', 50, 205);
  ctx.fillText('Photo QR Code Studio', 50, 260);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Floyd-Steinberg error diffusion & optical halftone matrices calibrated for 300 DPI commercial press prints with 100% verified camera scan rates.',
    50,
    305,
    580,
    26
  );

  // Spec Chips
  const chips = ['pHYs CHUNK (11,811 PPM)', '21:1 B/W CONTRAST', '4K ULTRA EXPORT', 'REED-SOLOMON ECC'];
  let chipX = 50;
  const chipY = 415;
  chips.forEach((c) => {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(chipX, chipY, ctx.measureText(c).width + 24, 28);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(chipX, chipY, ctx.measureText(c).width + 24, 28);
    ctx.fillStyle = '#ccff00';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(c, chipX + 12, chipY + 18);
    chipX += ctx.measureText(c).width + 36;
  });

  // Right Column: Procedural 300 DPI QR Visual
  const qrX = 720;
  const qrY = 130;
  const qrSize = 420;

  ctx.fillStyle = '#000000';
  ctx.fillRect(qrX + 10, qrY + 10, qrSize, qrSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);

  const drawFinder = (fx: number, fy: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(fx, fy, 84, 84);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 12, fy + 12, 60, 60);
    ctx.fillStyle = '#000000';
    ctx.fillRect(fx + 24, fy + 24, 36, 36);
    ctx.fillStyle = '#ccff00';
    ctx.fillRect(fx + 33, fy + 33, 18, 18);
  };

  drawFinder(qrX + 24, qrY + 24);
  drawFinder(qrX + qrSize - 108, qrY + 24);
  drawFinder(qrX + 24, qrY + qrSize - 108);

  ctx.fillStyle = '#000000';
  const dotStep = 14;
  for (let r = 0; r < 24; r++) {
    for (let c = 0; c < 24; c++) {
      const px = qrX + 42 + c * dotStep;
      const py = qrY + 42 + r * dotStep;
      const inTopLeft = c < 7 && r < 7;
      const inTopRight = c > 16 && r < 7;
      const inBottomLeft = c < 7 && r > 16;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      const rand = seed - Math.floor(seed);
      if (rand > 0.45) {
        const radius = rand > 0.8 ? 5 : rand > 0.65 ? 4 : 2.5;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(qrX + qrSize / 2 - 80, qrY + qrSize / 2 - 20, 160, 40);
  ctx.strokeStyle = '#ccff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX + qrSize / 2 - 80, qrY + qrSize / 2 - 20, 160, 40);
  ctx.fillStyle = '#ccff00';
  ctx.font = '900 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('300 DPI // 1:1 RASTER', qrX + qrSize / 2, qrY + qrSize / 2 + 5);
  ctx.textAlign = 'left';

  drawFooter(ctx, ['300 DPI PRINT CALIBRATION', '100% SCAN RATE GUARANTEE', 'pHYs CHUNK INJECTION']);
}

// ---------------------------------------------------------------------------
// 2. MOCKUP STUDIO CARD (/mochup)
// ---------------------------------------------------------------------------
function renderMockupCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(56, 189, 248, 0.05)', 36);

  drawHeader(ctx, 'MOCKUP STUDIO // HARDWARE FRAMES', 'APPLE TRIO · 9:16 MOBILE · IFRAME', '#38bdf8');

  drawBadge(ctx, 'MULTI-DEVICE RESPONSIVE LAB', 50, 120, '#38bdf8', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('Interactive Mockup Studio', 50, 205);
  ctx.fillText('& Viewport Templates', 50, 260);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Pixel-accurate iPhone 16 Pro 9:16, MacBook Pro 16:10, and iPad frames with live URL iframe sandboxing, 4K snapshot exports, and device composition.',
    50,
    305,
    580,
    26
  );

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(50, 400, 560, 70);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 400, 560, 70);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('DEVICE MATRIX RESOLUTIONS:', 68, 425);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px monospace';
  ctx.fillText('📱 iPhone 16 Pro: 1179 × 2556 (9:16)  |  💻 MacBook Pro 16": 3024 × 1964', 68, 452);

  const stageX = 690;
  const stageY = 125;

  // MacBook Pro
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(stageX + 60, stageY + 20, 360, 230);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(stageX + 60, stageY + 20, 360, 230);

  ctx.fillStyle = '#020617';
  ctx.fillRect(stageX + 75, stageY + 35, 330, 200);
  ctx.fillStyle = '#000000';
  ctx.fillRect(stageX + 225, stageY + 35, 30, 8);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(stageX + 90, stageY + 60, 120, 10);
  ctx.fillStyle = '#334155';
  ctx.fillRect(stageX + 90, stageY + 80, 280, 60);

  ctx.fillStyle = '#475569';
  ctx.fillRect(stageX + 30, stageY + 250, 420, 14);

  // iPhone 16 Pro
  const phoneX = stageX + 15;
  const phoneY = stageY + 90;
  ctx.fillStyle = '#020617';
  ctx.fillRect(phoneX, phoneY, 130, 240);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(phoneX, phoneY, 130, 240);

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(phoneX + 45, phoneY + 8, 40, 10, [5]);
  } else {
    ctx.fillRect(phoneX + 45, phoneY + 8, 40, 10);
  }
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(phoneX + 8, phoneY + 24, 114, 200);
  ctx.fillStyle = '#ccff00';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('9:16 MOBILE', phoneX + 22, phoneY + 60);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(phoneX + 20, phoneY + 75, 75, 45);

  // Tablet iPad
  const tabletX = stageX + 330;
  const tabletY = stageY + 110;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tabletX, tabletY, 150, 210);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.strokeRect(tabletX, tabletY, 150, 210);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(tabletX + 8, tabletY + 8, 134, 194);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('TABLET 4:3', tabletX + 35, tabletY + 40);

  drawFooter(ctx, ['9:16 MOBILE NATIVE', 'SANDBOXED IFRAMES', '4K RETINA EXPORT'], '#38bdf8');
}

// ---------------------------------------------------------------------------
// 3. BARCODE PICK CARD (/barcode-pick)
// ---------------------------------------------------------------------------
function renderBarcodeCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(234, 179, 8, 0.05)', 32);

  drawHeader(ctx, 'LOGISTICS // 1D/2D SYMBOLOGY', 'UPC · EAN-13 · CODE-128 · FNSKU', '#eab308');

  drawBadge(ctx, 'WAREHOUSE & SUPPLY CHAIN BARCODES', 50, 120, '#eab308', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('Industrial Barcode Generator', 50, 205);
  ctx.fillText('& Vector Studio', 50, 260);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Generate GS1-compliant Code-128, EAN-13, UPC-A, ITF-14, and Amazon FNSKU barcode matrices with auto-checksum verification and lossless vector SVG/PDF.',
    50,
    305,
    580,
    26
  );

  const tags = ['AMAZON FNSKU', 'GS1 UPC-A', 'EAN-13 GLOBAL', 'CODE-128C', 'ITF-14 CARTON'];
  let tagX = 50;
  tags.forEach((t) => {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(tagX, 420, ctx.measureText(t).width + 20, 28);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(tagX, 420, ctx.measureText(t).width + 20, 28);
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(t, tagX + 10, 438);
    tagX += ctx.measureText(t).width + 30;
  });

  const bcX = 710;
  const bcY = 130;
  const bcWidth = 440;
  const bcHeight = 310;

  ctx.fillStyle = '#000000';
  ctx.fillRect(bcX + 8, bcY + 8, bcWidth, bcHeight);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bcX, bcY, bcWidth, bcHeight);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(bcX, bcY, bcWidth, bcHeight);

  ctx.fillStyle = '#000000';
  ctx.font = '900 13px monospace';
  ctx.fillText('FNSKU: X0034B76QR // NEDJECT LOGISTICS', bcX + 24, bcY + 36);

  const barTop = bcY + 55;
  const barHeight = 175;
  const barPattern = [
    3, 1, 1, 4, 2, 1, 3, 2, 1, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 2, 1,
    3, 2, 1, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 1,
  ];

  let currentX = bcX + 24;
  let isBar = true;
  for (let i = 0; i < barPattern.length; i++) {
    const w = barPattern[i] * 3.5;
    if (isBar) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(currentX, barTop, w, barHeight);
    }
    currentX += w;
    isBar = !isBar;
  }

  ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bcX + 15, barTop + barHeight / 2);
  ctx.lineTo(bcX + bcWidth - 15, barTop + barHeight / 2);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('(01) 0 12345 67890 5 (10) B49', bcX + bcWidth / 2, bcY + 275);
  ctx.textAlign = 'left';

  drawFooter(ctx, ['VECTOR SVG + PDF PRINT EXPORT', 'GS1-COMPLIANT CHECKSUM', 'AUTO-CALCULATED MOD-10'], '#eab308');
}

// ---------------------------------------------------------------------------
// 4. NORMAL DPI PHOTO CARD (/normal-dpi-photo)
// ---------------------------------------------------------------------------
function renderNormalDpiCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(255, 255, 255, 0.04)', 30);

  drawHeader(ctx, 'PRINT CALIBRATION // 300 DPI PREP', '72 DPI SCREEN VS 300 DPI PRESS', '#a1a1aa');

  drawBadge(ctx, 'PRESS-READY PHOTO PREPARATION', 50, 120, '#ffffff', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('300 DPI Photo Prep', 50, 205);
  ctx.fillText('& Print Calibration', 50, 260);

  ctx.fillStyle = '#d4d4d8';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Commercial photo prep engine with silver gelatin tone curve optimization, B/W print calibration, and vector-aligned PDF & PNG exports for offset presses.',
    50,
    305,
    580,
    26
  );

  ctx.fillStyle = '#18181b';
  ctx.fillRect(50, 410, 560, 48);
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 410, 560, 48);

  const steps = 10;
  const stepW = 540 / steps;
  for (let s = 0; s < steps; s++) {
    const grayVal = Math.round((s / (steps - 1)) * 255);
    ctx.fillStyle = `rgb(${grayVal},${grayVal},${grayVal})`;
    ctx.fillRect(60 + s * stepW, 418, stepW - 4, 32);
  }

  const swX = 720;
  const swY = 130;
  const swW = 420;
  const swH = 320;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(swX + 8, swY + 8, swW, swH);
  ctx.fillStyle = '#000000';
  ctx.fillRect(swX, swY, swW, swH);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(swX, swY, swW, swH);

  ctx.fillStyle = '#27272a';
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 6; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(swX + 15 + x * 28, swY + 45 + y * 24, 24, 20);
      }
    }
  }

  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 24; x++) {
      const px = swX + 225 + x * 7.5;
      const py = swY + 45 + y * 8.5;
      const d = Math.sin(x * 0.4) * Math.cos(y * 0.4);
      if (d > 0.1) {
        ctx.fillRect(px, py, 4, 4);
      }
    }
  }

  ctx.strokeStyle = '#ccff00';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(swX + swW / 2, swY + 20);
  ctx.lineTo(swX + swW / 2, swY + swH - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('72 DPI SCREEN (COARSE)', swX + 25, swY + 30);
  ctx.fillStyle = '#ccff00';
  ctx.fillText('300 DPI PRESS (VECTOR)', swX + 230, swY + 30);

  drawFooter(ctx, ['SILVER GELATIN B/W CURVE', 'DENSITY WEDGE VERIFIED', 'ZERO PIXELATION PRESS READY'], '#ffffff');
}

// ---------------------------------------------------------------------------
// 5. FITNESS GLASS CARD (/fitness-glass)
// ---------------------------------------------------------------------------
function renderFitnessCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#030806';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(16, 185, 129, 0.05)', 32);

  drawHeader(ctx, 'TELEMETRY HUD // FITNESS GLASS', 'GOOGLE FIT CLOUD TELEMETRY · PROTOCOL', '#10b981');

  drawBadge(ctx, 'SMART GLASS HEADS-UP CADENCE', 50, 120, '#10b981', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('Fitness Smart Glass', 50, 205);
  ctx.fillText('Timetable & Cadence HUD', 50, 260);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'HUD timetable matrix and weekly training cadence planner engineered for smart glass displays, Google Fit API cloud telemetry, and wearable sports optics.',
    50,
    305,
    580,
    26
  );

  const stats = [
    { label: 'HEART RATE', val: '148 BPM' },
    { label: 'CADENCE', val: '182 SPM' },
    { label: 'POWER', val: '310 W' },
    { label: 'HRV', val: '74 MS' },
  ];

  let stX = 50;
  stats.forEach((s) => {
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(stX, 410, 130, 52);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(stX, 410, 130, 52);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(s.label, stX + 12, 428);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px monospace';
    ctx.fillText(s.val, stX + 12, 450);

    stX += 145;
  });

  const hudX = 720;
  const hudY = 130;
  const hudW = 420;
  const hudH = 320;

  ctx.fillStyle = '#022c22';
  ctx.fillRect(hudX, hudY, hudW, hudH);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.strokeRect(hudX, hudY, hudW, hudH);

  const cx = hudX + hudW / 2;
  const cy = hudY + hudH / 2;
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 130, cy);
  ctx.lineTo(cx + 130, cy);
  ctx.moveTo(cx, cy - 130);
  ctx.lineTo(cx, cy + 130);
  ctx.stroke();

  ctx.strokeStyle = '#ccff00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hudX + 20, cy);
  ctx.lineTo(cx - 70, cy);
  ctx.lineTo(cx - 50, cy - 15);
  ctx.lineTo(cx - 30, cy + 20);
  ctx.lineTo(cx - 10, cy - 80);
  ctx.lineTo(cx + 10, cy + 50);
  ctx.lineTo(cx + 25, cy - 25);
  ctx.lineTo(cx + 45, cy);
  ctx.lineTo(hudX + hudW - 20, cy);
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('HUD_CAM_OPTIC // 100% LOCK', hudX + 15, hudY + 25);
  ctx.fillText('CADENCE PROTOCOL ACTIVE', hudX + 15, hudY + hudH - 15);

  drawFooter(ctx, ['WEARABLE HUD INTERFACE', 'GOOGLE FIT CLOUD TELEMETRY', 'WINTER ARC 2026 PROTOCOL'], '#10b981');
}

// ---------------------------------------------------------------------------
// 6. QR CRUSH CARD (/qr-crush)
// ---------------------------------------------------------------------------
function renderQrCrushCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0a0608';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(239, 68, 68, 0.05)', 32);

  drawHeader(ctx, 'FORENSIC AUDITOR // QR CRUSH', 'AES-256 PBKDF2 · SHANNON ENTROPY', '#ef4444');

  drawBadge(ctx, 'OPTICAL FORENSICS & CIPHER LAB', 50, 120, '#ef4444', '#ffffff', '#ef4444');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('QR Crush Forensic Lab', 50, 205);
  ctx.fillText('& Crypto Auditor', 50, 260);

  ctx.fillStyle = '#fca5a5';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Deep forensic payload analysis, Shannon entropy scoring, Reed-Solomon ECC parity block diagnostics, and AES-256-GCM encrypted QR payload generation.',
    50,
    305,
    580,
    26
  );

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(50, 410, 560, 48);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 410, 560, 48);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('SHANNON ENTROPY METER:', 65, 432);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('7.989 BITS / BYTE  [ HIGH CRYPTOGRAPHIC ENTROPY ]', 240, 432);

  const decX = 720;
  const decY = 130;
  const decW = 420;
  const decH = 320;

  ctx.fillStyle = '#180a0e';
  ctx.fillRect(decX, decY, decW, decH);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.strokeRect(decX, decY, decW, decH);

  ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.font = '10px monospace';
  const hexLines = [
    '0x00 4E 45 44 4A 45 43 54 20 43 49 50 48 45 52',
    '0x10 A9 88 F1 02 C4 B8 99 E1 2A 4B CC FF 00 12',
    '0x20 52 45 45 44 2D 53 4F 4C 4F 4D 4F 4E 20 48',
    '0x30 01 00 11 01 10 10 01 11 10 00 10 11 01 00',
    '0x40 73 68 61 6E 6E 6F 6E 5F 65 6E 74 72 6F 70',
    '0x50 33 30 30 5F 64 70 69 5F 70 68 6F 74 6F 73',
  ];
  hexLines.forEach((h, i) => {
    ctx.fillText(h, decX + 20, decY + 45 + i * 20);
  });

  ctx.fillStyle = '#000000';
  ctx.fillRect(decX + 80, decY + 180, 260, 90);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(decX + 80, decY + 180, 260, 90);

  ctx.fillStyle = '#ef4444';
  ctx.font = '900 15px monospace';
  ctx.fillText('🔒 AES-256-GCM VAULT', decX + 115, decY + 215);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ZERO-KNOWLEDGE PBKDF2', decX + 120, decY + 245);

  drawFooter(ctx, ['FOUR-PASS FORENSIC SCAN', 'AES-256-GCM CIPHER VAULT', 'ANTI-QUISHING DETECTION'], '#ef4444');
}

// ---------------------------------------------------------------------------
// 7. PAYMENT & PRO PLANS CARD (/payment)
// ---------------------------------------------------------------------------
function renderPaymentCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#090805';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(251, 191, 36, 0.05)', 32);

  drawHeader(ctx, 'LICENSING // PRO PASS MATRIX', 'COMMERCIAL LICENSES · UNLIMITED ACCESS', '#fbbf24');

  drawBadge(ctx, 'COMMERCIAL ENTERPRISE TIERS', 50, 120, '#fbbf24', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('Pro Quota & Commercial', 50, 205);
  ctx.fillText('Licensing Plans', 50, 260);

  ctx.fillStyle = '#fde68a';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Unlock unlimited 300 DPI high-resolution exports, batch matrix generators, vector barcode downloads, and raw API telemetry with priority SLA.',
    50,
    305,
    580,
    26
  );

  const passX = 720;
  const passY = 130;
  const passW = 420;
  const passH = 320;

  ctx.fillStyle = '#000000';
  ctx.fillRect(passX + 10, passY + 10, passW, passH);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(passX, passY, passW, passH);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(passX, passY, passW, passH);

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(passX, passY, passW, 50);
  ctx.fillStyle = '#000000';
  ctx.font = '900 16px monospace';
  ctx.fillText('NEDJECT // ALL-ACCESS PRO PASS', passX + 24, passY + 32);

  const perks = [
    '✔ Unlimited 300 DPI Photo QR Exports',
    '✔ Vector Barcode Studio (SVG + PDF)',
    '✔ Bulk CSV Batch Matrix Engine',
    '✔ Full Commercial Print Rights',
    '✔ Zero-Log Sandboxed Infrastructure',
  ];

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  perks.forEach((p, idx) => {
    ctx.fillText(p, passX + 24, passY + 95 + idx * 30);
  });

  ctx.fillStyle = '#000000';
  ctx.fillRect(passX + 24, passY + 250, 372, 45);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(passX + 24, passY + 250, 372, 45);

  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 16px monospace';
  ctx.fillText('FROM $9 / MONTH · INSTANT CLOUD UNLOCK', passX + 42, passY + 278);

  drawFooter(ctx, ['COMMERCIAL PRINT RIGHTS', 'UNLIMITED 300 DPI EXPORTS', 'INSTANT KEY ACTIVATION'], '#fbbf24');
}

// ---------------------------------------------------------------------------
// 8. BLOG CARD (/blog)
// ---------------------------------------------------------------------------
function renderBlogCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0d0d11';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(255, 255, 255, 0.04)', 32);

  drawHeader(ctx, 'ENGINEERING MONOGRAPHS // BLOG', 'TECHNICAL RESEARCH & SPECIFICATIONS', '#a78bfa');

  drawBadge(ctx, 'TECHNICAL ENGINEERING BLOG', 50, 120, '#a78bfa', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px sans-serif';
  ctx.fillText('Engineering Specifications', 50, 205);
  ctx.fillText('& Print Calibration Log', 50, 260);

  ctx.fillStyle = '#c4b5fd';
  ctx.font = '17px monospace';
  drawWrappedText(
    ctx,
    'Technical deep-dives on 300 DPI halftone rendering, Floyd-Steinberg diffusion kernels, GS1 barcode symbology checksums, and optical security architecture.',
    50,
    305,
    580,
    26
  );

  const artX = 720;
  const artY = 130;
  const artW = 420;
  const artH = 320;

  ctx.fillStyle = '#1e1b2e';
  ctx.fillRect(artX, artY, artW, artH);
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 2;
  ctx.strokeRect(artX, artY, artW, artH);

  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(artX, artY, artW, 40);
  ctx.fillStyle = '#000000';
  ctx.font = '900 13px monospace';
  ctx.fillText('INDEX OF TECHNICAL MONOGRAPHS', artX + 20, artY + 25);

  const articles = [
    { num: 'RFC-01', title: '300 DPI Halftone Matrix Engineering' },
    { num: 'RFC-02', title: 'GS1 Barcode Modulo-10 Checksum' },
    { num: 'RFC-03', title: 'Optical Forensics & Quishing Audit' },
    { num: 'RFC-04', title: 'Dynamic Island 9:16 Viewport Geometry' },
  ];

  articles.forEach((a, idx) => {
    const ay = artY + 68 + idx * 56;
    ctx.fillStyle = '#2e284a';
    ctx.fillRect(artX + 16, ay, artW - 32, 44);
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(a.num, artX + 28, ay + 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(a.title, artX + 90, ay + 26);
  });

  drawFooter(ctx, ['PEER-REVIEWED SPECIFICATIONS', 'PRINT LAB RESEARCH', 'OPEN ARCHITECTURE'], '#a78bfa');
}

// ---------------------------------------------------------------------------
// 9. GENERIC / CUSTOM TITLE CARD
// ---------------------------------------------------------------------------
function renderCustomCard(ctx: CanvasRenderingContext2D, title: string, description: string, badge?: string) {
  ctx.fillStyle = '#090a0c';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackgroundGrid(ctx, 'rgba(204, 255, 0, 0.05)', 32);

  drawHeader(ctx, badge || 'NEDJECT // INDUSTRIAL SUITE', 'HIGH-PRECISION DIGITAL TOOLS', '#ccff00');

  drawBadge(ctx, badge || 'COMMERCIAL SPECIFICATION', 50, 130, '#ccff00', '#000000');

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif';
  drawWrappedText(ctx, title, 50, 220, 1050, 56, 2);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '19px monospace';
  drawWrappedText(ctx, description, 50, 360, 1050, 30, 3);

  drawFooter(ctx, ['HIGH PRECISION SUITE', 'ZERO CLIENT-SIDE TRACKERS', 'ISO/IEC STANDARDS CERTIFIED'], '#ccff00');
}

/**
 * Main export: generates a 1200x630 Buffer PNG using Canvas
 */
export async function generateOgCardBuffer(options: CardRenderOptions = {}): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const pageType = normalizePageType(options.page);

  if (options.title && options.page === 'custom') {
    renderCustomCard(ctx, options.title, options.description || '', options.badge);
    return canvas.toBuffer('image/png');
  }

  switch (pageType) {
    case 'home':
      renderHomeCard(ctx);
      break;
    case 'mochup':
    case 'mockup':
      renderMockupCard(ctx);
      break;
    case 'barcode-pick':
      renderBarcodeCard(ctx);
      break;
    case 'normal-dpi-photo':
    case 'nomral-dpi-photo':
      renderNormalDpiCard(ctx);
      break;
    case 'fitness-glass':
    case 'winter-arc-2026':
      renderFitnessCard(ctx);
      break;
    case 'qr-crush':
      renderQrCrushCard(ctx);
      break;
    case 'payment':
      renderPaymentCard(ctx);
      break;
    case 'blog':
      renderBlogCard(ctx);
      break;
    default:
      if (options.title) {
        renderCustomCard(ctx, options.title, options.description || '', options.badge);
      } else {
        renderHomeCard(ctx);
      }
      break;
  }

  return canvas.toBuffer('image/png');
}
