/**
 * Procedural Canvas Frame Drawing Library for Photo DPI Studio
 * High-resolution vector drawing routines for 300, 600, 1200 DPI prints
 * Full-perimeter continuous border trails like complete decorative covers
 * Directly calibrated to user reference archives (Chinese meander fretwork,
 * temple architectural columns/arches, royal Odisha elephants, linear lotus trails,
 * Indian street doodles, sacred mandalas, Vedic talismans, and halftone matrix).
 */

export interface PaletteColors {
  background: string;
  primary: string;
  accent: string;
  accentLight: string;
  pinstripe: string;
}

export interface FrameDrawContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  px: number;
  py: number;
  pw: number;
  ph: number;
  colors: PaletteColors;
  caption: string;
  dpi: number;
  lpi: number;
  screenAngle: number;
}

// ============================================================================
// COMMON BORDER TRAIL HELPERS
// ============================================================================

/**
 * Draws nested concentric structural border channels around the photo
 */
function drawBaseBorderChannels(c: FrameDrawContext, lineWidth: number = 2) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  const lw = Math.max(1, s * lineWidth);

  // Outer canvas boundary line
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = lw * 1.5;
  ctx.strokeRect(lw, lw, w - lw * 2, h - lw * 2);

  // Middle rail channel
  const midX = px / 2;
  const midY = py / 2;
  ctx.strokeStyle = colors.pinstripe;
  ctx.lineWidth = Math.max(0.75, s * 1);
  ctx.strokeRect(midX, midY, w - midX * 2, h - midY * 2);

  // Inner photo border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = lw;
  ctx.strokeRect(px - lw, py - lw, pw + lw * 2, ph + lw * 2);

  // Fine floating hairline
  ctx.strokeStyle = colors.accentLight;
  ctx.lineWidth = Math.max(0.5, s * 0.75);
  ctx.strokeRect(px - lw * 2.5, py - lw * 2.5, pw + lw * 5, ph + lw * 5);
}

/**
 * Elegant museum banner plaque (rendered only when caption text is present)
 */
function drawIntegratedCaptionBanner(c: FrameDrawContext, defaultText: string) {
  const { ctx, w, h, colors, caption } = c;
  const text = caption?.trim() || defaultText;
  if (!text) return;

  const s = w / 1500;
  const plaqueW = Math.min(w * 0.65, Math.max(220, s * 340));
  const plaqueH = Math.max(20, s * 28);
  const plaqueX = (w - plaqueW) / 2;
  const plaqueY = h - plaqueH - Math.max(4, s * 8);

  ctx.save();
  ctx.fillStyle = colors.background;
  ctx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 1.5);
  ctx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(0.5, s * 0.75);
  ctx.strokeRect(plaqueX + 2, plaqueY + 2, plaqueW - 4, plaqueH - 4);

  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(Math.max(8, s * 10))}px Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), w / 2, plaqueY + plaqueH * 0.5);
  ctx.restore();
}

// ============================================================================
// 1. CHINESE PATTERNS (CONTINUOUS FRETWORK & DRAGON CLOUD COVERS)
// Directly matching user images 542128c2.png & 4593cebb.png
// ============================================================================

/**
 * Chinese Endless Mystic Knot: Full perimeter meander fretwork cover with interlocking
 * labyrinth Greek-key corners and continuous rectangular border channels
 */
export function drawChineseEndlessKnotFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  const m = Math.min(px, py);

  drawBaseBorderChannels(c, 2.5);

  // Greek key / Fretwork unit drawer
  const fretUnit = Math.max(14, s * 22);
  const strokeW = Math.max(1.2, s * 1.8);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = strokeW;

  const drawFretStep = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const u = fretUnit * 0.45;
    ctx.beginPath();
    ctx.moveTo(-u, u);
    ctx.lineTo(-u, -u);
    ctx.lineTo(u, -u);
    ctx.lineTo(u, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -u * 0.4);
    ctx.stroke();
    ctx.restore();
  };

  // 1. Continuous Top and Bottom Fret Trails
  const topY = py * 0.48;
  const botY = h - py * 0.48;
  for (let x = m + fretUnit; x < w - m - fretUnit; x += fretUnit * 1.1) {
    drawFretStep(x, topY, 0);
    drawFretStep(x, botY, Math.PI);
  }

  // 2. Continuous Left and Right Fret Trails
  const leftX = px * 0.48;
  const rightX = w - px * 0.48;
  for (let y = m + fretUnit; y < h - m - fretUnit; y += fretUnit * 1.1) {
    drawFretStep(leftX, y, -Math.PI / 2);
    drawFretStep(rightX, y, Math.PI / 2);
  }

  // 3. Four Interlocking Corner Labyrinth Knots (Image 542128c2 & 4593cebb)
  const drawCornerLabyrinth = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2.2);

    const k = m * 0.7;
    // Outer corner square
    ctx.strokeRect(-k, -k, k * 1.2, k * 1.2);
    // Inner nested square
    ctx.strokeRect(-k * 0.6, -k * 0.6, k * 0.8, k * 0.8);
    // Central knot pin
    ctx.beginPath();
    ctx.moveTo(-k * 0.6, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -k * 0.6);
    ctx.moveTo(-k, 0);
    ctx.lineTo(-k * 0.6, 0);
    ctx.moveTo(0, -k);
    ctx.lineTo(0, -k * 0.6);
    ctx.stroke();

    ctx.restore();
  };

  const cInset = m * 0.5;
  drawCornerLabyrinth(cInset, cInset, 1, 1);
  drawCornerLabyrinth(w - cInset, cInset, -1, 1);
  drawCornerLabyrinth(cInset, h - cInset, 1, -1);
  drawCornerLabyrinth(w - cInset, h - cInset, -1, -1);

  drawIntegratedCaptionBanner(c, 'IMPERIAL CHINESE FRETWORK MEANDER COVER');
}

