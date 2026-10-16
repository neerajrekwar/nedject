'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, Globe, Share2, Terminal, ArrowUp } from 'lucide-react';

interface TechnicalFooterProps {
  onOpenQRArtifact?: () => void;
}

export function TechnicalFooter({ onOpenQRArtifact }: TechnicalFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0a0d14] text-white border-t-2 border-black font-mono">
      {/* Top Banner Accent */}
      <div className="w-full bg-[#ccff00] h-1.5 border-b-2 border-black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Block with Mission Summary (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 h-10 border-2 border-white bg-[#ccff00] text-black font-black text-sm flex items-center justify-center shadow-[3px_3px_0px_#ffffff]">
                NEDJECT
              </div>
              <div>
                <div className="text-sm font-black tracking-widest text-white">
                  GENQR_STUDIO // TOOLS SUITE
                </div>
                <div className="text-[11px] text-[#ccff00] font-bold">
                  DEVELOPED BY NEERAJREKWAR
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-sm">
              Industrial 300 DPI Photo QR Code Generator with B/W print calibration, multi-format export, and optical matrix engineering. Deterministic tool suite built with zero-radius neo-brutalist discipline.
            </p>

            {/* Square Social Icon Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: GitBranch, href: 'https://github.com/neerajrekwar/nedject', label: 'GitHub Repository' },
                { icon: Globe, href: 'https://github.com/neerajrekwar', label: 'Developer Profile' },
                { icon: Share2, href: 'mailto:dev.neerajrekwar@gmail.com', label: 'Contact Developer' },
                { icon: Terminal, href: '/qr-crush', label: 'QR Crush Lab' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    aria-label={item.label}
                    className="w-10 h-10 border-2 border-white bg-black hover:bg-[#ccff00] hover:text-black hover:border-black text-white flex items-center justify-center shadow-[3px_3px_0px_#ffffff] hover:shadow-[3px_3px_0px_#ccff00] transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Sitemap Navigation Links (4 cols) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6 text-xs">
            <div>
              <div className="text-xs font-black text-[#ccff00] uppercase mb-3 border-b border-zinc-800 pb-1">
                {'// OPTICAL TOOLS'}
              </div>
              <ul className="space-y-2 text-zinc-300">
                <li>
                  <Link href="/" className="hover:text-[#ccff00] transition-colors flex items-center gap-1">
                    <span>[01]</span> <span>300 DPI PHOTO QR</span>
                  </Link>
                </li>
                <li>
                  <Link href="/normal-dpi-photo" className="hover:text-[#ccff00] transition-colors flex items-center gap-1">
                    <span>[02]</span> <span>PHOTO DPI MAKER</span>
                  </Link>
                </li>
                <li>
                  <Link href="/barcode-pick" className="hover:text-[#ccff00] transition-colors flex items-center gap-1">
                    <span>[03]</span> <span>BARCODE PICK</span>
                  </Link>
                </li>
                <li>
                  <Link href="/qr-crush" className="hover:text-[#ccff00] transition-colors flex items-center gap-1">
                    <span>[04]</span> <span>QR CRUSH FORENSICS</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-black text-[#ccff00] uppercase mb-3 border-b border-zinc-800 pb-1">
                {'// UTILITIES'}
              </div>
              <ul className="space-y-2 text-zinc-300">
                <li>
                  <Link
                    href="/fitness-glass"
                    className="hover:text-[#ccff00] transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>[05]</span> <span>FITNESS GLASS</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fitness-glass/winter-arc-2026"
                    className="hover:text-[#ccff00] transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>[06]</span> <span>WINTER ARC 2026</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment"
                    className="hover:text-[#ccff00] transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>[07]</span> <span>UPGRADE &amp; PLANS</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/neerajrekwar"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#ccff00] transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>[DEV]</span> <span>GITHUB @NEERAJREKWAR</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Terminal Return / Spec Box (3 cols) */}
          <div className="md:col-span-3 flex flex-col justify-between">
            <div className="border border-zinc-800 bg-zinc-950 p-4 text-[11px] space-y-1.5 text-zinc-400">
              <div className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#ccff00] inline-block" />
                <span>NEDJECT CORE ENGINE</span>
              </div>
              <div>APP: NEDJECT GENQR_STUDIO</div>
              <div>DEVELOPER: NEERAJREKWAR</div>
              <div>CALIBRATION: 300 DPI B/W (21:1)</div>
              <div>PRINT CHUNK: PHYSICAL pHYs INJECTED</div>
              <div>BOUNDARIES: 2PX SOLID BLACK</div>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-4 w-full border-2 border-white bg-black hover:bg-[#ccff00] hover:text-black hover:border-black text-white p-3 font-mono text-xs font-black tracking-widest flex items-center justify-center gap-2 shadow-[3px_3px_0px_#ffffff] transition-all cursor-pointer"
            >
              <span>RETURN TO TOP</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Bottom Sub-Bar with Copyright & Technical Coordinates */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <div>
            © {new Date().getFullYear()} NEDJECT // DEVELOPED BY NEERAJREKWAR // ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span>LOC: 37.7749° N, 122.4194° W</span>
            <span className="text-zinc-700">|</span>
            <span>DEVELOPER: neerajrekwar</span>
            <span className="text-zinc-700">|</span>
            <span className="text-emerald-400 font-bold">STATUS: PROD_STABLE</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
