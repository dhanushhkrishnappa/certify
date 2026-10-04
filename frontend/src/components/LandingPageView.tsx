import React from "react";
import { useLenis } from "../motion/useLenis.js";
import { WebGLCursor } from "./landing/webgl/WebGLCursor.js";
import { LandingNavbar } from "./landing/LandingNavbar.js";
import { HeroSection } from "./landing/HeroSection.js";
import { ManifestoSection } from "./landing/ManifestoSection.js";
import { LearnedDemonstratedEarnedSection } from "./landing/LearnedDemonstratedEarnedSection.js";
import { AiShowcaseSection } from "./landing/AiShowcaseSection.js";
import { ProofBentoSection } from "./landing/ProofBentoSection.js";
import { ImageRevealGallery } from "./landing/ImageRevealGallery.js";
import { DraggableCurriculumCarousel } from "./landing/DraggableCurriculumCarousel.js";
import { FlagshipCourseSection } from "./landing/FlagshipCourseSection.js";
import { AnimatedStatsSection } from "./landing/AnimatedStatsSection.js";
import { TestimonialsSection } from "./landing/TestimonialsSection.js";
import { ChooseYourPathSection } from "./landing/ChooseYourPathSection.js";
import { FaqSection } from "./landing/FaqSection.js";
import { FinalCtaSection } from "./landing/FinalCtaSection.js";
import { LandingFooter } from "./landing/LandingFooter.js";

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

  return (
    <div className="relative min-h-screen bg-[#150A05] font-['Plus_Jakarta_Sans',sans-serif] text-[#EDE4D8] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E] overflow-x-hidden">
      {/* Subtle WebGL / Canvas Fluid Cursor (Desktop only, GPU-efficient) */}
      <WebGLCursor />

      {/* Sticky Transformed Navbar */}
      <LandingNavbar
        onExploreCourses={onExploreCourses}
        onBeginDiagnostic={onBeginDiagnostic}
        onSignIn={onSignIn}
        onRegister={onRegister || onSignIn}
      />

      {/* Main Flow of Cinematic Sections */}
      <main className="relative z-10">
        {/* 1. Cinematic Hero */}
        <HeroSection
          onExploreCourses={onExploreCourses}
          onBeginDiagnostic={onBeginDiagnostic}
        />

        {/* 2. Core Value Proposition / Scroll Manifesto */}
        <ManifestoSection />

        {/* 3. Emotional Core: LEARN -> DEMONSTRATE -> EARN (Pinned GSAP Section) */}
        <LearnedDemonstratedEarnedSection />

        {/* 4. Interactive AI Learning Studio Showcase */}
        <AiShowcaseSection />

        {/* 5. 6-Pillar Proof Bento Section */}
        <ProofBentoSection />

        {/* 6. Image & Code Reveal Gallery */}
        <ImageRevealGallery />

        {/* 7. Draggable Curriculum Carousel */}
        <DraggableCurriculumCarousel
          onExploreCourses={onExploreCourses}
          onSelectCourse={onSelectCourse}
        />

        {/* 8. Flagship Track Deep Dive (Python Fundamentals) */}
        <FlagshipCourseSection
          onExploreCourses={onExploreCourses}
          onBeginDiagnostic={onBeginDiagnostic}
        />

        {/* 9. Animated Product Dimensions & Statistics */}
        <AnimatedStatsSection />

        {/* 10. Candidate Experience Reports / Testimonials */}
        <TestimonialsSection />

        {/* 11. Choose Your Path / Product Model */}
        <ChooseYourPathSection
          onBeginDiagnostic={onBeginDiagnostic}
          onExploreCourses={onExploreCourses}
          onSignIn={onSignIn}
        />

        {/* 12. Accessible FAQ Accordion */}
        <FaqSection />

        {/* 13. Dramatic Bottom CTA ("Don't just say you know it. Prove it.") */}
        <FinalCtaSection
          onBeginDiagnostic={onBeginDiagnostic}
          onExploreCourses={onExploreCourses}
        />
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