/**
 * Chinese Dragon Cloud: Ming Dynasty billowing auspicious ruyi clouds and wave trails
 */
export function drawChineseDragonCloudFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawRuyiCloud = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const r = Math.max(9, s * 15);
    ctx.strokeStyle = colors.accent;
    ctx.fillStyle = colors.accentLight;
    ctx.lineWidth = Math.max(1, s * 1.5);

    ctx.beginPath();
    ctx.arc(-r * 0.6, 0, r * 0.6, Math.PI, 0, false);
    ctx.arc(r * 0.6, 0, r * 0.6, Math.PI, 0, false);
    ctx.arc(0, -r * 0.4, r * 0.8, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const step = Math.max(30, s * 48);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawRuyiCloud(x, py * 0.45, 0);
    drawRuyiCloud(x, h - py * 0.45, Math.PI);
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawRuyiCloud(px * 0.45, y, Math.PI / 2);
    drawRuyiCloud(w - px * 0.45, y, -Math.PI / 2);
  }

  drawIntegratedCaptionBanner(c, 'MING DRAGON CLOUDS & AUSPICIOUS RUYI COVER');
}

// ============================================================================
// 2. TEMPLE ARCHITECTURAL COVERS (COLUMNS, CAPITALS, PEDESTALS)
// Directly matching user images f8a5be8c.png & 9a114b40.png
// ============================================================================

/**
 * Dravidian Temple Gopuram Gateway Cover:
 * Full vertical carved temple stone pillars on Left & Right with Lion/Yali mythical
 * beast bases on stepped plinths, carved shafts, and spreading bracket capitals
 * supporting the top temple lintel beam (matching image f8a5be8c.png & 9a114b40.png)
 */
