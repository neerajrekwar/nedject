/**
 * Procedural Canvas Frame Drawing Library for Photo DPI Studio
 * High-resolution vector drawing routines for 300, 600, 1200 DPI prints
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
// 1. FLOWER BLOOM FRAMES
// ============================================================================

/**
 * Sunflower: Blooming golden sunflower petals in corners with circular seed matrix
 */
export function drawSunflowerFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  // Outer border & inner border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 4);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 2);
  ctx.strokeRect(px - 4 * s, py - 4 * s, pw + 8 * s, ph + 8 * s);

  // Corner Sunflowers
  const drawCornerSunflower = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const radius = Math.max(30, s * 55);

    // Petals
    const numPetals = 16;
    for (let i = 0; i < numPetals; i++) {
      const angle = (i * Math.PI * 2) / numPetals;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(radius * 0.35, -radius * 0.9, 0, -radius);
      ctx.quadraticCurveTo(-radius * 0.35, -radius * 0.9, 0, 0);
      ctx.fillStyle = i % 2 === 0 ? colors.accent : colors.accentLight;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.2);
      ctx.stroke();
      ctx.restore();
    }

    // Sunflower Center Disk (Fermat Seed Matrix)
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();
    ctx.strokeStyle = colors.accentLight;
    ctx.lineWidth = Math.max(1, s * 1.5);
    ctx.stroke();

    // Golden seed dots
    ctx.fillStyle = colors.accent;
    const numSeeds = 24;
    for (let i = 1; i <= numSeeds; i++) {
      const theta = i * 2.39996; // Golden angle
      const r = (radius * 0.35) * Math.sqrt(i / numSeeds);
      ctx.beginPath();
      ctx.arc(r * Math.cos(theta), r * Math.sin(theta), Math.max(1, s * 1.8), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const cOffset = Math.max(35, s * 65);
  drawCornerSunflower(cOffset, cOffset);
  drawCornerSunflower(w - cOffset, cOffset);
  drawCornerSunflower(cOffset, h - cOffset);
  drawCornerSunflower(w - cOffset, h - cOffset);

  // Border Sunflower Garlands
  const step = Math.max(45, s * 70);
  for (let x = cOffset + step; x < w - cOffset - step / 2; x += step) {
    drawMiniSunflower(ctx, x, cOffset * 0.6, s, colors);
    drawMiniSunflower(ctx, x, h - cOffset * 0.6, s, colors);
  }
  for (let y = cOffset + step; y < h - cOffset - step / 2; y += step) {
    drawMiniSunflower(ctx, cOffset * 0.6, y, s, colors);
    drawMiniSunflower(ctx, w - cOffset * 0.6, y, s, colors);
  }

  drawBottomPlaque(c, caption || 'BLOOMING SUNFLOWER SPECIMEN');
}

function drawMiniSunflower(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, colors: PaletteColors) {
  ctx.save();
  ctx.translate(x, y);
  const r = Math.max(8, s * 14);
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, -r, r * 0.4, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = colors.primary;
  ctx.fill();
  ctx.restore();
}

/**
 * Marigold: Sacred Indian Genda Phool dense ruffled concentric scalloped blossoms
 */
export function drawMarigoldFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  // Outer framing
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 14 * s, py - 14 * s, pw + 28 * s, ph + 28 * s);

  const drawMarigoldFlower = (cx: number, cy: number, radius: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const rings = 4;
    for (let r = rings; r >= 1; r--) {
      const curR = (radius * r) / rings;
      const petals = 12 + r * 4;
      ctx.beginPath();
      for (let i = 0; i < petals; i++) {
        const theta = (i * Math.PI * 2) / petals;
        const nextTheta = ((i + 1) * Math.PI * 2) / petals;
        const midTheta = (theta + nextTheta) / 2;
        const bump = curR * 1.25;
        if (i === 0) ctx.moveTo(curR * Math.cos(theta), curR * Math.sin(theta));
        ctx.quadraticCurveTo(bump * Math.cos(midTheta), bump * Math.sin(midTheta), curR * Math.cos(nextTheta), curR * Math.sin(nextTheta));
      }
      ctx.closePath();
      ctx.fillStyle = r % 2 === 0 ? colors.accent : colors.accentLight;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.2);
      ctx.stroke();
    }
    // Center pollen knob
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();
    ctx.restore();
  };

  const garlandR = Math.max(16, s * 24);
  const offset = Math.max(28, s * 45);

  // Continuous Marigold Toran / Garland along all 4 edges
  for (let x = offset; x <= w - offset; x += garlandR * 1.8) {
    drawMarigoldFlower(x, offset * 0.6, garlandR);
    drawMarigoldFlower(x, h - offset * 0.6, garlandR);
  }
  for (let y = offset; y <= h - offset; y += garlandR * 1.8) {
    drawMarigoldFlower(offset * 0.6, y, garlandR);
    drawMarigoldFlower(w - offset * 0.6, y, garlandR);
  }

  // Connecting gold toran cord
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, s * 2);
  ctx.strokeRect(offset * 0.6, offset * 0.6, w - offset * 1.2, h - offset * 1.2);

  drawBottomPlaque(c, caption || 'SACRED MARIGOLD (GENDA PHOOL) FESTOON');
}

/**
 * Devil's Tree Flower (Saptaparni / Alstonia Scholaris): Delicate 7-part whorls & star clusters
 */
export function drawDevilTreeFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 8 * s, py - 8 * s, pw + 16 * s, ph + 16 * s);

  const drawSaptaparniCluster = (cx: number, cy: number, flipX: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, 1);

    // 7-leaf whorled branch
    const numLeaves = 7;
    for (let i = 0; i < numLeaves; i++) {
      const ang = -Math.PI / 2 + ((i - 3) * Math.PI) / 6;
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8 * s, -25 * s, 0, -45 * s);
      ctx.quadraticCurveTo(-8 * s, -25 * s, 0, 0);
      ctx.fillStyle = colors.accentLight;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s);
      ctx.stroke();
      ctx.restore();
    }

    // Delicate star-blossoms
    const numStars = 5;
    for (let j = 0; j < numStars; j++) {
      const bx = (j - 2) * 12 * s;
      const by = -50 * s - Math.abs(j - 2) * 6 * s;
      ctx.save();
      ctx.translate(bx, by);
      for (let p = 0; p < 5; p++) {
        ctx.save();
        ctx.rotate((p * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.arc(0, -6 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent;
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 2 * s, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  const inset = Math.max(30, s * 55);
  drawSaptaparniCluster(inset, inset, 1);
  drawSaptaparniCluster(w - inset, inset, -1);
  drawSaptaparniCluster(inset, h - inset, 1);
  drawSaptaparniCluster(w - inset, h - inset, -1);

  drawBottomPlaque(c, caption || 'DEVILS TREE (SAPTAPARNI) WHORL SPECIMEN');
}

/**
 * Tulip: Botanical tulip cup silhouettes & symmetrical leaf arches
 */
export function drawTulipFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3.5);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawTulipFlower = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Tulip cup
    ctx.beginPath();
    ctx.moveTo(-12 * s, 0);
    ctx.bezierCurveTo(-14 * s, -18 * s, -6 * s, -28 * s, -2 * s, -30 * s);
    ctx.bezierCurveTo(-1 * s, -22 * s, 1 * s, -22 * s, 2 * s, -30 * s);
    ctx.bezierCurveTo(6 * s, -28 * s, 14 * s, -18 * s, 12 * s, 0);
    ctx.quadraticCurveTo(0, 8 * s, -12 * s, 0);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.5);
    ctx.stroke();

    // Inner petal highlight
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.lineTo(0, -22 * s);
    ctx.strokeStyle = colors.accentLight;
    ctx.stroke();

    // Symmetrical curving leaves
    ctx.beginPath();
    ctx.moveTo(0, 8 * s);
    ctx.quadraticCurveTo(-18 * s, 6 * s, -22 * s, -12 * s);
    ctx.quadraticCurveTo(-15 * s, -2 * s, 0, 14 * s);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 8 * s);
    ctx.quadraticCurveTo(18 * s, 6 * s, 22 * s, -12 * s);
    ctx.quadraticCurveTo(15 * s, -2 * s, 0, 14 * s);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(25, s * 40);
  const step = Math.max(50, s * 80);

  for (let x = margin + step; x < w - margin; x += step) {
    drawTulipFlower(x, margin * 0.7, 0);
    drawTulipFlower(x, h - margin * 0.7, Math.PI);
  }
  for (let y = margin + step; y < h - margin; y += step) {
    drawTulipFlower(margin * 0.7, y, Math.PI / 2);
    drawTulipFlower(w - margin * 0.7, y, -Math.PI / 2);
  }

  drawBottomPlaque(c, caption || 'KASHMIRI BOTANICAL TULIP SPECIMEN');
}

