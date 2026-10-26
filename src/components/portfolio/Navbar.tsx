'use client';

import React from 'react';
import Link from 'next/link';
import { Printer, Barcode as BarcodeIcon } from 'lucide-react';

interface NavbarProps {
  onOpenContact?: () => void;
  onOpenQRArtifact?: () => void;
  onOpenSocialCards?: () => void;
}

export function Navbar({ onOpenContact, onOpenSocialCards }: NavbarProps) {
  return (
    <header className="relative z-10 w-full bg-[#f5f5f0] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Square Framed Brand Mark Box */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center px-3 h-10 sm:h-12 border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all font-mono font-black text-base sm:text-lg tracking-tighter"
          >
            NEDJECT
          </Link>
          <div className="hidden sm:block">
            <div className="font-mono text-xs font-black tracking-widest text-black flex items-center gap-1.5">
              <span>GENQR_STUDIO</span>
              <span className="w-1.5 h-1.5 bg-[#ccff00] border border-black inline-block" />
            </div>
            <div className="font-mono text-[10px] text-zinc-600 tracking-wider">
              DEVELOPED BY NEERAJREKWAR
            </div>
          </div>
        </div>

        {/* Center: Unique Quick Action & Tool Utility Triggers */}
        <nav className="hidden lg:flex items-center gap-1 border-2 border-black bg-white p-1 shadow-[4px_4px_0px_#000000]">
          {onOpenSocialCards && (
            <button
              onClick={onOpenSocialCards}
              className="px-3 py-1.5 font-mono text-xs font-black tracking-wider text-black hover:bg-black hover:text-[#ccff00] transition-colors flex items-center gap-1 border-l-2 border-black cursor-pointer bg-white"
              title="Preview all page Twitter & OpenGraph Cards"
            >
              <span className="text-amber-500">★</span>
              <span>OG CARDS (1200×630)</span>
            </button>
          )}
          <Link
            href="/mochup"
            className="px-3 py-1.5 font-mono text-xs font-black tracking-wider text-black hover:bg-black hover:text-[#ccff00] transition-colors flex items-center gap-1 border-l-2 border-black"
          >
            <span>MOCKUPS</span>
          </Link>
          <Link
            href="/normal-dpi-photo"
            className="px-3 py-1.5 font-mono text-xs font-black tracking-wider text-black hover:bg-black hover:text-[#ccff00] transition-colors flex items-center gap-1 border-l-2 border-black"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PHOTO DPI</span>
          </Link>
          <Link
            href="/barcode-pick"
            className="px-3 py-1.5 font-mono text-xs font-black tracking-wider text-black hover:bg-black hover:text-[#ccff00] transition-colors flex items-center gap-1 border-l-2 border-black"
          >
            <BarcodeIcon className="w-3.5 h-3.5" />
            <span>BARCODES</span>
          </Link>
        </nav>

        {/* Right: System Status Capsule Widget */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_#000000]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 bg-[#16a34a] border border-black" />
            </span>
            <span className="font-mono text-[11px] font-black tracking-widest text-black">
              SYS_OK // 300_DPI_READY
            </span>
          </div>
        </div>

        {/* Mobile Quick Action Buttons (No duplicate nav list) */}
        <div className="flex lg:hidden items-center gap-2">
          {onOpenSocialCards && (
            <button
              onClick={onOpenSocialCards}
              className="px-2 py-1.5 border-2 border-black bg-white font-mono text-xs font-black text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              OG CARDS
            </button>
          )}
        </div>
      </div>

    </header>
  );
}