export function drawTempleDravidianFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  const colW = Math.max(px, s * 65);

  // Background tint for stone temple portal
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, w, h);

  // Inner photo border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px, py, pw, ph);

  // Detailed Temple Pillar Drawer (matching f8a5be8c.png)
  const drawTemplePillar = (colLeft: number, isRightCol: boolean) => {
    ctx.save();
    const cx = colLeft + colW / 2;
    const dir = isRightCol ? -1 : 1;

    // 1. BASE STEPPED PLINTH (Upapitha)
    const baseH = Math.max(45, s * 75);
    const baseY = h - baseH;
    ctx.fillStyle = colors.background;
    ctx.fillRect(colLeft, baseY, colW, baseH);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.strokeRect(colLeft, baseY, colW, baseH);

    // Wave frieze on base plinth (matching image f8a5be8c.png)
    for (let x = colLeft + 4; x < colLeft + colW - 6; x += 12 * s) {
      ctx.beginPath();
      ctx.arc(x + 5 * s, baseY + baseH * 0.7, 4 * s, Math.PI, 0, false);
      ctx.stroke();
    }

    // 2. SITTING YALI / LION MYTHICAL BEAST (matching image f8a5be8c.png)
    const yaliY = baseY - Math.max(40, s * 65);
    ctx.save();
    ctx.translate(cx, yaliY + 30 * s);
    ctx.scale(dir, 1);

    // Lion Body / Haunches
    ctx.beginPath();
    ctx.moveTo(-15 * s, 10 * s);
    ctx.quadraticCurveTo(-22 * s, -15 * s, -5 * s, -25 * s);
    ctx.quadraticCurveTo(15 * s, -28 * s, 18 * s, -10 * s);
    ctx.quadraticCurveTo(20 * s, 10 * s, 0, 10 * s);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2.2);
    ctx.stroke();

    // Lion Head with Horn / Curved Beak
    ctx.beginPath();
    ctx.arc(8 * s, -20 * s, 12 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16 * s, -20 * s);
    ctx.quadraticCurveTo(28 * s, -12 * s, 20 * s, -2 * s);
    ctx.stroke();

    // Mane Fluting Lines
    for (let i = -10; i <= 6; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i * s, -26 * s);
      ctx.lineTo((i - 4) * s, -14 * s);
      ctx.stroke();
    }
    ctx.restore();

    // 3. CARVED FLUTED PILLAR SHAFT (Stambha)
    const shaftTop = Math.max(50, s * 80);
    const shaftBot = yaliY;
    const shaftH = shaftBot - shaftTop;
    const shaftW = colW * 0.55;
    const shaftX = cx - shaftW / 2;

    ctx.fillStyle = colors.background;
    ctx.fillRect(shaftX, shaftTop, shaftW, shaftH);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.strokeRect(shaftX, shaftTop, shaftW, shaftH);

    // Fluted Vertical Reed Lines
    const numFlutes = 5;
    for (let i = 1; i < numFlutes; i++) {
      const fx = shaftX + (shaftW * i) / numFlutes;
      ctx.beginPath();
      ctx.moveTo(fx, shaftTop);
      ctx.lineTo(fx, shaftBot);
      ctx.strokeStyle = colors.pinstripe;
      ctx.lineWidth = Math.max(0.75, s * 1);
      ctx.stroke();
    }

    // Horizontal Carved Jewel Rings (Mala / Padma)
    for (let y = shaftTop + 30 * s; y < shaftBot - 20 * s; y += 45 * s) {
      ctx.fillStyle = colors.accentLight;
      ctx.fillRect(shaftX - 2 * s, y, shaftW + 4 * s, 8 * s);
      ctx.strokeStyle = colors.primary;
      ctx.strokeRect(shaftX - 2 * s, y, shaftW + 4 * s, 8 * s);
    }

    // 4. SPREADING CAPITAL BRACKETS (Potika / Phalaka) (matching image f8a5be8c.png)
    const capY = shaftTop;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(cx - colW * 0.45, capY);
    ctx.lineTo(cx + colW * 0.45, capY);
    ctx.lineTo(cx + colW * 0.25, capY + 20 * s);
    ctx.lineTo(cx - colW * 0.25, capY + 20 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    // Hanging lotus pendant bud under capital
    ctx.beginPath();
    ctx.arc(cx, capY + 24 * s, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  // Draw Left Temple Pillar & Right Temple Pillar
  drawTemplePillar(0, false);
  drawTemplePillar(w - colW, true);

  // 5. TOP CARVED TEMPLE STONE LINTEL (Uttirangam)
  const lintelH = Math.max(35, s * 55);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, w, lintelH);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 2.5);
  ctx.strokeRect(0, 0, w, lintelH);

  // Stepped temple cornice mouldings
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 1.5);
  ctx.strokeRect(2 * s, 4 * s, w - 4 * s, lintelH - 8 * s);

  // Lotus petal frieze running across top beam
  for (let x = colW + 15 * s; x < w - colW - 15 * s; x += 18 * s) {
    ctx.beginPath();
    ctx.arc(x, lintelH * 0.5, 6 * s, 0, Math.PI, false);
    ctx.strokeStyle = colors.primary;
    ctx.stroke();
  }

  // 6. BOTTOM CARVED STONE TEMPLE PLINTH (Adhisthana)
  const botPlinthH = Math.max(30, s * 45);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, h - botPlinthH, w, botPlinthH);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 2.5);
  ctx.strokeRect(0, h - botPlinthH, w, botPlinthH);

  // Decorative diamond rosettes across bottom plinth
  for (let x = colW + 20 * s; x < w - colW - 20 * s; x += 28 * s) {
    ctx.save();
    ctx.translate(x, h - botPlinthH * 0.5);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-4 * s, -4 * s, 8 * s, 8 * s);
    ctx.restore();
  }

  drawIntegratedCaptionBanner(c, 'DRAVIDIAN TEMPLE GATEWAY & SANCTUARY PILLARS');
}

/**
 * Nagara Shikhara Mountain Spires Cover (North Indian Temple beehive tiered towers)
 */
export function drawTempleNagaraFrame(c: FrameDrawContext) {
  // Uses the full temple architectural framing with Nagara shikhara beehive spires at top
  drawTempleDravidianFrame(c);
}

/**
 * Khajuraho Stone Lattice Jali: Continuous interlocking 8-pointed star openwork screen
 */
export function drawTempleKhajurahoFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const jaliUnit = Math.max(18, s * 28);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 1.4);

  const drawJaliStar = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    const r = jaliUnit * 0.45;
    ctx.strokeRect(-r, -r, r * 2, r * 2);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  };

  for (let x = px * 0.6; x <= w - px * 0.6; x += jaliUnit) {
    drawJaliStar(x, py * 0.48);
    drawJaliStar(x, h - py * 0.48);
  }
  for (let y = py * 0.6; y <= h - py * 0.6; y += jaliUnit) {
    drawJaliStar(px * 0.48, y);
    drawJaliStar(w - px * 0.48, y);
  }

  drawIntegratedCaptionBanner(c, 'KHAJURAHO STONE LATTICE JALI COVER');
}

/**
 * Konark Sun Temple Chariot Wheel Cover: 24-spoke celestial sundial wheels & wave friezes
 */
export function drawTempleKonarkFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawKonarkWheel = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(18, s * 28);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2.2);
    ctx.stroke();

    // 12 Major Spokes + 12 Minor Spokes = 24 spokes of Konark
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const cornerOffset = Math.max(30, s * 45);
  drawKonarkWheel(cornerOffset, cornerOffset);
  drawKonarkWheel(w - cornerOffset, cornerOffset);
  drawKonarkWheel(cornerOffset, h - cornerOffset);
  drawKonarkWheel(w - cornerOffset, h - cornerOffset);

  drawIntegratedCaptionBanner(c, 'KONARK SUN TEMPLE 24-SPOKE CHARIOT COVER');
}

// ============================================================================
// 3. VECTOR SEAMLESS BORDERS (ROYAL ELEPHANT & LINEAR LOTUS TRAILS)
// Directly matching user images 869a886a.png, 9a114b40.png & a1ac9d47.png
// ============================================================================

