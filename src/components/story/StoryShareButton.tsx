'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SocialStoryModal } from './SocialStoryModal';
import { Share2, Sparkles, Camera } from 'lucide-react';

interface StoryShareButtonProps {
  className?: string;
  variant?: 'button' | 'pill' | 'floating' | 'icon';
  label?: string;
  pageTitle?: string;
  pageUrl?: string;
  pageDescription?: string;
  category?: string;
}

export const StoryShareButton: React.FC<StoryShareButtonProps> = ({
  className = '',
  variant = 'button',
  label = 'SHARE STORY',
  pageTitle,
  pageUrl,
  pageDescription,
  category,
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isAdminRoute = Boolean(pathname?.startsWith('/admin'));

  // Scroll detection: hide on scroll down, show on scroll up with 200px intersection threshold
  useEffect(() => {
    if (variant !== 'floating' || isAdminRoute) return;

    const SCROLL_THRESHOLD = 200; // 200px intersect boundary

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      // Within 200px threshold of top, always keep button visible
      if (currentScrollY <= SCROLL_THRESHOLD) {
        setIsVisible(true);
      } else if (diff > 5) {
        // Scrolling DOWN -> hide the button
        setIsVisible(false);
      } else if (diff < -5) {
        // Scrolling UP -> reveal the button
        setIsVisible(true);
      }

      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant, isAdminRoute]);

  // STRICT REQUIREMENT: Do NOT show the floating/pill story button inside any /admin route
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {variant === 'floating' && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Share page to Instagram or Web Story"
          className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 border-4 border-black bg-[#ccff00] text-black px-4 py-2.5 font-mono text-xs font-black shadow-[6px_6px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000000] transition-all duration-300 ease-in-out cursor-pointer ${
            isVisible
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-24 opacity-0 pointer-events-none'
          } ${className}`}
        >
          <Camera className="w-4 h-4 text-black" />
          <span>{label}</span>
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
        </button>
      )}

      {variant === 'icon' && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Share to Instagram Story"
          title="Share to Instagram Story (9:16 Vector Card)"
          className={`border-2 border-black bg-white p-2 text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ccff00] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer ${className}`}
        >
          <Camera className="w-4 h-4" />
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Share to Instagram Story"
          className={`inline-flex items-center gap-1.5 border-2 border-black bg-white text-black px-2.5 py-1 text-[11px] font-mono font-black shadow-[2px_2px_0px_#000000] hover:bg-[#ccff00] transition-colors cursor-pointer ${className}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'button' && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Share to Instagram Story"
          className={`inline-flex items-center gap-2 border-2 border-black bg-white text-black px-3.5 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#000000] hover:bg-[#ccff00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${className}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      <SocialStoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pageTitle={pageTitle}
        pageUrl={pageUrl}
        pageDescription={pageDescription}
        category={category}
      />
    </>
  );
};
