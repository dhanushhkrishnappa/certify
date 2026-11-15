import React, { useRef, useEffect } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "../../motion/motionVocabulary.js";
import { AccordionGallery, CERTIFY_PILLARS } from "./AccordionGallery.js";

export const ProofBentoSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-wrapper",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: MOTION_EASING.expoOut,
          clearProps: "all",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="pedagogy"
      ref={containerRef}
      className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-sans font-bold text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
              Six Pillars of Defensible Understanding
            </h2>
          </div>
          <p className="text-[15px] text-[#CFC2B4] max-w-md leading-relaxed">
            From AI-guided learning to verified credentials, every step builds evidence of what you truly understand.
          </p>
        </div>

        {/* High-Fidelity Accordion Gallery */}
        <div className="gallery-wrapper w-full">
          <AccordionGallery
            items={CERTIFY_PILLARS}
            defaultIndex={0}
            expandRatio={0.52}
            trigger="hover"
            height={480}
            gap={10}
            radius={16}
            tilt={8}
            parallax={0.5}
            duration={0.6}
            ease="power3.out"
            stagger={0.06}
            accentColor="#E6CAA4"
            overlayColor="#000000"
            textColor="#FEF5E5"
            grayscale={false}
            showLabels={true}
          />
        </div>
      </div>
    </section>
  );
};