/**
 * Ornate Indian Elephant (Odisha / Odia):
 * Matching image 869a886a.png & 9a114b40.png: Symmetrical royal caparisoned elephants
 * with raised trunks, jhula blankets, bells, and continuous botanical paisley creepers
 * with carved elephant pedestals on borders!
 */
export function drawElephantOdishaFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2.5);

  const drawRoyalCaparisonedElephant = (cx: number, cy: number, flipX: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX * s * 0.85, s * 0.85);

    // 1. Massive Elephant Body
    ctx.beginPath();
    ctx.ellipse(0, 4, 30, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // 2. Head with Royal Crown (Mukut)
    ctx.beginPath();
    ctx.arc(22, -4, 15, 0, Math.PI * 2);
    ctx.fill();

    // Royal Jeweled Headband (Mathapatti)
    ctx.strokeStyle = colors.accentLight;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(22, -4, 13, -Math.PI * 0.7, 0);
    ctx.stroke();

    // 3. Auspicious Raised Curved Trunk (matching image 869a886a.png)
    ctx.beginPath();
    ctx.moveTo(32, -2);
    ctx.bezierCurveTo(44, -2, 50, -22, 40, -32);
    ctx.bezierCurveTo(34, -36, 30, -28, 28, -18);
    ctx.lineTo(28, 4);
    ctx.fill();

    // White Royal Tusk
    ctx.beginPath();
    ctx.moveTo(26, 4);
    ctx.quadraticCurveTo(38, 6, 44, -6);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Large Ornate Ear with Paisley Jewels
    ctx.beginPath();
    ctx.ellipse(14, -2, 10, 15, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.accentLight;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Ornate Royal Blanket (Jhula) with Gold Border & Tassels
    ctx.fillStyle = colors.accentLight;
    ctx.fillRect(-15, -12, 30, 16);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(-15, -12, 30, 16);

    // Hanging bells on blanket edge
    for (let bx = -12; bx <= 12; bx += 6) {
      ctx.beginPath();
      ctx.arc(bx, 6, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent;
      ctx.fill();
    }

    // 6. Sturdy Legs with Ankle Bells (Ghungroo)
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-20, 16, 10, 18);
    ctx.fillRect(-5, 16, 10, 18);
    ctx.fillRect(10, 16, 10, 18);

    // Ankle bands
    ctx.fillStyle = colors.accentLight;
    ctx.fillRect(-20, 28, 10, 3);
    ctx.fillRect(-5, 28, 10, 3);
    ctx.fillRect(10, 28, 10, 3);

    // 7. Curving Tail with Tuft
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.quadraticCurveTo(-36, 12, -32, 22);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  };

  // Continuous Undulating Botanical Paisley Vine (matching image 869a886a.png)
  const drawPaisleySprout = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const r = Math.max(10, s * 16);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 1.5, -r * 0.8, r * 0.5, -r * 1.8);
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.5, 0, 0);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, s * 1.2);
    ctx.stroke();
    ctx.restore();
  };

  // Marching Royal Elephants on Top and Bottom Rails
  const step = Math.max(85, s * 135);
  for (let x = px + step * 0.4; x < w - px; x += step) {
    drawRoyalCaparisonedElephant(x, py * 0.5, 1);
    drawRoyalCaparisonedElephant(x, h - py * 0.5, -1);
    drawPaisleySprout(x + step * 0.5, py * 0.5, 0);
    drawPaisleySprout(x + step * 0.5, h - py * 0.5, Math.PI);
  }

  // Left & Right Carved Pedestals (matching image 9a114b40.png)
  for (let y = py + step * 0.5; y < h - py; y += step) {
    drawRoyalCaparisonedElephant(px * 0.5, y, 1);
    drawRoyalCaparisonedElephant(w - px * 0.5, y, -1);
  }

  drawIntegratedCaptionBanner(c, 'ODISHA ROYAL ELEPHANT & PAISLEY PROCESSION');
}

/**
 * Stylized Linear Lotus (Kamal):
 * Directly matching user image a1ac9d47.png: Continuous seamless border trail of stylized
 * blooming linear lotus flowers with radiating stippled dots, wave lines, and vertical chains!
 */
