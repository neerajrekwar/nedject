'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle,
  X,
  Sparkles,
  LogIn,
  Check,
  ArrowRight,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { setLocalUsageCount } from '@/lib/usage-limits';

interface QuotaLimitModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const QuotaLimitModal: React.FC<QuotaLimitModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { data: session } = useSession();
  const [internalOpen, setInternalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [triggerTool, setTriggerTool] = useState<string>('Generator');

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    // Listen for global limit exhaustion events
    const handleLimitExhausted = (e: any) => {
      if (e.detail?.toolKey) {
        setTriggerTool(e.detail.toolKey.replace('_', ' ').toUpperCase());
      }
      setInternalOpen(true);
    };

    window.addEventListener('Nedject_limit_exhausted', handleLimitExhausted);
    return () => window.removeEventListener('Nedject_limit_exhausted', handleLimitExhausted);
  }, []);

  const isGuest = !session?.user;

  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg border-4 border-black bg-white shadow-[10px_10px_0px_#000000] p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-600 border border-black inline-block animate-pulse" />
              <h2 className="text-base sm:text-lg font-black uppercase text-black">
                GENERATION QUOTA REACHED
              </h2>
            </div>
            <p className="text-xs font-bold text-zinc-700">
              {isGuest
                ? `You've used all 2 guest generations on ${triggerTool}. Sign in for 10 free generations or upgrade to Pro for unlimited access!`
                : `You've used all 10 free generations on ${triggerTool}. Upgrade to Pro Studio to unlock unlimited 300 & 600 DPI generations.`}
            </p>
          </div>

          {/* Guest Sign-in Promo (if guest) */}
          {isGuest && (
            <div className="border-2 border-black bg-[#fffde6] p-3.5 space-y-2">
              <div className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>OPTION 1: SIGN IN (FREE 10 LIMITS)</span>
              </div>
              <p className="text-[11px] text-zinc-700 font-bold">
                Connect your Google or Email account instantly to unlock 10 daily limits.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setShowAuthModal(true);
                }}
                className="w-full py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>→] SIGN IN TO UNLOCK 10 LIMITS</span>
              </button>
            </div>
          )}

          {/* Pro Upgrade Option */}
          <div className="border-2 border-black bg-[#f0fde8] p-4 space-y-3">
            <div className="flex justify-between items-center font-black">
              <span className="uppercase text-black flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{isGuest ? 'OPTION 2: UPGRADE TO PRO' : 'UPGRADE TO PRO STUDIO'}</span>
              </span>
              <span className="text-xs bg-black text-[#ccff00] px-2 py-0.5 font-black">
                UNLIMITED
              </span>
            </div>

            <ul className="text-[11px] text-zinc-800 space-y-1 font-bold">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-700" />
                <span>Unlimited 300 &amp; 600 DPI vector exports</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-700" />
                <span>Batch ZIP Matrix &amp; All 8 Barcode formats</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-700" />
                <span>Instant activation (UPI, Cards, NetBanking)</span>
              </li>
            </ul>

            <Link
              href="/payment"
              onClick={handleClose}
              className="w-full py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>UPGRADE TO PRO STUDIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Embedded Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setLocalUsageCount(0);
          handleClose();
        }}
      />
    </>
  );
};
