'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/portfolio/Navbar';
import { UniversalHeroSection } from '@/components/portfolio/UniversalHeroSection';
import { HeroSection } from '@/components/portfolio/HeroSection';
import { MarqueeBanner } from '@/components/portfolio/MarqueeBanner';
import { ProjectShowcase } from '@/components/portfolio/ProjectShowcase';
import { OpenSourceRegistry } from '@/components/portfolio/OpenSourceRegistry';
import { ToolsSuiteGrid } from '@/components/portfolio/ToolsSuiteGrid';
import { TechnicalFooter } from '@/components/portfolio/TechnicalFooter';
import { LiveArtifactModal } from '@/components/portfolio/LiveArtifactModal';
import { SocialCardsModal } from '@/components/portfolio/SocialCardsModal';

export default function Home() {
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
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
        onOpenQRArtifact={() => setIsArtifactModalOpen(true)}
        onOpenSocialCards={() => setIsSocialModalOpen(true)}
      />

      {/* MAIN CONTENT RUNTIME - PURE TOOLS FOCUS UNDER BRAND "NEDJECT" */}
      <main className="flex-1 w-full">
        {/* 2. TOP HERO SECTION FOR UNIVERSAL USE FOR WHOLE INTERPRET WEBSITE (h-70vh) */}
        <UniversalHeroSection
          onExploreProjects={handleExploreProjects}
          onExploreRegistry={handleExploreRegistry}
          onOpenQRArtifact={() => setIsArtifactModalOpen(true)}
          onScrollToQRStudio={handleScrollToQRStudio}
        />

        {/* 3. CORE 300 DPI PHOTO QR CODE STUDIO HERO */}
        <HeroSection
          onExploreProjects={handleExploreProjects}
          onExploreRegistry={handleExploreRegistry}
          onOpenQRArtifact={() => setIsArtifactModalOpen(true)}
        />

        {/* 3. HORIZONTAL TECH STACK MARQUEE */}
        <MarqueeBanner />

        {/* 4. PROJECT SHOWCASE GRID 
        <ProjectShowcase onOpenQRArtifact={() => setIsArtifactModalOpen(true)} /> */}

        {/* 5. OPEN-SOURCE REGISTRY MODULES 
        <OpenSourceRegistry /> */}

        {/* 6. COMPLETE NEDJECT TOOLS SUITE CATALOG */}
        <ToolsSuiteGrid />
      </main>

      {/* 7. TECHNICAL FOOTER WITH ATTRIBUTION: DEVELOPED BY NEERAJREKWAR */}
      <TechnicalFooter
        onOpenQRArtifact={() => setIsArtifactModalOpen(true)}
        onOpenSocialCards={() => setIsSocialModalOpen(true)}
      />

      {/* 8. INTERACTIVE LIVE ARTIFACT POPUP MODAL (300 DPI QR Studio & Pass Engine) */}
      <LiveArtifactModal
        isOpen={isArtifactModalOpen}
        onClose={() => setIsArtifactModalOpen(false)}
      />

      {/* 9. INTERACTIVE SOCIAL CARDS & OPENGRAPH STUDIO (CANVAS 1200×630) */}
      <SocialCardsModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
      />

    </div>
  );
}
