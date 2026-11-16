import React from "react";
import { useMagnetic } from "../../motion/useMagnetic.js";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface FinalCtaSectionProps {
  onBeginDiagnostic: () => void;
  onExploreCourses: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onBeginDiagnostic,
  onExploreCourses,
}) => {
  const primaryMagneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.35 });
  const secondaryMagneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.22 });

  return (
    <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      {/* Dramatic Ambient Light Beams */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] pointer-events-none rounded-full blur-[150px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(206, 164, 242, 0.25) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <BulgeCard
          className="p-10 sm:p-16 md:p-20 rounded-[40px] bg-gradient-to-b from-[#18181D]/92 via-[#121215]/88 to-[#0B0B0E]/94 border border-white/[0.08] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden text-[#FEF5E5] backdrop-blur-xl"
          maxTilt={5}
          highlightColor="rgba(255, 255, 255, 0.08)"
        >
          {/* Topographic Lines Background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-25"
            viewBox="0 0 900 600"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M -30 220 C 170 140, 250 400, 520 280 C 720 180, 820 410, 980 320"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
            <path
              d="M -50 470 C 160 370, 260 650, 560 530 C 760 450, 860 670, 990 590"
              stroke="#CEA4F2"
              strokeWidth="1.2"
            />
          </svg>

          {/* Concave 4-pointed sparkle stars on edges */}
          <div className="absolute top-10 right-10 pointer-events-none opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z" fill="rgba(255, 255, 255, 0.5)" />
            </svg>
          </div>
          <div className="absolute bottom-12 left-10 pointer-events-none opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z" fill="#CEA4F2" />
            </svg>
          </div>

          {/* Grand Dramatic Headline */}
          <h2 className="font-['Newsreader',Georgia,serif] text-4xl sm:text-6xl md:text-7xl font-normal text-[#FEF5E5] leading-tight mb-4 max-w-3xl mx-auto">
            Don't just say you know it.
          </h2>
          <p className="font-['Newsreader',Georgia,serif] text-5xl sm:text-7xl md:text-8xl italic text-[#CEA4F2] font-normal leading-none mb-8">
            Prove it.
          </p>

          {/* Supporting Copy */}
          <p className="text-[16px] sm:text-[18px] text-[#D1D5DB] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Begin with a 7-minute Socratic dialogue session. Experience how CERTIFY probes understanding, rectifies edge cases, and creates verifiable engineering credentials.
          </p>

          {/* Magnetic CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              ref={primaryMagneticRef}
              onClick={onBeginDiagnostic}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#111827] text-[15px] font-bold border border-white/20 shadow-xl shadow-black/40 transition-all duration-150 active:scale-95 cursor-pointer group"
            >
              <span className="magnetic-content flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#111827]">bolt</span>
                <span>Begin 7–Min Diagnostic</span>
                <span className="text-[14px] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </span>
            </button>

            <button
              ref={secondaryMagneticRef}
              onClick={onExploreCourses}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-[#FEF5E5] text-[15px] font-medium transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
            >
              <span className="magnetic-content flex items-center gap-2">
                <span>Explore Courses</span>
                <span className="text-[13px] text-[#D1D5DB]">→</span>
              </span>
            </button>
          </div>
        </BulgeCard>
      </div>
    </section>
  );
};
