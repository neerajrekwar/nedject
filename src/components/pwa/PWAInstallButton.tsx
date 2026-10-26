'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'banner' | 'pill';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // If already installed, hide the install UI
  if (isInstalled) {
    return null;
  }

  // Handle banner variant
  if (variant === 'banner') {
    if (dismissedBanner) return null;
    if (!isInstallable && !isIOS) return null;

    return (
      <aside
        aria-label="Install Nedject Progressive Web App"
        className={`border-4 border-black bg-[#ccff00] p-4 text-black shadow-[6px_6px_0px_#000000] font-mono ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-black text-[#ccff00] flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>INSTALL NEDJECT AS PWA APP</span>
                <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-bold">OFFLINE READY</span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-800">
                Install on your Home Screen or Desktop for instant 300 DPI QR generation without browser chrome.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {isInstallable && (
              <button
                onClick={install}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 border-2 border-black bg-black text-white px-3.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>INSTALL APP</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 border-2 border-black bg-black text-white px-3.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-800 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>INSTALL ON IOS</span>
              </button>
            )}

            <button
              onClick={() => setDismissedBanner(true)}
              aria-label="Dismiss PWA install banner"
              className="border-2 border-black bg-white p-1 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {showIOSModal && <IOSModal onClose={() => setShowIOSModal(false)} />}
      </aside>
    );
  }

  // Handle standard button / pill
  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          aria-label="Install Application"
          className={`inline-flex items-center gap-2 border-2 border-black bg-[#ccff00] text-black px-3 py-1.5 text-xs font-mono font-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>INSTALL PWA</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSModal(true)}
          aria-label="Install on iOS Safari"
          className={`inline-flex items-center gap-2 border-2 border-black bg-[#ccff00] text-black px-3 py-1.5 text-xs font-mono font-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${className}`}
        >
          <Share className="w-3.5 h-3.5" />
          <span>INSTALL ON IOS</span>
        </button>
      )}

      {showIOSModal && <IOSModal onClose={() => setShowIOSModal(false)} />}
    </>
  );
};

// Modal for iOS Safari Add to Home Screen Instructions
function IOSModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 font-mono animate-fade-in backdrop-blur-sm">
      <div className="relative w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] text-black space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-black" />
            <h3 className="text-sm font-black uppercase tracking-wider">Install on iPhone / iPad</h3>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-zinc-100 p-1 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-medium">
          <p className="text-zinc-700">
            Apple Safari doesn&apos;t support direct automatic installation prompts. Follow these 3 simple steps to add Nedject directly to your iOS Home Screen:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
              <div className="w-6 h-6 border border-black bg-[#ccff00] text-black font-black flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <span className="font-bold">Tap the Share Icon</span>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  At the bottom of your Safari screen, tap the <Share className="w-3.5 h-3.5 inline mx-1" /> Share button.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
              <div className="w-6 h-6 border border-black bg-[#ccff00] text-black font-black flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <span className="font-bold">Scroll and Select &quot;Add to Home Screen&quot;</span>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Look for <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-black" /> <strong>Add to Home Screen</strong> in the actions menu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
              <div className="w-6 h-6 border border-black bg-[#ccff00] text-black font-black flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <span className="font-bold">Tap &quot;Add&quot; in Top-Right Corner</span>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Confirm the name. Nedject will launch in fullscreen standalone app mode from your Home Screen with offline storage!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-black pt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NO APP STORE ACCOUNT NEEDED</span>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-[#ccff00] px-4 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-800"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
