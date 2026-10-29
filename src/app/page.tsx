'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/portfolio/Navbar';
import { UniversalHeroSection } from '@/components/portfolio/UniversalHeroSection';
import { HeroSection } from '@/components/portfolio/HeroSection';
import { MarqueeBanner } from '@/components/portfolio/MarqueeBanner';
import { ProjectShowcase } from '@/components/portfolio/ProjectShowcase';
import { OpenSourceRegistry } from '@/components/portfolio/OpenSourceRegistry';
import { ToolsSuiteGrid } from '@/components/portfolio/ToolsSuiteGrid';
import { DataTransparencySection } from '@/components/portfolio/DataTransparencySection';
import { TechnicalFooter } from '@/components/portfolio/TechnicalFooter';
import { SocialCardsModal } from '@/components/portfolio/SocialCardsModal';

export default function Home() {
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const handleOpenContact = () => {
    const contactElem = document.getElementById('tools-catalog');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreProjects = () => {
    const toolsElem = document.getElementById('tools-catalog');
    if (toolsElem) {
      toolsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreRegistry = () => {
    const toolsElem = document.getElementById('tools-catalog');
    if (toolsElem) {
      toolsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToQRStudio = () => {
    const qrElem = document.getElementById('qr-studio');
    if (qrElem) {
      qrElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black relative flex flex-col">
      
      {/* 1. TOP NAVIGATION BAR */}
      <Navbar
        onOpenContact={handleOpenContact}
        onOpenSocialCards={() => setIsSocialModalOpen(true)}
      />

      {/* MAIN CONTENT RUNTIME - PURE TOOLS FOCUS UNDER BRAND "NEDJECT" */}
      <main className="flex-1 w-full">
        {/* 2. TOP HERO SECTION FOR UNIVERSAL USE FOR WHOLE INTERPRET WEBSITE (h-70vh) */}
        <UniversalHeroSection
          onExploreProjects={handleExploreProjects}
          onExploreRegistry={handleExploreRegistry}
          onScrollToQRStudio={handleScrollToQRStudio}
        />

        {/* 3. CORE 300 DPI PHOTO QR CODE STUDIO HERO */}
        <HeroSection
          onExploreProjects={handleExploreProjects}
          onExploreRegistry={handleExploreRegistry}
        />

        {/* 3. HORIZONTAL TECH STACK MARQUEE */}
        <MarqueeBanner />

        {/* 4. COMPLETE NEDJECT TOOLS SUITE CATALOG */}
        <ToolsSuiteGrid />

        {/* 5. MANDATORY GOOGLE OAUTH & DATA TRANSPARENCY DISCLOSURE */}
        <DataTransparencySection />
      </main>

      {/* 6. TECHNICAL FOOTER WITH ATTRIBUTION: DEVELOPED BY NEERAJREKWAR */}
      <TechnicalFooter
        onOpenSocialCards={() => setIsSocialModalOpen(true)}
      />

      {/* 7. INTERACTIVE SOCIAL CARDS & OPENGRAPH STUDIO (CANVAS 1200×630) */}
      <SocialCardsModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
      />

      {/* 9. INTERACTIVE SOCIAL CARDS & OPENGRAPH STUDIO (CANVAS 1200×630) */}
      <SocialCardsModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
      />

    </div>
  );
}
