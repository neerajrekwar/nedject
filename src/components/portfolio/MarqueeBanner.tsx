'use client';

import React from 'react';

const TECH_ITEMS = [
  '300 DPI PHOTO QR',
  'ISO/IEC 18004 STANDARD',
  'PHYSICAL pHYs INJECTION',
  '21:1 HIGH-CONTRAST B/W',
  'REED-SOLOMON LEVEL H',
  'VECTOR SVG EXPORT',
  'BARCODE PICK (CODE128/UPC/EAN)',
  'FLOYD-STEINBERG 1-BIT DITHER',
  'QR CRUSH FORENSICS',
  'FITNESS GLASS DUAL-MODE',
  'WINTER ARC 90-DAY PROTOCOL',
  'NEDJECT // GENQR_STUDIO',
];

export function MarqueeBanner() {
  return (
    <div className="w-full bg-[#ccff00] border-y-2 border-black overflow-hidden py-3 select-none">
      <div className="animate-marquee flex items-center">
        {/* Repeated twice to ensure continuous smooth loop */}
        {[...TECH_ITEMS, ...TECH_ITEMS, ...TECH_ITEMS].map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center shrink-0">
            <span className="font-mono text-sm sm:text-base font-black tracking-widest text-black px-4 whitespace-nowrap">
              {item}
            </span>
            <span className="w-2.5 h-2.5 bg-black rotate-45 transform shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
