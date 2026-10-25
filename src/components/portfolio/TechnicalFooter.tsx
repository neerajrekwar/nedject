'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, Globe, Share2, Terminal, ArrowUp, MapPin, Phone } from 'lucide-react';

interface TechnicalFooterProps {
  onOpenQRArtifact?: () => void;
  onOpenSocialCards?: () => void;
}

export function TechnicalFooter({ onOpenQRArtifact, onOpenSocialCards }: TechnicalFooterProps) {
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

            {/* Direct Studio Location & Phone Details */}
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-start gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">LOCATION</span>
                  <span className="text-white font-bold">New Delhi, Delhi India</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">PHONE CONTACT</span>
                  <a href="tel:+917042149836" className="text-[#ccff00] hover:underline font-bold tracking-wide">
                    +91 704 214 9836
                  </a>
                </div>
              </div>
            </div>

            {/* Square Social Icon Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: GitBranch, href: 'https://github.com/neerajrekwar/nedject', label: 'GitHub Repository' },
                { icon: Globe, href: 'https://github.com/neerajrekwar', label: 'Developer Profile' },
                { icon: Share2, href: 'mailto:dev.neerajrekwar@gmail.com', label: 'Contact Developer' },
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
                  <Link
                    href="/privacy"
                    className="hover:text-[#ccff00] transition-colors text-left flex items-center gap-1 cursor-pointer font-bold text-white"
                  >
                    <span>[08]</span> <span>PRIVACY POLICY</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#ccff00] transition-colors text-left flex items-center gap-1 cursor-pointer font-bold text-white"
                  >
                    <span>[09]</span> <span>TERMS OF SERVICE</span>
                  </Link>
                </li>
                {onOpenSocialCards && (
                  <li>
                    <button
                      onClick={onOpenSocialCards}
                      className="text-[#ccff00] hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer font-black"
                    >
                      <span>[★]</span> <span>TWITTER &amp; OG CARDS</span>
                    </button>
                  </li>
                )}
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
              <div>LOCATION: NEW DELHI, DELHI INDIA</div>
              <div>PHONE: +91 704 214 9836</div>
              <div>CALIBRATION: 300 DPI B/W (21:1)</div>
              <div>PRINT CHUNK: PHYSICAL pHYs INJECTED</div>
              <div>BOUNDARIES: 2PX SOLID BLACK</div>
              <div className="pt-1 border-t border-zinc-800 text-[10px] text-zinc-400">
                GOOGLE OAUTH: LIMITED USE COMPLIANT
              </div>
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
            © {new Date().getFullYear()} NEDJECT // DEVELOPED BY NEERAJREKWAR // NEW DELHI, DELHI INDIA.
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center text-xs">
            <span className="text-zinc-400">NEW DELHI, DELHI INDIA</span>
            <span className="text-zinc-700">•</span>
            <a href="tel:+917042149836" className="text-[#ccff00] hover:underline font-bold">
              +91 704 214 9836
            </a>
            <span className="text-zinc-700">•</span>
            <Link href="/privacy" className="text-zinc-400 hover:text-[#ccff00] transition-colors underline">
              PRIVACY POLICY
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/terms" className="text-zinc-400 hover:text-[#ccff00] transition-colors underline">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
