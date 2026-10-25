import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#09090b"/>
  <!-- Outer Frame -->
  <rect x="64" y="64" width="384" height="384" rx="32" fill="#18181b" stroke="#ccff00" stroke-width="8"/>
  
  <!-- Neo-Brutalist High-Contrast QR Motif -->
  <!-- Top Left Finder Pattern -->
  <rect x="100" y="100" width="104" height="104" rx="16" fill="#ccff00"/>
  <rect x="120" y="120" width="64" height="64" rx="8" fill="#09090b"/>
  <rect x="136" y="136" width="32" height="32" rx="4" fill="#ccff00"/>

  <!-- Top Right Finder Pattern -->
  <rect x="308" y="100" width="104" height="104" rx="16" fill="#ccff00"/>
  <rect x="328" y="120" width="64" height="64" rx="8" fill="#09090b"/>
  <rect x="344" y="136" width="32" height="32" rx="4" fill="#ccff00"/>

  <!-- Bottom Left Finder Pattern -->
  <rect x="100" y="308" width="104" height="104" rx="16" fill="#ccff00"/>
  <rect x="120" y="328" width="64" height="64" rx="8" fill="#09090b"/>
  <rect x="136" y="344" width="32" height="32" rx="4" fill="#ccff00"/>

  <!-- Central Data Elements & Cyber/Fitness Optics -->
  <rect x="232" y="100" width="48" height="48" rx="8" fill="#38bdf8"/>
  <rect x="232" y="176" width="48" height="48" rx="8" fill="#ccff00"/>
  <rect x="100" y="232" width="48" height="48" rx="8" fill="#ccff00"/>
  <rect x="176" y="232" width="160" height="48" rx="8" fill="#38bdf8"/>
  <circle cx="256" cy="256" r="16" fill="#09090b"/>
  <rect x="364" y="232" width="48" height="48" rx="8" fill="#ccff00"/>
  <rect x="232" y="308" width="48" height="104" rx="8" fill="#ccff00"/>
  <rect x="308" y="308" width="104" height="48" rx="8" fill="#38bdf8"/>
  <rect x="364" y="364" width="48" height="48" rx="8" fill="#ccff00"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// Helper function to render icon onto canvas
function renderIcon(ctx, size, isMaskable = false) {
  const padding = isMaskable ? size * 0.15 : 0;
  const drawSize = size - padding * 2;
  const scale = drawSize / 512;

  // Background
  ctx.fillStyle = '#09090b';
  if (isMaskable) {
    ctx.fillRect(0, 0, size, size);
  } else {
    const r = size * 0.18;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, [r]);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(padding, padding);
  ctx.scale(scale, scale);

  // Border frame
  ctx.fillStyle = '#18181b';
  ctx.strokeStyle = '#ccff00';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(64, 64, 384, 384, [32]);
  ctx.fill();
  ctx.stroke();

  // Draw finder pattern helper
  const drawFinder = (x, y) => {
    ctx.fillStyle = '#ccff00';
    ctx.beginPath();
    ctx.roundRect(x, y, 104, 104, [16]);
    ctx.fill();

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(x + 20, y + 20, 64, 64, [8]);
    ctx.fill();

    ctx.fillStyle = '#ccff00';
    ctx.beginPath();
    ctx.roundRect(x + 36, y + 36, 32, 32, [4]);
    ctx.fill();
  };

  drawFinder(100, 100);
  drawFinder(308, 100);
  drawFinder(100, 308);

  // Data blocks
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(232, 100, 48, 48, [8]);
  ctx.fill();

  ctx.fillStyle = '#ccff00';
  ctx.beginPath();
  ctx.roundRect(232, 176, 48, 48, [8]);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(100, 232, 48, 48, [8]);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(176, 232, 160, 48, [8]);
  ctx.fill();

  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(256, 256, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ccff00';
  ctx.beginPath();
  ctx.roundRect(364, 232, 48, 48, [8]);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(232, 308, 48, 104, [8]);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(308, 308, 104, 48, [8]);
  ctx.fill();

  ctx.fillStyle = '#ccff00';
  ctx.beginPath();
  ctx.roundRect(364, 364, 48, 48, [8]);
  ctx.fill();

  ctx.restore();
}

const sizes = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const item of sizes) {
  const canvas = createCanvas(item.size, item.size);
  const ctx = canvas.getContext('2d');
  renderIcon(ctx, item.size, item.maskable);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, item.file), buffer);
  console.log(`Generated ${item.file} (${item.size}x${item.size})`);
}

console.log('All PWA assets generated successfully in public/');