/**
 * Lily: Graceful water lily / stylized fleur-de-lis flourishes
 */
export function drawLilyFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 8 * s, py - 8 * s, pw + 16 * s, ph + 16 * s);

  const drawLilyFlower = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Center lanceolate petal
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.quadraticCurveTo(9 * s, -16 * s, 0, -32 * s);
    ctx.quadraticCurveTo(-9 * s, -16 * s, 0, 6 * s);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, s * 1.5);
    ctx.stroke();

    // Left curved petal
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.bezierCurveTo(-14 * s, 4 * s, -24 * s, -12 * s, -22 * s, -24 * s);
    ctx.bezierCurveTo(-18 * s, -14 * s, -8 * s, -4 * s, 0, 6 * s);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    // Right curved petal
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.bezierCurveTo(14 * s, 4 * s, 24 * s, -12 * s, 22 * s, -24 * s);
    ctx.bezierCurveTo(18 * s, -14 * s, 8 * s, -4 * s, 0, 6 * s);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    // Base band
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-8 * s, 6 * s, 16 * s, 4 * s);

    ctx.restore();
  };

  const margin = Math.max(30, s * 45);
  drawLilyFlower(margin, margin, Math.PI / 4);
  drawLilyFlower(w - margin, margin, -Math.PI / 4);
  drawLilyFlower(margin, h - margin, (3 * Math.PI) / 4);
  drawLilyFlower(w - margin, h - margin, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'ROYAL WATER LILY SPECIMEN');
}

// ============================================================================
// 2. VECTOR SEAMLESS BORDER (ELEPHANT ODISHA & LOTUS LINEAR)
// ============================================================================

/**
 * Ornate Indian Elephant (Odisha / Odia): Pattachitra & Pipli applique regal elephant border
 */
export function drawElephantOdishaFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  // Double temple borders
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 14 * s, py - 14 * s, pw + 28 * s, ph + 28 * s);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 2);
  ctx.strokeRect(px - 6 * s, py - 6 * s, pw + 12 * s, ph + 12 * s);

  const drawOdiaElephant = (cx: number, cy: number, scaleX: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX * s * 0.9, s * 0.9);

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(18, -6, 12, 0, Math.PI * 2);
    ctx.fill();

    // Raised Trunk (Auspicious Gaja)
    ctx.beginPath();
    ctx.moveTo(26, -4);
    ctx.bezierCurveTo(34, -4, 38, -18, 32, -24);
    ctx.bezierCurveTo(28, -26, 26, -20, 24, -14);
    ctx.lineTo(24, 0);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // Tusk
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.quadraticCurveTo(30, 2, 34, -6);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Large decorative ear
    ctx.beginPath();
    ctx.ellipse(12, -4, 8, 12, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.accentLight;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ornate Royal Howdah Blanket (Jhula) on back
    ctx.fillStyle = colors.accentLight;
    ctx.fillRect(-12, -14, 24, 12);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -14, 24, 12);

    // Legs
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-16, 12, 8, 14);
    ctx.fillRect(-4, 12, 8, 14);
    ctx.fillRect(8, 12, 8, 14);

    // Tail
    ctx.beginPath();
    ctx.moveTo(-22, -2);
    ctx.quadraticCurveTo(-28, 8, -26, 16);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(30, s * 50);
  const step = Math.max(70, s * 110);

  // Marching procession along top and bottom
  for (let x = margin + step * 0.5; x < w - margin; x += step) {
    drawOdiaElephant(x, margin * 0.65, 1);
    drawOdiaElephant(x, h - margin * 0.65, -1);
  }

  // Corner Odia temple kalasa rosettes
  const drawCornerRosette = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(14, s * 22), 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();
    ctx.restore();
  };

  drawCornerRosette(margin * 0.65, margin * 0.65);
  drawCornerRosette(w - margin * 0.65, margin * 0.65);
  drawCornerRosette(margin * 0.65, h - margin * 0.65);
  drawCornerRosette(w - margin * 0.65, h - margin * 0.65);

  drawBottomPlaque(c, caption || 'ODISHA PATTACHITRA ROYAL ELEPHANT BORDER');
}

/**
 * Stylized Linear Lotus Flower border repeating seamlessly
 */
export function drawLotusLinearFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawLinearLotus = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1.5, s * 2);

    // Central petal
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.quadraticCurveTo(8 * s, -12 * s, 0, -28 * s);
    ctx.quadraticCurveTo(-8 * s, -12 * s, 0, 6 * s);
    ctx.stroke();

    // Left petal
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.bezierCurveTo(-10 * s, 0, -20 * s, -10 * s, -18 * s, -22 * s);
    ctx.quadraticCurveTo(-8 * s, -8 * s, 0, 6 * s);
    ctx.stroke();

    // Right petal
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.bezierCurveTo(10 * s, 0, 20 * s, -10 * s, 18 * s, -22 * s);
    ctx.quadraticCurveTo(8 * s, -8 * s, 0, 6 * s);
    ctx.stroke();

    // Base water leaf ripples
    ctx.beginPath();
    ctx.moveTo(-16 * s, 8 * s);
    ctx.quadraticCurveTo(0, 14 * s, 16 * s, 8 * s);
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(25, s * 45);
  const step = Math.max(45, s * 70);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawLinearLotus(x, margin * 0.65, 0);
    drawLinearLotus(x, h - margin * 0.65, Math.PI);
  }
  for (let y = margin + step / 2; y < h - margin; y += step) {
    drawLinearLotus(margin * 0.65, y, Math.PI / 2);
    drawLinearLotus(w - margin * 0.65, y, -Math.PI / 2);
  }

  drawBottomPlaque(c, caption || 'STYLIZED LINEAR SACRED LOTUS BORDER');
}

// ============================================================================
// 3. MANDALA PATTERNS
// ============================================================================

/**
 * Hand-drawn Mandala: Organic fine-line sacred circles, petals, teardrops & stipples
 */
export function drawMandalaHanddrawnFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawCornerMandala = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const maxR = Math.max(45, s * 80);

    // Concentric rings
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(0, 0, (maxR * r) / 4, 0, Math.PI * 2);
      ctx.strokeStyle = r % 2 === 0 ? colors.accent : colors.primary;
      ctx.lineWidth = Math.max(1, s * 1.5);
      ctx.stroke();
    }

    // Teardrop petals radiating outward
    const petals = 16;
    for (let i = 0; i < petals; i++) {
      const ang = (i * Math.PI * 2) / petals;
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(maxR * 0.5, 0);
      ctx.quadraticCurveTo(maxR * 0.75, 8 * s, maxR, 0);
      ctx.quadraticCurveTo(maxR * 0.75, -8 * s, maxR * 0.5, 0);
      ctx.fillStyle = i % 2 === 0 ? colors.accentLight : colors.accent;
      ctx.fill();
      ctx.stroke();

      // Dot stipple tip
      ctx.beginPath();
      ctx.arc(maxR * 1.08, 0, Math.max(1.5, s * 2.5), 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  const offset = Math.max(50, s * 90);
  drawCornerMandala(offset, offset);
  drawCornerMandala(w - offset, offset);
  drawCornerMandala(offset, h - offset);
  drawCornerMandala(w - offset, h - offset);

  drawBottomPlaque(c, caption || 'HAND-DRAWN SACRED GEOMETRY MANDALA');
}

/**
 * Mandala Lines: Mathematical radial star geometry and intersecting rays
 */
export function drawMandalaLinesFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawLinearStarMandala = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(40, s * 70);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1, s * 1.5);

    // 24-point linear star
    const points = 24;
    for (let i = 0; i < points; i++) {
      const a1 = (i * Math.PI * 2) / points;
      const a2 = ((i + 8) * Math.PI * 2) / points;
      ctx.beginPath();
      ctx.moveTo(r * Math.cos(a1), r * Math.sin(a1));
      ctx.lineTo(r * Math.cos(a2), r * Math.sin(a2));
      ctx.stroke();
    }

    // Outer octagonal frame
    ctx.beginPath();
    for (let j = 0; j < 8; j++) {
      const a = (j * Math.PI * 2) / 8;
      const x = (r * 1.15) * Math.cos(a);
      const y = (r * 1.15) * Math.sin(a);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.primary;
    ctx.stroke();

    ctx.restore();
  };

  const offset = Math.max(45, s * 80);
  drawLinearStarMandala(offset, offset);
  drawLinearStarMandala(w - offset, offset);
  drawLinearStarMandala(offset, h - offset);
  drawLinearStarMandala(w - offset, h - offset);

  drawBottomPlaque(c, caption || 'RADIAL LINEAR STAR MANDALA');
}

/**
 * Mandala Floral: Concentric lotus mandala rosettes in perimeter
 */
export function drawMandalaFloralFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawFloralMandalaRosette = (cx: number, cy: number, radius: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    for (let layer = 3; layer >= 1; layer--) {
      const lRadius = (radius * layer) / 3;
      const petals = 8 * layer;
      for (let p = 0; p < petals; p++) {
        ctx.save();
        ctx.rotate((p * Math.PI * 2) / petals);
        ctx.beginPath();
        ctx.ellipse(0, -lRadius * 0.7, lRadius * 0.25, lRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = layer % 2 === 0 ? colors.accent : colors.accentLight;
        ctx.fill();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = Math.max(1, s);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  const mSize = Math.max(35, s * 55);
  const mOffset = Math.max(40, s * 65);
  drawFloralMandalaRosette(mOffset, mOffset, mSize);
  drawFloralMandalaRosette(w - mOffset, mOffset, mSize);
  drawFloralMandalaRosette(mOffset, h - mOffset, mSize);
  drawFloralMandalaRosette(w - mOffset, h - mOffset, mSize);

  drawBottomPlaque(c, caption || 'CONCENTRIC FLORAL MANDALA ROSETTE');
}

// ============================================================================
// 4. INDIAN VEDIC PATTERNS
// ============================================================================

/**
 * Vedic Sri Yantra: Interlocking sacred triangles, bindu & bhupura stepped square
 */
export function drawVedicYantraFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  // Bhupura stepped square gate borders
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 14 * s, py - 14 * s, pw + 28 * s, ph + 28 * s);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, s * 2);
  ctx.strokeRect(px - 6 * s, py - 6 * s, pw + 12 * s, ph + 12 * s);

  const drawSriYantra = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(35, s * 60);

    // Outer circle with lotus petals
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    // 9 Interlocking triangles (4 upward, 5 downward)
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1, s * 1.5);

    // Upward Triangle 1 (Shiva)
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.lineTo(r * 0.75, r * 0.65);
    ctx.lineTo(-r * 0.75, r * 0.65);
    ctx.closePath();
    ctx.stroke();

    // Downward Triangle 2 (Shakti)
    ctx.beginPath();
    ctx.moveTo(0, r * 0.85);
    ctx.lineTo(r * 0.75, -r * 0.65);
    ctx.lineTo(-r * 0.75, -r * 0.65);
    ctx.closePath();
    ctx.stroke();

    // Inner smaller triangles
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(r * 0.5, r * 0.45);
    ctx.lineTo(-r * 0.5, r * 0.45);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, r * 0.6);
    ctx.lineTo(r * 0.5, -r * 0.45);
    ctx.lineTo(-r * 0.5, -r * 0.45);
    ctx.closePath();
    ctx.stroke();

    // Central Bindu
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, s * 3.5), 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  const yOffset = Math.max(45, s * 75);
  drawSriYantra(yOffset, yOffset);
  drawSriYantra(w - yOffset, yOffset);
  drawSriYantra(yOffset, h - yOffset);
  drawSriYantra(w - yOffset, h - yOffset);

  drawBottomPlaque(c, caption || 'VEDIC SRI YANTRA SACRED GEOMETRY');
}

/**
 * Vedic Kalash: Auspicious pot, coconut, 5 mango leaves & mangal motifs
 */
