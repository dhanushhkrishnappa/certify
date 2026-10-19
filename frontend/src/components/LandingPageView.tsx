import React, { useState } from "react";
import { useLenis } from "../motion/useLenis.js";
import Silk from "./landing/Silk.js";
import { LogoPreloader } from "./landing/LogoPreloader.js";
import { LandingNavbar } from "./landing/LandingNavbar.js";
import { HeroSection } from "./landing/HeroSection.js";
import { ManifestoSection } from "./landing/ManifestoSection.js";
import { ProofBentoSection } from "./landing/ProofBentoSection.js";
import { DraggableCurriculumCarousel } from "./landing/DraggableCurriculumCarousel.js";
import { AnimatedStatsSection } from "./landing/AnimatedStatsSection.js";
import { TestimonialsSection } from "./landing/TestimonialsSection.js";
import { FaqSection } from "./landing/FaqSection.js";
import { LandingFooter } from "./landing/LandingFooter.js";

// Session-level tracking so preloader runs strictly once on initial landing page entry
let hasInitialPreloaderRun = false;

interface LandingPageViewProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
  onSignIn: () => void;
  onRegister?: () => void;
  onSelectCourse?: (slug: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
  onSignIn,
  onRegister,
  onSelectCourse,
}) => {
  // Initialize Lenis smooth scroll coordinated with GSAP ScrollTrigger
  useLenis(true);

  const [showPreloader, setShowPreloader] = useState(() => !hasInitialPreloaderRun);

  return (
    <div className="relative min-h-screen bg-black font-['Plus_Jakarta_Sans',sans-serif] text-[#EDE4D8] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E] overflow-x-hidden">
      {/* Framer Logo Pre-loader: Fixed Overlay on Initial Visit */}
      {showPreloader && (
        <LogoPreloader
          onComplete={() => {
            hasInitialPreloaderRun = true;
            setShowPreloader(false);
          }}
        />
      )}

      {/* Full-Page React Bits Silk Background (Fixed Canvas, z-0) */}
      <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
        <Silk
          speed={2.9}
          scale={0.4}
          color="#514369"
          noiseIntensity={1.7}
          rotation={3.2}
        />
      </div>

      {/* Sticky Transformed Navbar */}
      <LandingNavbar
        onExploreCourses={onExploreCourses}
        onBeginDiagnostic={onBeginDiagnostic}
        onSignIn={onSignIn}
        onRegister={onRegister || onSignIn}
      />

      {/* Main Flow of Cinematic Sections */}
      <main className="relative z-10">
        {/* 1. Core Value Proposition / Scroll Manifesto (Interactive Text First) */}
        <ManifestoSection isPreloaderActive={showPreloader} />

        {/* 2. Cinematic Narrative Slideshow ("How It Works") */}
        <HeroSection
          onExploreCourses={onExploreCourses}
          onBeginDiagnostic={onBeginDiagnostic}
        />

        {/* 3. 6-Pillar Proof Bento Section */}
        <ProofBentoSection />

        {/* 4. Draggable Curriculum Carousel */}
        <DraggableCurriculumCarousel
          onExploreCourses={onExploreCourses}
          onSelectCourse={onSelectCourse}
        />

        {/* 5. Animated Product Dimensions & Statistics */}
        <AnimatedStatsSection />

        {/* 6. Candidate Experience Reports / Testimonials */}
        <TestimonialsSection />

        {/* 7. Accessible FAQ Accordion */}
        <FaqSection />
      </main>

      {/* 14. Premium Editorial Footer */}
      <LandingFooter
        onExploreCourses={onExploreCourses}
        onBeginDiagnostic={onBeginDiagnostic}
        onSignIn={onSignIn}
      />
    </div>
  );
};
