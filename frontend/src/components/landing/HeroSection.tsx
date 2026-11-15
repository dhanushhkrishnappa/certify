import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../motion/motionVocabulary.js";
import { StorySlideGap } from "./story/StorySlideGap.js";
import { StorySlideSocraticMethod } from "./story/StorySlideSocraticMethod.js";
import { StorySlideEvidence } from "./story/StorySlideEvidence.js";
import { StorySlideOutcome } from "./story/StorySlideOutcome.js";

interface HeroSectionProps {
  onExploreCourses: () => void;
}

interface SlideMeta {
  id: number;
  number: string;
  eyebrow: string;
  title: string;
  headline: string;
  supporting: string;
  type: "video" | "graphic";
  videoSrc?: string;
  poster?: string;
}

const SLIDES: SlideMeta[] = [
  {
    id: 0,
    number: "01",
    eyebrow: "THE PROBLEM",
    title: "THE PROBLEM",
    headline: "You watched the lesson. Can you solve it yourself?",
    supporting:
      "A lesson can make a concept feel familiar. Applying it on your own reveals what you truly understand.",
    type: "video",
    videoSrc: "/videos/certify-passive-learning.mp4",
    poster: "/videos/poster-passive-learning.webp",
  },
  {
    id: 1,
    number: "02",
    eyebrow: "THE GAP",
    title: "THE GAP",
    headline: "Completion isn't the same as understanding.",
    supporting: "Watching introduces an idea. Practice reveals whether you can use it.",
    type: "graphic",
  },
  {
    id: 2,
    number: "03",
    eyebrow: "THE SHIFT",
    title: "THE SHIFT",
    headline: "Understanding begins when you try.",
    supporting: "Move from watching to working through an idea yourself.",
    type: "video",
    videoSrc: "/videos/certify-practical-learning.mp4",
    poster: "/videos/poster-practical-learning.webp",
  },
  {
    id: 3,
    number: "04",
    eyebrow: "THE SOLUTION",
    title: "THE SOLUTION",
    headline: "Learning should respond to you.",
    supporting:
      "An AI tutor asks questions, explores your reasoning, and helps you work through what you don't yet understand.",
    type: "graphic",
  },
  {
    id: 4,
    number: "05",
    eyebrow: "THE PROOF",
    title: "THE PROOF",
    headline: "Show what you can do.",
    supporting:
      "Practice and assessments help turn learning into evidence of what you understand.",
    type: "graphic",
  },
  {
    id: 5,
    number: "06",
    eyebrow: "THE OUTCOME",
    title: "THE OUTCOME",
    headline: "Learn. Demonstrate. Earn.",
    supporting:
      "Your learning and assessment evidence comes together in a credential you can verify.",
    type: "graphic",
  },
];

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [slideProgress, setSlideProgress] = useState<number>(0);

  // References for the 2 embedded videos
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // Drag interaction tracking state
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentDragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Synchronize video playback strictly with active slide index
  useEffect(() => {
    // Slide 01: Video 1 (Passive lesson watching)
    if (activeSlide === 0) {
      if (video1Ref.current && video1Ref.current.paused) {
        video1Ref.current.play().catch(() => {});
      }
    } else {
      if (video1Ref.current && !video1Ref.current.paused) {
        video1Ref.current.pause();
      }
    }

    // Slide 03: Video 2 (Practical coding & trial)
    if (activeSlide === 2) {
      if (video2Ref.current && video2Ref.current.paused) {
        video2Ref.current.play().catch(() => {});
      }
    } else {
      if (video2Ref.current && !video2Ref.current.paused) {
        video2Ref.current.pause();
      }
    }
  }, [activeSlide]);

  // Set up GSAP ScrollTrigger coordinated with Lenis pinning
  useEffect(() => {
    const isReduced = prefersReducedMotion();
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        start: "top top",
        end: "+=2800",
        scrub: isReduced ? false : 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (isDraggingRef.current) return;

          const raw = self.progress; // 0.0 to 1.0
          // Hold the final slide slightly before unpinning
          const holdEnd = 0.88;
          let floatIndex = 0;
          if (raw <= holdEnd) {
            floatIndex = (raw / holdEnd) * (SLIDES.length - 1);
          } else {
            floatIndex = SLIDES.length - 1;
          }

          setSlideProgress(floatIndex);
          const snapped = Math.round(floatIndex);
          setActiveSlide(snapped);
        },
      });

      scrollTriggerRef.current = st;
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // Programmatic slide transition (clicking adjacent cards or dots)
  const goToSlide = useCallback((index: number) => {
    const target = Math.max(0, Math.min(SLIDES.length - 1, index));
    setActiveSlide(target);
    setSlideProgress(target);

    const st = scrollTriggerRef.current;
    if (st) {
      const holdEnd = 0.88;
      const progress = (target / (SLIDES.length - 1)) * holdEnd;
      const targetScroll = st.start + progress * (st.end - st.start);

      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 0.5 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  }, []);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToSlide(activeSlide + 1);
      } else if (e.key === "ArrowLeft") {
        goToSlide(activeSlide - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide, goToSlide]);

  // Pointer drag event handlers reproducing the Framer drag interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentDragOffsetRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    currentDragOffsetRef.current = deltaX;
    setDragOffset(deltaX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore release pointer errors
    }

    const deltaX = currentDragOffsetRef.current;
    setDragOffset(0);

    // Threshold for snapping to previous or next slide
    if (deltaX < -45 && activeSlide < SLIDES.length - 1) {
      goToSlide(activeSlide + 1);
    } else if (deltaX > 45 && activeSlide > 0) {
      goToSlide(activeSlide - 1);
    }
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full h-screen bg-transparent select-none overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Pinned Gallery Stage */}
      <div className="h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-3 sm:pb-4">
        {/* Ambient Top Subtle Light Beam (preserves CERTIFY palette) */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] pointer-events-none z-0 rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(230, 202, 164, 0.16) 0%, rgba(206, 164, 242, 0.12) 45%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Top Right Helper Cue: "SCROLL / DRAG" exactly matching the Framer reference */}
        <div className="absolute top-16 sm:top-20 right-5 sm:right-10 lg:right-14 z-30 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#CFC2B4]/60 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6CAA4] animate-pulse" />
          <span>SCROLL / DRAG</span>
        </div>

        {/* 3D Perspective Gallery Stage */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y shrink-0"
          style={{
            perspective: "1300px",
            perspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Card Deck Container: Enlarged prominently with ~1.69 : 1 aspect ratio */}
          <div className="relative w-[92vw] sm:w-[540px] md:w-[600px] lg:w-[650px] h-[275px] sm:h-[325px] md:h-[360px] lg:h-[385px] flex items-center justify-center">
            {SLIDES.map((slide, index) => {
              // Continuous float distance from active slide center
              const diff = index - slideProgress - dragOffset / 350;
              const absDiff = Math.abs(diff);
              const sign = Math.sign(diff);

              const isReduced = prefersReducedMotion();

              // Calculate transforms replicating the Framer reference deck
              let translateX = 0;
              if (isReduced) {
                translateX = diff * 105;
              } else {
                if (absDiff <= 1) {
                  translateX = sign * absDiff * 275;
                } else if (absDiff <= 2) {
                  translateX = sign * (275 + (absDiff - 1) * 195);
                } else {
                  translateX = sign * (470 + (absDiff - 2) * 175);
                }
              }

              const translateZ = isReduced ? 0 : -absDiff * 130;
              const rotateY = isReduced ? 0 : -sign * Math.min(absDiff * 32, 38);
              const scale = isReduced
                ? absDiff < 0.5 ? 1 : 0.85
                : Math.max(0.65, 1 - absDiff * 0.1);
              const blur = isReduced ? 0 : absDiff < 0.35 ? 0 : Math.min(10, (absDiff - 0.35) * 2.8);
              const opacity = absDiff > 3.6 ? 0 : Math.max(0, 1 - Math.max(0, absDiff - 1.2) * 0.4);
              const zIndex = Math.round(1000 - absDiff * 50);

              const isCurrent = activeSlide === index;

              return (
                <div
                  key={slide.id}
                  onClick={() => {
                    if (!isCurrent) goToSlide(index);
                  }}
                  className={`absolute inset-0 rounded-lg sm:rounded-[10px] overflow-hidden border transition-shadow duration-300 ${
                    isCurrent
                      ? "border-white/20 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)]"
                      : "border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.7)] cursor-pointer"
                  }`}
                  style={{
                    transform: isReduced
                      ? `translate3d(${translateX}%, 0, 0) scale(${scale})`
                      : `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    filter: blur > 0 ? `blur(${blur}px)` : "none",
                    zIndex,
                    transformStyle: "preserve-3d",
                    transition: isDragging
                      ? "none"
                      : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, filter 0.45s ease",
                  }}
                >
                  {/* Slide Content: Pure Media Panels (No text overlay inside media) */}
                  {slide.type === "video" ? (
                    /* Video Panel (Slide 01 and Slide 03) */
                    <div className="relative w-full h-full bg-[#0D0D10] overflow-hidden select-none">
                      {slide.poster && (
                        <img
                          src={slide.poster}
                          alt={slide.headline}
                          loading="eager"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                        />
                      )}
                      <video
                        ref={slide.id === 0 ? video1Ref : video2Ref}
                        src={slide.videoSrc}
                        poster={slide.poster}
                        muted
                        playsInline
                        loop
                        preload="auto"
                        className="relative z-10 w-full h-full object-cover"
                      />
                    </div>
                  ) : slide.id === 1 ? (
                    /* Slide 02: THE GAP Kinetic Graphic */
                    <StorySlideGap isActive={isCurrent} />
                  ) : slide.id === 3 ? (
                    /* Slide 04: THE SOLUTION Socratic Graphic */
                    <StorySlideSocraticMethod isActive={isCurrent} />
                  ) : slide.id === 4 ? (
                    /* Slide 05: THE PROOF Evidence Graphic */
                    <StorySlideEvidence isActive={isCurrent} />
                  ) : (
                    /* Slide 06: THE OUTCOME Credential Graphic */
                    <StorySlideOutcome isActive={isCurrent} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Synchronized Editorial Caption Area (Positioned directly beneath the active center panel) */}
        <div className="relative z-20 mt-4 sm:mt-5 w-full max-w-xl mx-auto text-center px-4 flex flex-col items-center justify-start shrink-0 min-h-[130px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              {/* Eyebrow & Slide Counter */}
              <div className="flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.22em] text-[#E6CAA4] mb-1.5 font-medium">
                <span>{SLIDES[activeSlide].eyebrow}</span>
                <span className="text-white/20">/</span>
                <span className="text-[#CFC2B4]/80">{SLIDES[activeSlide].number} — 06</span>
              </div>

              {/* Editorial Headline */}
              <h3 className="font-sans font-bold text-xl sm:text-2xl md:text-[25px] font-normal leading-[1.2] text-[#FEF5E5] mb-1.5">
                {activeSlide === 2 ? (
                  <>
                    Understanding begins{" "}
                    <span className="italic text-[#CEA4F2]">when you try</span>.
                  </>
                ) : (
                  SLIDES[activeSlide].headline
                )}
              </h3>

              {/* Short Supporting Description */}
              <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#CFC2B4] font-normal max-w-lg mb-2">
                {SLIDES[activeSlide].supporting}
              </p>

            </motion.div>
          </AnimatePresence>

          {/* Discrete Slide Progress Dots matching Framer reference */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  activeSlide === idx
                    ? "w-5 h-1 bg-[#FEF5E5]"
                    : "w-1 h-1 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Jump to slide ${s.number}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