export function drawVedicKalashFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3.5);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawKalash = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Pot base
    ctx.beginPath();
    ctx.arc(0, 4 * s, 16 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    // Swastika on pot belly
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, s * 1.5);
    const sw = 6 * s;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s - sw); ctx.lineTo(0, 4 * s + sw);
    ctx.moveTo(-sw, 4 * s); ctx.lineTo(sw, 4 * s);
    ctx.moveTo(0, 4 * s - sw); ctx.lineTo(sw, 4 * s - sw);
    ctx.moveTo(0, 4 * s + sw); ctx.lineTo(-sw, 4 * s + sw);
    ctx.moveTo(-sw, 4 * s); ctx.lineTo(-sw, 4 * s - sw);
    ctx.moveTo(sw, 4 * s); ctx.lineTo(sw, 4 * s + sw);
    ctx.stroke();

    // Neck
    ctx.fillStyle = colors.accentLight;
    ctx.fillRect(-10 * s, -14 * s, 20 * s, 6 * s);
    ctx.strokeRect(-10 * s, -14 * s, 20 * s, 6 * s);

    // 5 Mango Leaves (Amra Pallava)
    const leaves = [-0.6, -0.3, 0, 0.3, 0.6];
    leaves.forEach((angle) => {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -14 * s);
      ctx.quadraticCurveTo(6 * s, -28 * s, 0, -36 * s);
      ctx.quadraticCurveTo(-6 * s, -28 * s, 0, -14 * s);
      ctx.fillStyle = colors.accentLight;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Coconut (Shriphala)
    ctx.beginPath();
    ctx.ellipse(0, -22 * s, 7 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  const kOffset = Math.max(35, s * 60);
  drawKalash(kOffset, kOffset);
  drawKalash(w - kOffset, kOffset);
  drawKalash(kOffset, h - kOffset);
  drawKalash(w - kOffset, h - kOffset);

  drawBottomPlaque(c, caption || 'AUSPICIOUS VEDIC MANGAL KALASH');
}

/**
 * Vedic Swastika: Solar wheel & geometric auspicious fretwork
 */
export function drawVedicSwastikaFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawAuspiciousSwastika = (cx: number, cy: number, size: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(2, s * 3);

    const half = size / 2;
    ctx.beginPath();
    // Cross
    ctx.moveTo(0, -half); ctx.lineTo(0, half);
    ctx.moveTo(-half, 0); ctx.lineTo(half, 0);
    // Arms
    ctx.moveTo(0, -half); ctx.lineTo(half, -half);
    ctx.moveTo(half, 0); ctx.lineTo(half, half);
    ctx.moveTo(0, half); ctx.lineTo(-half, half);
    ctx.moveTo(-half, 0); ctx.lineTo(-half, -half);
    ctx.stroke();

    // 4 auspicious bindu dots
    ctx.fillStyle = colors.primary;
    const dotD = half * 0.45;
    const dotR = Math.max(1.5, s * 2.5);
    ctx.beginPath(); ctx.arc(dotD, -dotD, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(dotD, dotD, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-dotD, dotD, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-dotD, -dotD, dotR, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(30, s * 50);
  const step = Math.max(60, s * 95);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawAuspiciousSwastika(x, margin * 0.65, Math.max(16, s * 24));
    drawAuspiciousSwastika(x, h - margin * 0.65, Math.max(16, s * 24));
  }
  for (let y = margin + step / 2; y < h - margin; y += step) {
    drawAuspiciousSwastika(margin * 0.65, y, Math.max(16, s * 24));
    drawAuspiciousSwastika(w - margin * 0.65, y, Math.max(16, s * 24));
  }

  drawBottomPlaque(c, caption || 'VEDIC SOLAR SWASTIKA & SHUBH LABH');
}

/**
 * Vedic Agni: Sacred Havan Kund stepped fire altar geometry
 */
export function drawVedicAgniFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  // Stepped pyramid borders (like Havan Kund steps)
  for (let i = 0; i < 3; i++) {
    const inset = (px - 14 * s) + i * 4 * s;
    ctx.strokeStyle = i % 2 === 0 ? colors.primary : colors.accent;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  }

  // Flame crest in four corners
  const drawSacredFlame = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Triple rising flames
    ctx.beginPath();
    ctx.moveTo(0, 10 * s);
    ctx.bezierCurveTo(-14 * s, -4 * s, -6 * s, -24 * s, 0, -32 * s);
    ctx.bezierCurveTo(6 * s, -24 * s, 14 * s, -4 * s, 0, 10 * s);
    ctx.fillStyle = colors.accent;
    ctx.fill();

    // Inner bright tongue
    ctx.beginPath();
    ctx.moveTo(0, 8 * s);
    ctx.bezierCurveTo(-8 * s, 0, -3 * s, -14 * s, 0, -20 * s);
    ctx.bezierCurveTo(3 * s, -14 * s, 8 * s, 0, 0, 8 * s);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();

    ctx.restore();
  };

  const fOffset = Math.max(35, s * 55);
  drawSacredFlame(fOffset, fOffset, Math.PI / 4);
  drawSacredFlame(w - fOffset, fOffset, -Math.PI / 4);
  drawSacredFlame(fOffset, h - fOffset, (3 * Math.PI) / 4);
  drawSacredFlame(w - fOffset, h - fOffset, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'VEDIC HAVAN KUND SACRED AGNI FLAME');
}

// ============================================================================
// 5. ETHNIC INDIAN STATE PATTERNS
// ============================================================================

/**
 * Madhubani / Mithila (Bihar): Double lines with hatching, fish (matsya) & peacock
 */
export function drawMadhubaniFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  // Authentic Madhubani double-line border
  const b1 = px - 16 * s;
  const b2 = px - 8 * s;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1.5, s * 2);
  ctx.strokeRect(b1, b1, w - b1 * 2, h - b1 * 2);
  ctx.strokeRect(b2, b2, w - b2 * 2, h - b2 * 2);

  // Dense diagonal hatching between double lines
  ctx.lineWidth = Math.max(1, s);
  for (let x = b1; x < w - b1; x += 10 * s) {
    ctx.beginPath();
    ctx.moveTo(x, b1); ctx.lineTo(x + 6 * s, b2);
    ctx.moveTo(x, h - b2); ctx.lineTo(x + 6 * s, h - b1);
    ctx.stroke();
  }
  for (let y = b1; y < h - b1; y += 10 * s) {
    ctx.beginPath();
    ctx.moveTo(b1, y); ctx.lineTo(b2, y + 6 * s);
    ctx.moveTo(w - b2, y); ctx.lineTo(w - b1, y + 6 * s);
    ctx.stroke();
  }

  // Corner Madhubani Fish (Matsya)
  const drawMadhubaniFish = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Fish body
    ctx.beginPath();
    ctx.moveTo(-20 * s, 0);
    ctx.quadraticCurveTo(0, -14 * s, 18 * s, 0);
    ctx.quadraticCurveTo(0, 14 * s, -20 * s, 0);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.5);
    ctx.stroke();

    // Tail fin
    ctx.beginPath();
    ctx.moveTo(-20 * s, 0);
    ctx.lineTo(-30 * s, -12 * s);
    ctx.lineTo(-26 * s, 0);
    ctx.lineTo(-30 * s, 12 * s);
    ctx.closePath();
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    // Large distinctive eye
    ctx.beginPath();
    ctx.arc(10 * s, -2 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10 * s, -2 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Scales hatching
    ctx.strokeStyle = colors.primary;
    for (let sc = -10 * s; sc <= 4 * s; sc += 4 * s) {
      ctx.beginPath();
      ctx.arc(sc, 0, 5 * s, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  const fOffset = Math.max(45, s * 70);
  drawMadhubaniFish(fOffset, fOffset, Math.PI / 4);
  drawMadhubaniFish(w - fOffset, fOffset, -Math.PI / 4);
  drawMadhubaniFish(fOffset, h - fOffset, (3 * Math.PI) / 4);
  drawMadhubaniFish(w - fOffset, h - fOffset, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'BIHAR MITHILA MADHUBANI FOLK ART');
}

/**
 * Warli (Maharashtra): Tribal Tarpa circle dance figures & harvest triangles
 */
export function drawWarliFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 14 * s, py - 14 * s, pw + 28 * s, ph + 28 * s);

  const drawWarliHuman = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.fillStyle = colors.accent;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1.5, s * 2);

    // Head circle
    ctx.beginPath();
    ctx.arc(0, -18 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    // Body: Two inverse triangles meeting at the waist
    ctx.beginPath();
    ctx.moveTo(-8 * s, -12 * s);
    ctx.lineTo(8 * s, -12 * s);
    ctx.lineTo(0, 0); // waist
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0); // waist
    ctx.lineTo(-8 * s, 12 * s);
    ctx.lineTo(8 * s, 12 * s);
    ctx.closePath();
    ctx.fill();

    // Arms holding hands in circular Tarpa dance
    ctx.beginPath();
    ctx.moveTo(0, -6 * s);
    ctx.lineTo(-14 * s, -2 * s);
    ctx.moveTo(0, -6 * s);
    ctx.lineTo(14 * s, -2 * s);
    ctx.stroke();

    // Legs in dancing stride
    ctx.beginPath();
    ctx.moveTo(-4 * s, 12 * s);
    ctx.lineTo(-8 * s, 22 * s);
    ctx.moveTo(4 * s, 12 * s);
    ctx.lineTo(8 * s, 22 * s);
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(30, s * 45);
  const step = Math.max(35, s * 50);

  // Dancing humans along all 4 edges holding hands
  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawWarliHuman(x, margin * 0.65, 0);
    drawWarliHuman(x, h - margin * 0.65, Math.PI);
  }
  for (let y = margin + step / 2; y < h - margin; y += step) {
    drawWarliHuman(margin * 0.65, y, Math.PI / 2);
    drawWarliHuman(w - margin * 0.65, y, -Math.PI / 2);
  }

  drawBottomPlaque(c, caption || 'MAHARASHTRA WARLI TRIBAL TARPA DANCE');
}

/**
 * Kalamkari (Andhra Pradesh): Flowing tree-of-life paisley creepers & vine leaves
 */
