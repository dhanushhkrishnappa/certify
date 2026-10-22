import React from "react";
import { motion } from "motion/react";

interface StorySlideEvidenceProps {
  isActive: boolean;
}

export const StorySlideEvidence: React.FC<StorySlideEvidenceProps> = ({ isActive }) => {
  const proofStages = [
    {
      step: "01",
      name: "LEARN",
      sub: "Socratic Core",
      detail: "Probing questions identify gaps in real time.",
      tag: "INQUIRY",
    },
    {
      step: "02",
      name: "PRACTICE",
      sub: "Hands-on Sandbox",
      detail: "Build functions, handle edge cases, fix tests.",
      tag: "SYNTHESIS",
    },
    {
      step: "03",
      name: "CHAPTER CHECK",
      sub: "Diagnostic Rubric",
      detail: "Rubric tests prove conceptual depth across topics.",
      tag: "EVALUATION",
    },
    {
      step: "04",
      name: "DEMONSTRATE",
      sub: "Viva Defense",
      detail: "Oral defense & evidence ledger record mastery.",
      tag: "PROOF LEDGER",
    },
  ];

  return (
    <div className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#18171E] via-[#131217] to-[#0D0C10] text-[#FEF5E5] select-none overflow-hidden">
      {/* Subtle Ambient Radial Highlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          background:
            "radial-gradient(ellipse at 30% 70%, rgba(206,164,242,0.12) 0%, rgba(230,202,164,0.08) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Graphic Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6CAA4] animate-pulse" />
          <span className="text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] font-semibold">
            CONTINUOUS VERIFICATION STACK
          </span>
        </div>
        <div className="text-[9.5px] font-mono text-[#A1A1AA] uppercase tracking-wider">
          EVIDENCE PROGRESSION
        </div>
      </div>

      {/* 4-Stage Proof Chain Graphic */}
      <div className="relative z-10 my-auto py-2">
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Animated Connecting Beam */}
          <div className="hidden sm:block absolute top-[24px] left-[12%] right-[12%] h-[2px] bg-white/[0.08] -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-[#22C55E] via-[#CEA4F2] to-[#E6CAA4]"
              initial={{ width: "20%" }}
              animate={isActive ? { width: "100%" } : { width: "20%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </div>

          {proofStages.map((stage, index) => {
            const isLast = index === proofStages.length - 1;
            return (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: 12 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.35 }}
                className={`relative rounded-xl p-2.5 sm:p-3 border transition-all duration-300 ${
                  isLast
                    ? "bg-[#1C1822]/90 border-[#E6CAA4]/40 shadow-[0_4px_20px_rgba(230,202,164,0.12)]"
                    : "bg-[#141318]/90 border-white/[0.08]"
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold ${
                      isLast
                        ? "bg-[#E6CAA4]/20 text-[#E6CAA4] border border-[#E6CAA4]/40"
                        : "bg-white/10 text-white/70 border border-white/10"
                    }`}
                  >
                    {stage.step}
                  </div>
                  <span
                    className={`text-[8.5px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full ${
                      isLast
                        ? "bg-[#E6CAA4]/15 text-[#E6CAA4] font-semibold"
                        : "bg-white/5 text-[#9CA3AF]"
                    }`}
                  >
                    {stage.tag}
                  </span>
                </div>

                {/* Stage Name & Subtitle */}
                <div className="text-xs sm:text-[13px] font-semibold tracking-wide text-[#FEF5E5] mb-0.5">
                  {stage.name}
                </div>
                <div className="text-[10px] font-mono text-[#E6CAA4]/80 mb-1">
                  {stage.sub}
                </div>
                <div className="text-[10px] text-[#A1A1AA] leading-snug line-clamp-2">
                  {stage.detail}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Proof Status Indicator */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#CFC2B4]/80">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Verifiable Demonstration Required</span>
        </div>
        <div className="text-[#A1A1AA]">
          Evidence Ledger • Authentic Demonstration
        </div>
      </div>
    </div>
  );
};

export default StorySlideEvidence;
