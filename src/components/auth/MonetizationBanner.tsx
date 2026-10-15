'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  X,
} from 'lucide-react';

interface MonetizationBannerProps {
  monetizationMode?: 1 | 0; // Kept for backwards prop compatibility, always renders Plans
  onOpenUpgrade?: () => void;
  onClose?: () => void;
  className?: string;
}

export const MonetizationBanner: React.FC<MonetizationBannerProps> = ({
  onClose,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFullyHidden, setIsFullyHidden] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('nedject_pro_banner_dismissed') === 'true';
      if (dismissed) {
        setIsDismissed(true);
      }
    } catch (e) {
      // sessionStorage not available or disabled in sandbox
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('nedject_pro_banner_dismissed', 'true');
    } catch (e) {}
    onClose?.();
  };

  const handleRestore = () => {
    setIsDismissed(false);
    setIsFullyHidden(false);
    try {
      sessionStorage.removeItem('nedject_pro_banner_dismissed');
    } catch (e) {}
  };

  if (isFullyHidden) {
    return null;
  }

  if (isDismissed) {
    return (
      <div
        className={`border-2 border-dashed border-black/40 bg-[#fbfbf8] p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#00000020] transition-all ${className}`}
      >
        <div className="flex items-center gap-2 text-zinc-600 font-bold text-[11px] uppercase">
          <span className="w-2.5 h-2.5 bg-zinc-400 border border-black inline-block shrink-0" />
          <span>NEDJECT PRO MEMBERSHIP BOX TEMPORARILY REMOVED</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleRestore}
            title="Restore Pro Membership box"
            className="border border-black bg-[#ccff00] text-black px-2.5 py-1 font-black text-[10px] uppercase shadow-[1px_1px_0px_#000000] hover:bg-black hover:text-[#ccff00] transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>RESTORE BOX</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullyHidden(true)}
            title="Hide notice completely"
            aria-label="Hide notice completely"
            className="border border-black bg-white hover:bg-zinc-200 text-zinc-700 p-1 text-[10px] shadow-[1px_1px_0px_#000000] cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-4 border-black bg-[#fafaf5] p-5 sm:p-6 shadow-[6px_6px_0px_#000000] font-mono space-y-4 ${className}`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 bg-[#ccff00] text-black font-black text-xs flex items-center justify-center border-2 border-black shadow-[1px_1px_0px_#000000] shrink-0">
            ★
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">
              NEDJECT PRO MEMBERSHIP // OPTICAL TIERS
            </h3>
            <p className="text-[11px] text-zinc-600 font-bold uppercase mt-0.5">
              UNLIMITED 300/600 DPI VECTOR EXPORTS • PRO SUBSCRIPTION
            </p>
          </div>
        </div>

        {/* Top-Right Corner Actions: Unlimited Access Badge + Remove / Cancel Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="hidden md:inline-block text-[10px] bg-black text-[#ccff00] px-2.5 py-1 font-black uppercase border border-black shadow-[1px_1px_0px_#000000]">
            UNLIMITED ACCESS
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            title="Temporarily remove this box"
            aria-label="Cancel or remove Pro Membership box"
            className="border-2 border-black bg-white hover:bg-rose-50 hover:border-rose-600 hover:text-rose-600 active:translate-x-0.5 active:translate-y-0.5 text-black px-2.5 py-1 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>REMOVE</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Plan 1: Free Base Tier */}
        <div className="border-2 border-black bg-white p-4 space-y-3 flex flex-col justify-between shadow-[2px_2px_0px_#000000]">
          <div className="space-y-2">
            <div className="flex justify-between items-center font-black border-b border-black/20 pb-1.5">
              <span className="uppercase text-black">FREE BASE TIER</span>
              <span className="text-sm font-black">₹0 / $0</span>
            </div>
            <ul className="space-y-1.5 text-zinc-700 text-[11px] font-bold">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>2 guest / 10 authenticated generations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Standard 300 DPI PNG export</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Barcode Pick &amp; Normal DPI tools</span>
              </li>
            </ul>
          </div>
          <div className="pt-2 text-[10px] font-black text-zinc-500 uppercase border-t border-black/10">
            CURRENT DEFAULT STATUS
          </div>
        </div>

        {/* Plan 2: Pro Studio with Razorpay */}
        <div className="border-2 border-black bg-[#f0fde8] p-4 space-y-3 flex flex-col justify-between shadow-[3px_3px_0px_#000000]">
          <div className="space-y-2">
            <div className="flex justify-between items-center font-black border-b border-black/20 pb-1.5">
              <span className="uppercase text-black flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>PRO STUDIO</span>
              </span>
              <span className="text-sm text-emerald-950 font-black">₹499 / $9 mo</span>
            </div>
            <ul className="space-y-1.5 text-zinc-900 text-[11px] font-bold">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>UNLIMITED High-Resolution Generations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>600 DPI Vector PDF (Print Press Ready)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Event Matrix &amp; Batch ZIP Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Zero Watermarks + Full Commercial License</span>
              </li>
            </ul>
          </div>

          <Link
            href="/payment"
            className="w-full mt-2 py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all cursor-pointer shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>UPGRADE TO PRO NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