export function drawKalamkariFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, s * 2);

  const drawPaisleyMotive = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Classic teardrop paisley (kalka)
    ctx.beginPath();
    ctx.moveTo(0, 16 * s);
    ctx.bezierCurveTo(-16 * s, 12 * s, -20 * s, -8 * s, -10 * s, -22 * s);
    ctx.bezierCurveTo(-4 * s, -30 * s, 6 * s, -30 * s, 14 * s, -22 * s);
    ctx.bezierCurveTo(24 * s, -10 * s, 14 * s, 6 * s, 0, 16 * s);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    // Curling tail
    ctx.beginPath();
    ctx.moveTo(14 * s, -22 * s);
    ctx.quadraticCurveTo(22 * s, -32 * s, 16 * s, -36 * s);
    ctx.stroke();

    // Floral infill
    ctx.beginPath();
    ctx.arc(0, -6 * s, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(35, s * 55);
  drawPaisleyMotive(margin, margin, Math.PI / 4);
  drawPaisleyMotive(w - margin, margin, -Math.PI / 4);
  drawPaisleyMotive(margin, h - margin, (3 * Math.PI) / 4);
  drawPaisleyMotive(w - margin, h - margin, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'ANDHRA PRADESH KALAMKARI TREE OF LIFE');
}

/**
 * Phulkari (Punjab): Geometric darn-stitch floral rhombus embroidery
 */
export function drawPhulkariFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawPhulkariDiamond = (cx: number, cy: number, size: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    for (let r = 3; r >= 1; r--) {
      const cur = (size * r) / 3;
      ctx.beginPath();
      ctx.moveTo(0, -cur);
      ctx.lineTo(cur, 0);
      ctx.lineTo(0, cur);
      ctx.lineTo(-cur, 0);
      ctx.closePath();
      ctx.fillStyle = r % 2 === 0 ? colors.accent : colors.accentLight;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s);
      ctx.stroke();
    }

    ctx.restore();
  };

  const margin = Math.max(25, s * 40);
  const step = Math.max(35, s * 50);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawPhulkariDiamond(x, margin * 0.65, Math.max(14, s * 20));
    drawPhulkariDiamond(x, h - margin * 0.65, Math.max(14, s * 20));
  }
  for (let y = margin + step / 2; y < h - margin; y += step) {
    drawPhulkariDiamond(margin * 0.65, y, Math.max(14, s * 20));
    drawPhulkariDiamond(w - margin * 0.65, y, Math.max(14, s * 20));
  }

  drawBottomPlaque(c, caption || 'PUNJAB PHULKARI GEOMETRIC EMBROIDERY');
}

/**
 * Kasuti (Karnataka): Dharwad temple chariot & stepped gopuram geometric stitch
 */
export function drawKasutiFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawKasutiGopuram = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1.5, s * 2);

    ctx.beginPath();
    ctx.moveTo(-18 * s, 12 * s); ctx.lineTo(18 * s, 12 * s);
    ctx.lineTo(14 * s, 4 * s); ctx.lineTo(-14 * s, 4 * s); ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-12 * s, 4 * s); ctx.lineTo(12 * s, 4 * s);
    ctx.lineTo(8 * s, -4 * s); ctx.lineTo(-8 * s, -4 * s); ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-6 * s, -4 * s); ctx.lineTo(6 * s, -4 * s);
    ctx.lineTo(0, -14 * s); ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -16 * s, 2 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(30, s * 45);
  const step = Math.max(50, s * 75);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawKasutiGopuram(x, margin * 0.65, 0);
    drawKasutiGopuram(x, h - margin * 0.65, Math.PI);
  }

  drawBottomPlaque(c, caption || 'KARNATAKA DHARWAD KASUTI STITCH');
}

/**
 * Bandhani / Leheriya (Rajasthan & Gujarat): Diagonal chevrons & micro tie-dye dot clusters
 */
export function drawBandhaniFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const margin = Math.max(20, s * 35);

  const drawBandhaniDotRing = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = colors.accent;
    const spacing = 5 * s;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        ctx.beginPath();
        ctx.arc(dx * spacing, dy * spacing, Math.max(1, s * 1.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(0, 0, 9 * s, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, s);
    ctx.stroke();

    ctx.restore();
  };

  const step = Math.max(35, s * 55);
  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawBandhaniDotRing(x, margin * 0.65);
    drawBandhaniDotRing(x, h - margin * 0.65);
  }
  for (let y = margin + step / 2; y < h - margin; y += step) {
    drawBandhaniDotRing(margin * 0.65, y);
    drawBandhaniDotRing(w - margin * 0.65, y);
  }

  drawBottomPlaque(c, caption || 'RAJASTHAN BANDHANI & LEHERIYA TIE-DYE');
}

// ============================================================================
// 6. SARI PATTERNS
// ============================================================================

/**
 * Sari Zari: Regal gold metallic brocade diamond border
 */
export function drawSariZariFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  const borderW = Math.max(18, s * 30);
  ctx.fillStyle = colors.accent;
  ctx.fillRect(px - borderW, py - borderW, pw + borderW * 2, borderW);
  ctx.fillRect(px - borderW, ph + py, pw + borderW * 2, borderW);
  ctx.fillRect(px - borderW, py, borderW, ph);
  ctx.fillRect(pw + px, py, borderW, ph);

  ctx.strokeStyle = colors.accentLight;
  ctx.lineWidth = Math.max(1, s * 1.5);
  const step = Math.max(12, s * 18);

  for (let x = px - borderW; x < pw + px + borderW; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, py - borderW); ctx.lineTo(x + step, py);
    ctx.moveTo(x, ph + py); ctx.lineTo(x + step, ph + py + borderW);
    ctx.stroke();
  }

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - borderW, py - borderW, pw + borderW * 2, ph + borderW * 2);
  ctx.strokeRect(px, py, pw, ph);

  drawBottomPlaque(c, caption || 'ROYAL METALLIC ZARI BROCADE BORDER');
}

/**
 * Banarasi Silk Sari: Ornate floral jaal lattice & grand corner kalkas
 */
export function drawSariBanarasiFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3.5);
  ctx.strokeRect(px - 14 * s, py - 14 * s, pw + 28 * s, ph + 28 * s);

  const drawCornerKalka = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(0, 20 * s);
    ctx.bezierCurveTo(-22 * s, 16 * s, -28 * s, -10 * s, -14 * s, -28 * s);
    ctx.bezierCurveTo(-4 * s, -40 * s, 10 * s, -40 * s, 20 * s, -28 * s);
    ctx.bezierCurveTo(32 * s, -14 * s, 18 * s, 10 * s, 0, 20 * s);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20 * s, -28 * s);
    ctx.quadraticCurveTo(30 * s, -42 * s, 22 * s, -48 * s);
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(45, s * 70);
  drawCornerKalka(margin, margin, Math.PI / 4);
  drawCornerKalka(w - margin, margin, -Math.PI / 4);
  drawCornerKalka(margin, h - margin, (3 * Math.PI) / 4);
  drawCornerKalka(w - margin, h - margin, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'BANARASI SILK ORNATE FLORAL JAAL');
}

/**
 * Kanchipuram Sari: Heavy temple stepped triangle 'Korvai' border
 */