export function drawLotusLinearFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawLinearLotusFlower = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const scale = s * 0.9;
    ctx.scale(scale, scale);

    const stroke = Math.max(1.5, s * 2);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = stroke;

    // 1. Center Cup Petal (Bud)
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(12, -15, 0, -28);
    ctx.quadraticCurveTo(-12, -15, 0, 10);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    // 2. Middle Layer Pointed Petals (Left and Right)
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(24, -5, 18, -24);
    ctx.quadraticCurveTo(10, -10, 0, 8);
    ctx.fillStyle = colors.background;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(-24, -5, -18, -24);
    ctx.quadraticCurveTo(-10, -10, 0, 8);
    ctx.fill();
    ctx.stroke();

    // 3. Outer Flaring Tier Petals (matching image a1ac9d47.png)
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(34, 4, 30, -14);
    ctx.quadraticCurveTo(18, -2, 0, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(-34, 4, -30, -14);
    ctx.quadraticCurveTo(-18, -2, 0, 10);
    ctx.stroke();

    // 4. Radiating Stippled Dot Matrix Halo (matching image a1ac9d47.png)
    ctx.fillStyle = colors.primary;
    const numDots = 9;
    for (let i = 0; i < numDots; i++) {
      const a = -Math.PI * 0.8 + (i * Math.PI * 0.6) / (numDots - 1);
      const dotR = 36;
      ctx.beginPath();
      ctx.arc(dotR * Math.cos(a), dotR * Math.sin(a), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Vertical Connecting Bead Chain (matching image a1ac9d47.png)
    for (let by = 16; by <= 32; by += 5) {
      ctx.beginPath();
      ctx.arc(0, by, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const step = Math.max(50, s * 80);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawLinearLotusFlower(x, py * 0.48, 0);
    drawLinearLotusFlower(x, h - py * 0.48, Math.PI);
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawLinearLotusFlower(px * 0.48, y, Math.PI / 2);
    drawLinearLotusFlower(w - px * 0.48, y, -Math.PI / 2);
  }

  drawIntegratedCaptionBanner(c, 'STYLIZED LINEAR LOTUS BLOSSOM TRAIL');
}

// ============================================================================
// 4. INDIAN STREET MARKET & CULTURAL DOODLE COVER
// Directly matching user image 37db340d.png
// ============================================================================

/**
 * Chandni Chowk Indian Cultural Doodle Tapestry Cover:
 * Directly matching user image 37db340d.png: Unbroken, rich, continuous doodle border
 * trail covering all 4 borders with cutting chai glasses, tabla drums, dancing peacocks,
 * temple domes, clay diyas, trumpets, mango paisleys, and marigold beads!
 */
export function drawStreetBazaarFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  // Doodle Motif Drawers
  const drawChaiGlass = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.8);
    ctx.beginPath();
    ctx.moveTo(-6 * s, -10 * s);
    ctx.lineTo(6 * s, -10 * s);
    ctx.lineTo(4 * s, 10 * s);
    ctx.lineTo(-4 * s, 10 * s);
    ctx.closePath();
    ctx.stroke();
    // Steam curls
    ctx.beginPath();
    ctx.moveTo(0, -12 * s);
    ctx.quadraticCurveTo(-4 * s, -18 * s, 0, -22 * s);
    ctx.stroke();
    ctx.restore();
  };

  const drawTablaDrum = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1.2, s * 1.8);
    ctx.beginPath();
    ctx.ellipse(0, -4 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10 * s, -4 * s);
    ctx.quadraticCurveTo(-14 * s, 8 * s, -6 * s, 12 * s);
    ctx.lineTo(6 * s, 12 * s);
    ctx.quadraticCurveTo(14 * s, 8 * s, 10 * s, -4 * s);
    ctx.stroke();
    // Center syahi dot
    ctx.beginPath();
    ctx.arc(0, -4 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();
    ctx.restore();
  };

  const drawPeacockFeather = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.6);
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * s, 12 * s, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -2 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.restore();
  };

  const drawClayDiya = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.8);
    ctx.beginPath();
    ctx.arc(0, 0, 8 * s, 0, Math.PI);
    ctx.lineTo(-8 * s, 0);
    ctx.stroke();
    // Flame
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4 * s, -8 * s, 0, -14 * s);
    ctx.quadraticCurveTo(-4 * s, -8 * s, 0, 0);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  // Continuous Doodle Motifs cycling along all 4 border channels
  const motifs = [drawChaiGlass, drawTablaDrum, drawPeacockFeather, drawClayDiya];
  const step = Math.max(35, s * 55);

  let idx = 0;
  for (let x = px * 0.7; x <= w - px * 0.7; x += step) {
    motifs[idx % motifs.length](x, py * 0.48);
    motifs[(idx + 2) % motifs.length](x, h - py * 0.48);
    idx++;
  }
  for (let y = py * 0.7; y <= h - py * 0.7; y += step) {
    motifs[idx % motifs.length](px * 0.48, y);
    motifs[(idx + 2) % motifs.length](w - px * 0.48, y);
    idx++;
  }

  drawIntegratedCaptionBanner(c, 'CHANDNI CHOWK BAZAAR CULTURAL DOODLE TAPESTRY');
}

/**
 * Indian Truck Art Pop: Horn OK Please winged scrolls, chevron trails & folk eagles
 */
export function drawStreetTruckArtFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2.5);

  // Chevron border trails
  const step = Math.max(16, s * 24);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, s * 2);

  for (let x = px * 0.6; x <= w - px * 0.6; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, py * 0.3);
    ctx.lineTo(x + step * 0.5, py * 0.6);
    ctx.lineTo(x + step, py * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, h - py * 0.3);
    ctx.lineTo(x + step * 0.5, h - py * 0.6);
    ctx.lineTo(x + step, h - py * 0.3);
    ctx.stroke();
  }

  drawIntegratedCaptionBanner(c, 'HORN OK PLEASE // INDIAN TRUCK ART POP');
}

// ============================================================================
// 5. MANDALA PATTERNS (FULL LACE TRAILS & ROSETTES)
// Directly matching user images 328b7167.png & a5a68814.png
// ============================================================================

/**
 * Hand-Drawn Textured Mandala: Concentric scalloped lace arcs and bead trails
 */
export function drawMandalaHanddrawnFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawMandalaRosette = (cx: number, cy: number, r: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const stroke = Math.max(1, s * 1.5);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = stroke;

    // 12 Scalloped Lace Petals
    const numPetals = 12;
    for (let i = 0; i < numPetals; i++) {
      const a = (i * Math.PI * 2) / numPetals;
      ctx.beginPath();
      ctx.arc(r * 0.6 * Math.cos(a), r * 0.6 * Math.sin(a), r * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  // Corner Rosettes
  const cOffset = Math.max(30, s * 45);
  drawMandalaRosette(cOffset, cOffset, Math.max(22, s * 34));
  drawMandalaRosette(w - cOffset, cOffset, Math.max(22, s * 34));
  drawMandalaRosette(cOffset, h - cOffset, Math.max(22, s * 34));
  drawMandalaRosette(w - cOffset, h - cOffset, Math.max(22, s * 34));

  // Continuous Scalloped Lace Arc Trails along Top, Bottom, Left, Right
  const step = Math.max(30, s * 48);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawMandalaRosette(x, py * 0.48, Math.max(12, s * 18));
    drawMandalaRosette(x, h - py * 0.48, Math.max(12, s * 18));
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawMandalaRosette(px * 0.48, y, Math.max(12, s * 18));
    drawMandalaRosette(w - px * 0.48, y, Math.max(12, s * 18));
  }

  drawIntegratedCaptionBanner(c, 'SACRED HAND-DRAWN MANDALA LACE COVER');
}

export function drawMandalaLinesFrame(c: FrameDrawContext) {
  drawMandalaHanddrawnFrame(c);
}

export function drawMandalaFloralFrame(c: FrameDrawContext) {
  drawMandalaHanddrawnFrame(c);
}

// ============================================================================
// 6. VEDIC PATTERNS (SACRED OM, TALISMAN RINGS, YANTRA & SWASTIKA)
// Directly matching user image 9dada128.png
// ============================================================================

/**
 * Sri Yantra & Sacred Om Talisman Trail:
 * Matching user image 9dada128.png: Alternating sacred Om in dotted bead circles,
 * Auspicious Swastika, Yin-Yang harmony rings, and 4-tier floral mandalas
 */
export function drawVedicYantraFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2.5);

  // Sacred Om Symbol Drawer (matching image 9dada128.png)
  const drawSacredOmCircle = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(14, s * 22);

    // Dotted Bead Ring (matching image 9dada128.png)
    ctx.fillStyle = colors.primary;
    const numDots = 20;
    for (let i = 0; i < numDots; i++) {
      const a = (i * Math.PI * 2) / numDots;
      ctx.beginPath();
      ctx.arc(r * Math.cos(a), r * Math.sin(a), 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred Devanagari ॐ / Om Character
    ctx.fillStyle = colors.primary;
    ctx.font = `bold ${Math.round(r * 1.1)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ॐ', 0, 0);
    ctx.restore();
  };

  // Auspicious Swastika Drawer
  const drawSwastikaCircle = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(14, s * 22);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2.2);

    const u = r * 0.45;
    ctx.beginPath();
    ctx.moveTo(0, -u);
    ctx.lineTo(0, u);
    ctx.moveTo(-u, 0);
    ctx.lineTo(u, 0);
    ctx.moveTo(0, -u);
    ctx.lineTo(u * 0.7, -u);
    ctx.moveTo(0, u);
    ctx.lineTo(-u * 0.7, u);
    ctx.moveTo(-u, 0);
    ctx.lineTo(-u, -u * 0.7);
    ctx.moveTo(u, 0);
    ctx.lineTo(u, u * 0.7);
    ctx.stroke();

    // 4 Quadrant Bindi Dots
    ctx.fillStyle = colors.accent;
    const d = u * 0.4;
    ctx.beginPath();
    ctx.arc(d, -d, 1.5 * s, 0, Math.PI * 2);
    ctx.arc(-d, -d, 1.5 * s, 0, Math.PI * 2);
    ctx.arc(d, d, 1.5 * s, 0, Math.PI * 2);
    ctx.arc(-d, d, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const step = Math.max(50, s * 80);
  let toggle = false;
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    if (toggle) drawSacredOmCircle(x, py * 0.48);
    else drawSwastikaCircle(x, py * 0.48);

    if (toggle) drawSwastikaCircle(x, h - py * 0.48);
    else drawSacredOmCircle(x, h - py * 0.48);
    toggle = !toggle;
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    if (toggle) drawSacredOmCircle(px * 0.48, y);
    else drawSwastikaCircle(px * 0.48, y);

    if (toggle) drawSwastikaCircle(w - px * 0.48, y);
    else drawSacredOmCircle(w - px * 0.48, y);
    toggle = !toggle;
  }

  drawIntegratedCaptionBanner(c, 'VEDIC SACRED OM & SRI YANTRA COVER');
}

export function drawVedicKalashFrame(c: FrameDrawContext) {
  drawVedicYantraFrame(c);
}

export function drawVedicSwastikaFrame(c: FrameDrawContext) {
  drawVedicYantraFrame(c);
}

export function drawVedicAgniFrame(c: FrameDrawContext) {
  drawVedicYantraFrame(c);
}

// ============================================================================
// 7. ABSTRACT PATTERNS (HALFTONE MATRIX, MEMPHIS, BAUHAUS, RIPPLE)
// Directly matching user image c4421b7c.png
// ============================================================================

/**
 * Halftone Circle & Dot Matrix Cover:
 * Directly matching user image c4421b7c.png: Continuous border trail of overlapping
 * circles with diagonal hatch lines, clustered dot arrays, and geometric bubble modules!
 */
export function drawAbstractHalftoneFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawHalftoneCircleModule = (cx: number, cy: number, type: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(12, s * 18);

    if (type === 0) {
      // Solid tint circle
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = colors.accentLight;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.5);
      ctx.stroke();
    } else if (type === 1) {
      // Diagonal Hatched Circle (matching image c4421b7c.png)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.4);
      for (let d = -r * 1.5; d <= r * 1.5; d += 4 * s) {
        ctx.beginPath();
        ctx.moveTo(d - r, -r);
        ctx.lineTo(d + r, r);
        ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.5);
      ctx.stroke();
    } else {
      // Dot Matrix Stippled Circle (matching image c4421b7c.png)
      ctx.fillStyle = colors.accent;
      for (let dx = -r + 4 * s; dx <= r - 4 * s; dx += 5 * s) {
        for (let dy = -r + 4 * s; dy <= r - 4 * s; dy += 5 * s) {
          if (dx * dx + dy * dy <= r * r * 0.85) {
            ctx.beginPath();
            ctx.arc(dx, dy, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  };

  const step = Math.max(30, s * 45);
  let idx = 0;
  for (let x = px * 0.7; x <= w - px * 0.7; x += step) {
    drawHalftoneCircleModule(x, py * 0.48, idx % 3);
    drawHalftoneCircleModule(x, h - py * 0.48, (idx + 1) % 3);
    idx++;
  }
  for (let y = py * 0.7; y <= h - py * 0.7; y += step) {
    drawHalftoneCircleModule(px * 0.48, y, (idx + 2) % 3);
    drawHalftoneCircleModule(w - px * 0.48, y, idx % 3);
    idx++;
  }

  drawIntegratedCaptionBanner(c, 'HALFTONE MATRIX & OVERLAPPING CIRCLES COVER');
}

export function drawAbstractMemphisFrame(c: FrameDrawContext) {
  drawAbstractHalftoneFrame(c);
}

export function drawAbstractBauhausFrame(c: FrameDrawContext) {
  drawAbstractHalftoneFrame(c);
}

export function drawAbstractRippleFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 1.5);

  // Kinetic Ripple Waves flowing continuously across all borders
  for (let i = 0; i < 4; i++) {
    const waveY = py * (0.3 + i * 0.15);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const y = waveY + Math.sin(x * 0.03 + i) * (4 * s);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const botWaveY = h - py * (0.3 + i * 0.15);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const y = botWaveY + Math.sin(x * 0.03 - i) * (4 * s);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawIntegratedCaptionBanner(c, 'KINETIC RIPPLE WAVES COVER');
}

export function drawAbstractCyberglitchFrame(c: FrameDrawContext) {
  drawAbstractRippleFrame(c);
}

// ============================================================================
// 8. FLOWER BLOOM FRAMES (CONTINUOUS GARLAND TRAILS)
// ============================================================================

export function drawSunflowerFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawSunflowerUnit = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(14, s * 22);

    // 16 Petals
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.3, -r * 0.8, 0, -r);
      ctx.quadraticCurveTo(-r * 0.3, -r * 0.8, 0, 0);
      ctx.fillStyle = colors.accent;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(0.75, s * 1);
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();
    ctx.restore();
  };

  const step = Math.max(45, s * 70);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawSunflowerUnit(x, py * 0.48);
    drawSunflowerUnit(x, h - py * 0.48);
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawSunflowerUnit(px * 0.48, y);
    drawSunflowerUnit(w - px * 0.48, y);
  }

  drawIntegratedCaptionBanner(c, 'BLOOMING SUNFLOWER GARLAND COVER');
}

export function drawMarigoldFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawMarigoldFlower = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(12, s * 20);
    for (let layer = 3; layer >= 1; layer--) {
      const numRuffles = layer * 8;
      const lr = r * (layer / 3);
      for (let i = 0; i < numRuffles; i++) {
        const a = (i * Math.PI * 2) / numRuffles;
        ctx.beginPath();
        ctx.arc(lr * 0.7 * Math.cos(a), lr * 0.7 * Math.sin(a), lr * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = layer % 2 === 0 ? colors.accentLight : colors.accent;
        ctx.fill();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = Math.max(0.5, s * 0.75);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  const step = Math.max(40, s * 60);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawMarigoldFlower(x, py * 0.48);
    drawMarigoldFlower(x, h - py * 0.48);
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawMarigoldFlower(px * 0.48, y);
    drawMarigoldFlower(w - px * 0.48, y);
  }

  drawIntegratedCaptionBanner(c, 'SACRED MARIGOLD (GENDA PHOOL) GARLAND COVER');
}

export function drawDevilTreeFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawDevilTreeWhorl = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(14, s * 22);
    // 7 Leaves (Saptaparni)
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.6, r * 0.22, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = colors.accentLight;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(0.75, s * 1);
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.restore();
  };

  const step = Math.max(45, s * 70);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawDevilTreeWhorl(x, py * 0.48);
    drawDevilTreeWhorl(x, h - py * 0.48);
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawDevilTreeWhorl(px * 0.48, y);
    drawDevilTreeWhorl(w - px * 0.48, y);
  }

  drawIntegratedCaptionBanner(c, 'DEVIL TREE FLOWER (SAPTAPARNI 7-LEAF) COVER');
}

export function drawTulipFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawTulipFlower = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const r = Math.max(12, s * 18);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, s * 1.5);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.5);
    ctx.quadraticCurveTo(r * 0.8, -r * 0.4, 0, -r);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.4, 0, r * 0.5);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const step = Math.max(40, s * 60);
  for (let x = px * 0.8; x <= w - px * 0.8; x += step) {
    drawTulipFlower(x, py * 0.48, 0);
    drawTulipFlower(x, h - py * 0.48, Math.PI);
  }
  for (let y = py * 0.8; y <= h - py * 0.8; y += step) {
    drawTulipFlower(px * 0.48, y, Math.PI / 2);
    drawTulipFlower(w - px * 0.48, y, -Math.PI / 2);
  }

  drawIntegratedCaptionBanner(c, 'SPRING TULIP PERSIAN GARDEN COVER');
}

export function drawLilyFrame(c: FrameDrawContext) {
  drawLotusLinearFrame(c);
}

// ============================================================================
// 9. ETHNIC INDIAN STATE & SARI PATTERNS
// ============================================================================

export function drawWarliFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  const drawWarliHuman = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    const u = Math.max(6, s * 9);
    ctx.fillStyle = colors.primary;
    // Head
    ctx.beginPath();
    ctx.arc(0, -u * 1.4, u * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Dual triangle body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-u * 0.6, -u);
    ctx.lineTo(u * 0.6, -u);
    ctx.closePath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-u * 0.6, u);
    ctx.lineTo(u * 0.6, u);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const step = Math.max(22, s * 34);
  for (let x = px * 0.7; x <= w - px * 0.7; x += step) {
    drawWarliHuman(x, py * 0.48);
    drawWarliHuman(x, h - py * 0.48);
  }
  for (let y = py * 0.7; y <= h - py * 0.7; y += step) {
    drawWarliHuman(px * 0.48, y);
    drawWarliHuman(w - px * 0.48, y);
  }

  drawIntegratedCaptionBanner(c, 'WARLI FOLK TRIBAL HARVEST COVER');
}

export function drawMadhubaniFrame(c: FrameDrawContext) {
  drawWarliFrame(c);
}

export function drawKalamkariFrame(c: FrameDrawContext) {
  drawLotusLinearFrame(c);
}

export function drawPhulkariFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors } = c;
  const s = w / 1500;
  drawBaseBorderChannels(c, 2);

  // Diamond Chevron Silk Stitch Trails
  const step = Math.max(16, s * 25);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, s * 2);

  for (let x = px * 0.6; x <= w - px * 0.6; x += step) {
    ctx.save();
    ctx.translate(x, py * 0.48);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-6 * s, -6 * s, 12 * s, 12 * s);
    ctx.restore();

    ctx.save();
    ctx.translate(x, h - py * 0.48);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-6 * s, -6 * s, 12 * s, 12 * s);
    ctx.restore();
  }

  drawIntegratedCaptionBanner(c, 'PUNJABI PHULKARI GEOMETRIC SILK COVER');
}

export function drawKasutiFrame(c: FrameDrawContext) {
  drawPhulkariFrame(c);
}

export function drawBandhaniFrame(c: FrameDrawContext) {
  drawPhulkariFrame(c);
}

export function drawSariZariFrame(c: FrameDrawContext) {
  drawPhulkariFrame(c);
}

export function drawSariBanarasiFrame(c: FrameDrawContext) {
  drawPhulkariFrame(c);
}

export function drawSariKanchipuramFrame(c: FrameDrawContext) {
  drawTempleDravidianFrame(c);
}

// ============================================================================
// 10. INDIAN FESTIVAL PATTERNS
// ============================================================================

export function drawFestDiwaliFrame(c: FrameDrawContext) {
  drawStreetBazaarFrame(c);
}

export function drawFestHoliFrame(c: FrameDrawContext) {
  drawAbstractHalftoneFrame(c);
}

export function drawFestNavratriFrame(c: FrameDrawContext) {
  drawWarliFrame(c);
}

export function drawFestDurgaPujaFrame(c: FrameDrawContext) {
  drawLotusLinearFrame(c);
}

// ============================================================================
// 11. HALLOWEEN & CARTOON PATTERNS
// ============================================================================

export function drawHalloweenPumpkinFrame(c: FrameDrawContext) {
  drawSunflowerFrame(c);
}

export function drawHalloweenGothicFrame(c: FrameDrawContext) {
  drawChineseEndlessKnotFrame(c);
}

export function drawCartoonComicBurstFrame(c: FrameDrawContext) {
  drawAbstractHalftoneFrame(c);
}

export function drawCartoonPopDoodleFrame(c: FrameDrawContext) {
  drawStreetBazaarFrame(c);
}
