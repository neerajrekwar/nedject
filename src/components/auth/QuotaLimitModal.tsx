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
  Lock,
  Zap,
  ShieldCheck,
  Film,
  Layers,
  FileText,
  Printer,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { setLocalUsageCount, getUsageStats } from '@/lib/usage-limits';
import { setClientRedirectDestination } from '@/lib/auth-redirect';
import { PlanTier } from '@/lib/plan-capabilities';

interface LockedFeatureDetails {
  featureKey: string;
  title: string;
  description: string;
  requiredPlan: 'pro' | 'enterprise';
  proPrice?: string;
  enterprisePrice?: string;
}

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
  const [triggerTool, setTriggerTool] = useState<string>('GENERATOR');
  const [modalMode, setModalMode] = useState<'quota_exhausted' | 'feature_locked'>('quota_exhausted');
  const [lockedDetails, setLockedDetails] = useState<LockedFeatureDetails | null>(null);

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    // 1. Listen for global limit exhaustion events
    const handleLimitExhausted = (e: any) => {
      setModalMode('quota_exhausted');
      setLockedDetails(null);
      if (e.detail?.toolKey) {
        setTriggerTool(e.detail.toolKey.replace(/_/g, ' ').toUpperCase());
      }
      setInternalOpen(true);
    };

    // 2. Listen for feature lock events (e.g. 600 DPI, 4K Poster, Batch ZIP, Vector PDF)
    const handleFeatureLocked = (e: any) => {
      setModalMode('feature_locked');
      if (e.detail) {
        setLockedDetails({
          featureKey: e.detail.featureKey || 'pro_feature',
          title: e.detail.title || 'Premium Studio Capability',
          description: e.detail.description || 'This feature requires an active Pro or Enterprise subscription tier.',
          requiredPlan: e.detail.requiredPlan || 'pro',
          proPrice: e.detail.proPrice || '$9/mo (₹499)',
          enterprisePrice: e.detail.enterprisePrice || '$29/mo (₹1,999)',
        });
      }
      setInternalOpen(true);
    };

    window.addEventListener('Nedject_limit_exhausted', handleLimitExhausted);
    window.addEventListener('Nedject_feature_locked', handleFeatureLocked);

    return () => {
      window.removeEventListener('Nedject_limit_exhausted', handleLimitExhausted);
      window.removeEventListener('Nedject_feature_locked', handleFeatureLocked);
    };
  }, []);

  const isGuest = !session?.user;
  const userPlan = (((session?.user as any)?.plan || (isGuest ? 'guest' : 'free')) as PlanTier);

  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-mono animate-in fade-in duration-150">
        <div className="relative w-full max-w-xl border-4 border-black bg-white shadow-[10px_10px_0px_#000000] p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          {modalMode === 'feature_locked' && lockedDetails ? (
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2">
                <span className="p-1 border border-black bg-[#ccff00] text-black inline-flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider bg-black text-[#ccff00] px-2 py-0.5">
                  {lockedDetails.requiredPlan === 'enterprise' ? 'ENTERPRISE TIER' : 'PRO STUDIO TIER'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase text-black leading-tight">
                {lockedDetails.title}
              </h2>
              <p className="text-xs font-bold text-zinc-700 leading-relaxed">
                {lockedDetails.description}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-600 border border-black inline-block animate-pulse" />
                <h2 className="text-base sm:text-lg font-black uppercase text-black">
                  GENERATION QUOTA REACHED
                </h2>
              </div>
              <p className="text-xs font-bold text-zinc-700 leading-relaxed">
                {isGuest
                  ? `You've used all 2 guest generations on ${triggerTool}. Sign in to get 10 free generations or upgrade to Pro for unlimited exports!`
                  : `You've reached your free plan allowance (10 generations) on ${triggerTool}. Upgrade to Pro Studio to unlock unlimited 300 & 600 DPI generations.`}
              </p>
            </div>
          )}

          {/* Guest Sign-in Option (Only for quota exhaustion when not logged in) */}
          {isGuest && modalMode === 'quota_exhausted' && (
            <div className="border-2 border-black bg-[#fffde6] p-3.5 space-y-2">
              <div className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>OPTION 1: SIGN IN (UNLOCK 10 FREE GENERATIONS)</span>
              </div>
              <p className="text-[11px] text-zinc-700 font-bold">
                Connect your Google or Email account instantly to claim 10 account generations.
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

          {/* Pricing Plan Cards Grid */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-zinc-500">
                RECOMMENDED SUBSCRIPTION TIERS
              </span>
              <span className="text-[10px] font-bold text-zinc-500">
                CURRENT TIER: <span className="text-black font-black uppercase underline">{userPlan}</span>
              </span>
            </div>

            {/* Pro Plan Card (Yellow Base) */}
            <div className={`border-2 border-black p-4 space-y-3 relative border-l-[6px] border-l-amber-500 ${
              lockedDetails?.requiredPlan === 'enterprise'
                ? 'bg-zinc-50'
                : 'bg-amber-50 shadow-[4px_4px_0px_#000000]'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                    <span className="font-black text-sm uppercase text-black">
                      NEDJECT PRO STUDIO
                    </span>
                    <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 font-black border border-black">
                      YELLOW BASE // MOST POPULAR
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 font-bold mt-0.5">
                    For creators, print operators &amp; designers · Unlimited quota
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-black">
                    $9 <span className="text-[10px] font-normal text-zinc-600">/ mo</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold">
                    or ₹499 / mo
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-800 font-bold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>Unlimited 300 &amp; 600 DPI Generations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>Insta-Clip 4K Reels &amp; 30s Video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>ISO Vector PDF &amp; SVG Halftone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>Batch ZIP Matrix (All 8 Barcodes)</span>
                </div>
              </div>

              <Link
                href="/pay-to-use?plan=pro"
                onClick={() => {
                  if (isGuest) {
                    setClientRedirectDestination('/pay-to-use?plan=pro');
                  }
                  handleClose();
                }}
                className="w-full py-2.5 border-2 border-black bg-amber-400 text-black hover:bg-black hover:text-amber-300 font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>UPGRADE TO PRO STUDIO (YELLOW BASE)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Enterprise Plan Card (Purple Base) */}
            <div className={`border-2 border-black p-4 space-y-3 relative border-l-[6px] border-l-purple-600 ${
              lockedDetails?.requiredPlan === 'enterprise'
                ? 'bg-purple-100 shadow-[4px_4px_0px_#000000]'
                : 'bg-purple-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-black text-sm uppercase text-purple-950">
                      NEDJECT ENTERPRISE PACK
                    </span>
                    <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 font-black border border-purple-700">
                      PURPLE BASE // UNLIMITED
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 font-bold mt-0.5">
                    Maximum throughput, 1200 DPI &amp; unlimited batch pipelines
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-black">
                    $29 <span className="text-[10px] font-normal text-zinc-600">/ mo</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold">
                    or ₹1,999 / mo
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-800 font-bold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-purple-700 shrink-0" />
                  <span>Everything in Pro Included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-purple-700 shrink-0" />
                  <span>1200 DPI Micro-Screening Output</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-purple-700 shrink-0" />
                  <span>60s+ Cinematic Reels &amp; 4K Renders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-purple-700 shrink-0" />
                  <span>Unlimited Batch Processing (1,000+ items)</span>
                </div>
              </div>

              <Link
                href="/pay-to-use?plan=enterprise"
                onClick={() => {
                  if (isGuest) {
                    setClientRedirectDestination('/pay-to-use?plan=enterprise');
                  }
                  handleClose();
                }}
                className="w-full py-2.5 border-2 border-black bg-purple-600 text-white hover:bg-black hover:text-purple-300 font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>UPGRADE TO ENTERPRISE PACK (PURPLE BASE)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Secure Trust Badges */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-200 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Instant Activation · Cancel Anytime</span>
            </span>
            <span>Razorpay · Cards · UPI · NetBanking</span>
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