export function drawSariKanchipuramFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2.5, s * 3.5);
  ctx.strokeRect(px - 14 * s, py - 14 * s, pw + 28 * s, ph + 28 * s);

  const tH = Math.max(12, s * 18);
  const tW = Math.max(14, s * 22);

  ctx.fillStyle = colors.accent;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, s * 1.5);

  for (let x = px; x < px + pw; x += tW) {
    ctx.beginPath();
    ctx.moveTo(x, py); ctx.lineTo(x + tW / 2, py - tH); ctx.lineTo(x + tW, py);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  for (let x = px; x < px + pw; x += tW) {
    ctx.beginPath();
    ctx.moveTo(x, py + ph); ctx.lineTo(x + tW / 2, py + ph + tH); ctx.lineTo(x + tW, py + ph);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  drawBottomPlaque(c, caption || 'KANCHIPURAM PURE SILK TEMPLE KORVAI');
}

// ============================================================================
// 7. ABSTRACT PATTERNS (5 TYPES CHOSEN)
// ============================================================================

/**
 * Abstract 1: Memphis 80s geometric squiggles, triangles & confetti pills
 */
export function drawAbstractMemphisFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px, py, pw, ph);

  const drawSquiggle = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(2.5, s * 3.5);
    ctx.beginPath();
    ctx.moveTo(-20 * s, 0);
    ctx.bezierCurveTo(-10 * s, -14 * s, -10 * s, 14 * s, 0, 0);
    ctx.bezierCurveTo(10 * s, -14 * s, 10 * s, 14 * s, 20 * s, 0);
    ctx.stroke();
    ctx.restore();
  };

  const drawConfettiTriangle = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -10 * s); ctx.lineTo(9 * s, 8 * s); ctx.lineTo(-9 * s, 8 * s);
    ctx.closePath();
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();
    ctx.restore();
  };

  const m = Math.max(25, s * 45);
  drawSquiggle(m, m);
  drawSquiggle(w - m, m);
  drawSquiggle(m, h - m);
  drawSquiggle(w - m, h - m);

  drawConfettiTriangle(w / 2, m * 0.7, 0.4);
  drawConfettiTriangle(w / 2, h - m * 0.7, -0.4);

  drawBottomPlaque(c, caption || 'MEMPHIS POSTMODERN GEOMETRIC CANVAS');
}

/**
 * Abstract 2: Bauhaus modernist diagonal constructivist stripes
 */
export function drawAbstractBauhausFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(4, s * 6);
  ctx.strokeRect(px, py, pw, ph);

  const wedge = Math.max(30, s * 55);
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(wedge * 2, 0); ctx.lineTo(0, wedge * 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(w, h); ctx.lineTo(w - wedge * 2, h); ctx.lineTo(w, h - wedge * 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(w - wedge, wedge, wedge * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = colors.accentLight;
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 2.5);
  ctx.stroke();

  drawBottomPlaque(c, caption || 'BAUHAUS MODERNIST CONSTRUCTIVISM');
}

/**
 * Abstract 3: Fluid ripple waves & organic topographic contours
 */
export function drawAbstractRippleFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px, py, pw, ph);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.2, s * 1.6);

  const numWaves = 4;
  for (let i = 1; i <= numWaves; i++) {
    const margin = i * 6 * s;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.bezierCurveTo(w * 0.25, margin + 8 * s, w * 0.75, margin - 8 * s, w - margin, margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin, h - margin);
    ctx.bezierCurveTo(w * 0.25, h - margin - 8 * s, w * 0.75, h - margin + 8 * s, w - margin, h - margin);
    ctx.stroke();
  }

  drawBottomPlaque(c, caption || 'FLUID TOPOGRAPHIC RIPPLE WAVES');
}

/**
 * Abstract 4: Kinetic gradient halftone dot raster border
 */
export function drawAbstractHalftoneFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px, py, pw, ph);

  const rows = 3;
  const step = Math.max(14, s * 22);

  for (let r = 0; r < rows; r++) {
    const radius = Math.max(1, (r + 1) * s * 2.2);
    const offset = (rows - r) * 7 * s;
    ctx.fillStyle = colors.accent;

    for (let x = px; x <= px + pw; x += step) {
      ctx.beginPath(); ctx.arc(x, py - offset, radius, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, py + ph + offset, radius, 0, Math.PI * 2); ctx.fill();
    }
    for (let y = py; y <= py + ph; y += step) {
      ctx.beginPath(); ctx.arc(px - offset, y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + pw + offset, y, radius, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawBottomPlaque(c, caption || 'KINETIC HALFTONE DOT MATRIX BORDER');
}

/**
 * Abstract 5: Cyberpunk glitch bars & terminal data scanlines
 */
export function drawAbstractCyberglitchFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px, py, pw, ph);

  ctx.fillStyle = colors.primary;
  ctx.fillRect(px + 40 * s, py - 4 * s, 60 * s, 8 * s);
  ctx.fillRect(px + pw - 100 * s, py + ph - 4 * s, 70 * s, 8 * s);
  ctx.fillRect(px - 4 * s, py + 80 * s, 8 * s, 50 * s);

  ctx.font = `bold ${Math.round(Math.max(8, s * 10))}px monospace`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'left';
  ctx.fillText('SYS_OK // SECTOR_07', px + 10 * s, py - 8 * s);
  ctx.textAlign = 'right';
  ctx.fillText('HEX_VEC: 0x98A4', px + pw - 10 * s, py + ph + 16 * s);

  drawBottomPlaque(c, caption || 'CYBERPUNK DATA GLITCH SPECIMEN');
}

// ============================================================================
// 8. INDIAN FESTIVAL PATTERNS
// ============================================================================

/**
 * Festival: Diwali (Deepavali) glowing earthen Diyas & rice rangoli
 */
export function drawFestDiwaliFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawDiyaLamp = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.arc(0, 0, 14 * s, 0, Math.PI);
    ctx.lineTo(-14 * s, 0);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-8 * s, -8 * s, -4 * s, -18 * s, 0, -24 * s);
    ctx.bezierCurveTo(4 * s, -18 * s, 8 * s, -8 * s, 0, 0);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -6 * s, 2 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(30, s * 45);
  const step = Math.max(45, s * 70);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawDiyaLamp(x, margin * 0.65, 0);
    drawDiyaLamp(x, h - margin * 0.65, Math.PI);
  }

  drawBottomPlaque(c, caption || 'DIWALI FESTIVAL OF LIGHTS (DEEPAVALI)');
}

/**
 * Festival: Holi organic pigment powder splashes & gulal stencils
 */
export function drawFestHoliFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px, py, pw, ph);

  const drawGulalSplash = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = colors.accent;

    const dots = [
      [0, 0, 8], [-12, -8, 4], [10, -12, 3], [14, 8, 4], [-8, 12, 5],
      [22, -6, 2], [-20, -18, 3], [16, 20, 2], [-14, 22, 2.5]
    ];
    dots.forEach(([dx, dy, dr]) => {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, dr * s, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const margin = Math.max(35, s * 60);
  drawGulalSplash(margin, margin);
  drawGulalSplash(w - margin, margin);
  drawGulalSplash(margin, h - margin);
  drawGulalSplash(w - margin, h - margin);

  drawBottomPlaque(c, caption || 'HOLI FESTIVAL OF COLORS (GULAL SPLASH)');
}

/**
 * Festival: Navratri Garba crossed Dandiya sticks & mirror-work borders
 */
export function drawFestNavratriFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawCrossedDandiya = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineWidth = Math.max(2, s * 3);
    ctx.strokeStyle = colors.accent;

    ctx.beginPath();
    ctx.moveTo(-18 * s, -18 * s); ctx.lineTo(18 * s, 18 * s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(18 * s, -18 * s); ctx.lineTo(-18 * s, 18 * s);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, s);
    ctx.stroke();

    ctx.restore();
  };

  const dOffset = Math.max(35, s * 55);
  drawCrossedDandiya(dOffset, dOffset);
  drawCrossedDandiya(w - dOffset, dOffset);
  drawCrossedDandiya(dOffset, h - dOffset);
  drawCrossedDandiya(w - dOffset, h - dOffset);

  drawBottomPlaque(c, caption || 'NAVRATRI GARBA & DANDIYA FESTIVAL');
}

/**
 * Festival: Durga Puja sacred Shankha conch & traditional Bengali Alpana
 */
export function drawFestDurgaPujaFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawShankhaConch = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(-16 * s, 12 * s);
    ctx.bezierCurveTo(-22 * s, -4 * s, -10 * s, -24 * s, 6 * s, -24 * s);
    ctx.bezierCurveTo(18 * s, -24 * s, 24 * s, -10 * s, 18 * s, 12 * s);
    ctx.quadraticCurveTo(0, 20 * s, -16 * s, 12 * s);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(6 * s, -14 * s, 5 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const m = Math.max(40, s * 65);
  drawShankhaConch(m, m, Math.PI / 4);
  drawShankhaConch(w - m, m, -Math.PI / 4);
  drawShankhaConch(m, h - m, (3 * Math.PI) / 4);
  drawShankhaConch(w - m, h - m, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'DURGA PUJA SHANKHA & BENGALI ALPANA');
}

// ============================================================================
// 9. INDIAN TEMPLE AESTHETICS (ALL TYPES)
// ============================================================================

/**
 * Temple: Nagara Shikhara (North Indian curvilinear spire relief)
 */
export function drawTempleNagaraFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawNagaraSpire = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(-16 * s, 16 * s);
    ctx.quadraticCurveTo(-14 * s, -12 * s, 0, -32 * s);
    ctx.quadraticCurveTo(14 * s, -12 * s, 16 * s, 16 * s);
    ctx.closePath();
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -34 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -38 * s, 2 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(30, s * 50);
  const step = Math.max(50, s * 80);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawNagaraSpire(x, margin * 0.65, 0);
    drawNagaraSpire(x, h - margin * 0.65, Math.PI);
  }

  drawBottomPlaque(c, caption || 'NORTH INDIAN NAGARA SHIKHARA ARCHITECTURE');
}

/**
 * Temple: Dravidian Gopuram (South Indian multi-tiered stepped pyramid shrine)
 */
export function drawTempleDravidianFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawGopuram = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    const tiers = 5;
    for (let t = 0; t < tiers; t++) {
      const tw = (24 - t * 4) * s;
      const th = 6 * s;
      const ty = (14 - t * 7) * s;
      ctx.fillStyle = t % 2 === 0 ? colors.accent : colors.accentLight;
      ctx.fillRect(-tw, ty, tw * 2, th);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = Math.max(1, s);
      ctx.strokeRect(-tw, ty, tw * 2, th);
    }

    ctx.fillStyle = colors.primary;
    ctx.beginPath(); ctx.arc(-4 * s, -24 * s, 1.8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -24 * s, 2.2 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * s, -24 * s, 1.8 * s, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(35, s * 55);
  drawGopuram(margin, margin, Math.PI / 4);
  drawGopuram(w - margin, margin, -Math.PI / 4);
  drawGopuram(margin, h - margin, (3 * Math.PI) / 4);
  drawGopuram(w - margin, h - margin, -(3 * Math.PI) / 4);

  drawBottomPlaque(c, caption || 'SOUTH INDIAN DRAVIDIAN GOPURAM PYRAMID');
}

/**
 * Temple: Khajuraho Stone Lattice Jali (Pierced geometric stone screen work)
 */
export function drawTempleKhajurahoFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const bW = Math.max(14, s * 22);
  const step = Math.max(12, s * 18);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1, s * 1.5);

  for (let x = px - bW; x < pw + px + bW; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, py - bW); ctx.lineTo(x + bW, py);
    ctx.moveTo(x + bW, py - bW); ctx.lineTo(x, py);
    ctx.stroke();
  }

  drawBottomPlaque(c, caption || 'KHAJURAHO STONE LATTICE JALI RELIEF');
}

/**
 * Temple: Konark Sun Temple 24-spoke chariot wheel & stone relief medallions
 */
export function drawTempleKonarkFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawKonarkChariotWheel = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.max(30, s * 50);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(2, s * 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = colors.accentLight;
    ctx.lineWidth = Math.max(1, s * 1.5);
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      ctx.beginPath();
      ctx.moveTo(r * 0.3 * Math.cos(a), r * 0.3 * Math.sin(a));
      ctx.lineTo(r * 0.85 * Math.cos(a), r * 0.85 * Math.sin(a));
      ctx.stroke();
    }

    ctx.restore();
  };

  const margin = Math.max(40, s * 65);
  drawKonarkChariotWheel(margin, margin);
  drawKonarkChariotWheel(w - margin, margin);
  drawKonarkChariotWheel(margin, h - margin);
  drawKonarkChariotWheel(w - margin, h - margin);

  drawBottomPlaque(c, caption || 'KONARK SUN TEMPLE 24-SPOKE CHARIOT WHEEL');
}

// ============================================================================
// 10. HALLOWEEN PATTERNS
// ============================================================================

/**
 * Halloween: Jack-o'-lantern carved pumpkin & curling vine tentacles
 */
export function drawHalloweenPumpkinFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2.5, s * 3.5);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawJackOLantern = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 8 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colors.primary;
    ctx.fillRect(-2 * s, -18 * s, 4 * s, 5 * s);

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-6 * s, -4 * s); ctx.lineTo(-2 * s, -8 * s); ctx.lineTo(-2 * s, -4 * s); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6 * s, -4 * s); ctx.lineTo(2 * s, -8 * s); ctx.lineTo(2 * s, -4 * s); ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10 * s, 4 * s);
    ctx.lineTo(-6 * s, 7 * s); ctx.lineTo(-2 * s, 4 * s); ctx.lineTo(2 * s, 7 * s);
    ctx.lineTo(6 * s, 4 * s); ctx.lineTo(10 * s, 7 * s); ctx.lineTo(0, 9 * s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const margin = Math.max(35, s * 55);
  drawJackOLantern(margin, margin);
  drawJackOLantern(w - margin, margin);
  drawJackOLantern(margin, h - margin);
  drawJackOLantern(w - margin, h - margin);

  drawBottomPlaque(c, caption || 'HALLOWEEN CARVED JACK-O-LANTERN SPECIMEN');
}

/**
 * Halloween: Gothic spiderweb lace, corner spiders & swooping bats
 */
export function drawHalloweenGothicFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2, s * 3);
  ctx.strokeRect(px, py, pw, ph);

  const drawSpiderwebCorner = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);

    const r = Math.max(45, s * 80);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1, s * 1.5);

    const spokes = 5;
    for (let i = 0; i <= spokes; i++) {
      const a = (i * Math.PI) / (2 * spokes);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      ctx.stroke();
    }

    const rings = 4;
    for (let j = 1; j <= rings; j++) {
      const cr = (r * j) / rings;
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const a = (i * Math.PI) / (2 * spokes);
        const x = cr * Math.cos(a);
        const y = cr * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.quadraticCurveTo(cr * 0.95 * Math.cos(a - 0.15), cr * 0.95 * Math.sin(a - 0.15), x, y);
      }
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(r * 0.4, r * 0.4, 3 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    ctx.restore();
  };

  drawSpiderwebCorner(0, 0, 1, 1);
  drawSpiderwebCorner(w, 0, -1, 1);
  drawSpiderwebCorner(0, h, 1, -1);
  drawSpiderwebCorner(w, h, -1, -1);

  drawBottomPlaque(c, caption || 'GOTHIC COBWEB & NOCTURNAL FILIGREE');
}

// ============================================================================
// 11. CHINESE PATTERNS
// ============================================================================

/**
 * Chinese: Endless Mystic Knot (Pan Chang) & thunder meander
 */
export function drawChineseEndlessKnotFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const drawMysticKnot = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    const r = Math.max(16, s * 26);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(2, s * 3);

    ctx.strokeRect(-r, -r, r, r);
    ctx.strokeRect(0, -r, r, r);
    ctx.strokeRect(-r, 0, r, r);
    ctx.strokeRect(0, 0, r, r);

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary;
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(35, s * 55);
  drawMysticKnot(margin, margin);
  drawMysticKnot(w - margin, margin);
  drawMysticKnot(margin, h - margin);
  drawMysticKnot(w - margin, h - margin);

  drawBottomPlaque(c, caption || 'TRADITIONAL CHINESE MYSTIC ENDLESS KNOT');
}

/**
 * Chinese: Imperial Dragon Clouds & auspicious fretwork
 */
export function drawChineseDragonCloudFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2.5, s * 3.5);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawDragonCloud = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.fillStyle = colors.accentLight;

    ctx.beginPath();
    ctx.arc(-8 * s, 0, 7 * s, 0, Math.PI * 2);
    ctx.arc(4 * s, -6 * s, 9 * s, 0, Math.PI * 2);
    ctx.arc(14 * s, 2 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(4 * s, 8 * s, 6 * s, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  };

  const margin = Math.max(30, s * 50);
  const step = Math.max(50, s * 80);

  for (let x = margin + step / 2; x < w - margin; x += step) {
    drawDragonCloud(x, margin * 0.65);
    drawDragonCloud(x, h - margin * 0.65);
  }

  drawBottomPlaque(c, caption || 'IMPERIAL MING AUSPICIOUS CLOUDS (XIANGYUN)');
}

// ============================================================================
// 12. CARTOON PATTERNS
// ============================================================================

/**
 * Cartoon: Comic Book Halftone Explosion & Action Burst
 */
export function drawCartoonComicBurstFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(4, s * 6);
  ctx.strokeRect(px, py, pw, ph);

  const drawActionBurst = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    const points = 12;
    const rOuter = Math.max(30, s * 50);
    const rInner = rOuter * 0.5;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = (i * Math.PI) / points;
      const r = i % 2 === 0 ? rOuter : rInner;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(2, s * 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  };

  const m = Math.max(35, s * 55);
  drawActionBurst(m, m);
  drawActionBurst(w - m, m);
  drawActionBurst(m, h - m);
  drawActionBurst(w - m, h - m);

  drawBottomPlaque(c, caption || 'COMIC BOOK ACTION BURST & HALFTONE PANEL');
}

/**
 * Cartoon: Pop-Art Doodle eyes, lightning bolts, smileys & stars
 */
export function drawCartoonPopDoodleFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - 10 * s, py - 10 * s, pw + 20 * s, ph + 20 * s);

  const drawPopLightning = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(2 * s, -14 * s);
    ctx.lineTo(-6 * s, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(-2 * s, 14 * s);
    ctx.lineTo(6 * s, -2 * s);
    ctx.lineTo(0, -2 * s);
    ctx.closePath();
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawPopStar = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    const r = 10 * s;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const curR = i % 2 === 0 ? r : r * 0.45;
      const x = curR * Math.cos(a);
      const y = curR * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = colors.accentLight;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();
    ctx.restore();
  };

  const m = Math.max(30, s * 50);
  drawPopLightning(m, m);
  drawPopStar(w - m, m);
  drawPopStar(m, h - m);
  drawPopLightning(w - m, h - m);

  drawBottomPlaque(c, caption || 'POP ART DOODLE STARS & LIGHTNING');
}

// ============================================================================
// 13. STREET MARKET IN INDIA
// ============================================================================

/**
 * Street Market: Indian Bazaar canopy striped fabric awnings & hanging lanterns
 */
export function drawStreetBazaarFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(2.5, s * 3.5);
  ctx.strokeRect(px - 12 * s, py - 12 * s, pw + 24 * s, ph + 24 * s);

  const aW = Math.max(16, s * 24);
  for (let x = px; x < px + pw; x += aW) {
    ctx.beginPath();
    ctx.arc(x + aW / 2, py - 4 * s, aW / 2, 0, Math.PI);
    ctx.fillStyle = (Math.round(x / aW) % 2 === 0) ? colors.accent : colors.accentLight;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.2, s * 1.5);
    ctx.stroke();
  }

  const drawBazaarLantern = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(0, -16 * s);
    ctx.lineTo(8 * s, -6 * s);
    ctx.lineTo(5 * s, 10 * s);
    ctx.lineTo(0, 14 * s);
    ctx.lineTo(-5 * s, 10 * s);
    ctx.lineTo(-8 * s, -6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    ctx.restore();
  };

  const bOffset = Math.max(35, s * 55);
  drawBazaarLantern(bOffset, bOffset);
  drawBazaarLantern(w - bOffset, bOffset);
  drawBazaarLantern(bOffset, h - bOffset);
  drawBazaarLantern(w - bOffset, h - bOffset);

  drawBottomPlaque(c, caption || 'INDIAN CHANDNI CHOWK BAZAAR CANOPY');
}

/**
 * Street Market: Iconic Indian Truck Art ('Horn OK Please') floral scroll & reflectors
 */
export function drawStreetTruckArtFrame(c: FrameDrawContext) {
  const { ctx, w, h, px, py, pw, ph, colors, caption } = c;
  const s = w / 1500;

  const bW = Math.max(14, s * 22);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(3, s * 4);
  ctx.strokeRect(px - bW, py - bW, pw + bW * 2, ph + bW * 2);

  ctx.fillStyle = colors.accent;
  const step = Math.max(20, s * 30);
  for (let x = px; x < px + pw; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, py - bW);
    ctx.lineTo(x + step * 0.5, py - bW * 0.5);
    ctx.lineTo(x, py);
    ctx.lineTo(x + step * 0.5, py);
    ctx.lineTo(x + step, py - bW * 0.5);
    ctx.lineTo(x + step * 0.5, py - bW);
    ctx.closePath();
    ctx.fill();
  }

  const drawTruckWing = (cx: number, cy: number, flipX: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, 1);

    ctx.fillStyle = colors.accentLight;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(25 * s, -10 * s, 35 * s, -28 * s);
    ctx.quadraticCurveTo(18 * s, -14 * s, 0, 0);
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1.5, s * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 6 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const tOffset = Math.max(30, s * 45);
  drawTruckWing(tOffset, tOffset, 1);
  drawTruckWing(w - tOffset, tOffset, -1);
  drawTruckWing(tOffset, h - tOffset, 1);
  drawTruckWing(w - tOffset, h - tOffset, -1);

  drawBottomPlaque(c, caption || 'HORN OK PLEASE // INDIAN TRUCK ART POP');
}

// ============================================================================
// UNIVERSAL HELPER: BOTTOM PLAQUE
// ============================================================================

function drawBottomPlaque(c: FrameDrawContext, text: string) {
  const { ctx, w, h, colors, dpi, lpi, screenAngle } = c;
  const s = w / 1500;

  const plaqueW = Math.min(w * 0.8, Math.max(260, s * 380));
  const plaqueH = Math.max(28, s * 42);
  const plaqueX = (w - plaqueW) / 2;
  const plaqueY = h - plaqueH - Math.max(8, s * 14);

  ctx.fillStyle = colors.background;
  ctx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = Math.max(1.5, s * 2);
  ctx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, s);
  ctx.strokeRect(plaqueX + 2, plaqueY + 2, plaqueW - 4, plaqueH - 4);

  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(Math.max(9, s * 12))}px Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), w / 2, plaqueY + plaqueH * 0.4);

  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${Math.round(Math.max(7, s * 8.5))}px Courier, monospace`;
  ctx.fillText(`CALIBRATED: ${dpi} DPI · ${lpi} LPI @ ${screenAngle}° AM HALFTONE`, w / 2, plaqueY + plaqueH * 0.75);
}
