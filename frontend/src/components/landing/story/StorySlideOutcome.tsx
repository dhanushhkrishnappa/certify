import React from "react";
import { motion } from "motion/react";

interface StorySlideOutcomeProps {
  isActive: boolean;
}

export const StorySlideOutcome: React.FC<StorySlideOutcomeProps> = ({ isActive }) => {
  return (
    <div className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#18171E] via-[#131217] to-[#0D0C10] text-[#FEF5E5] select-none overflow-hidden">
      {/* Ambient Gold & Violet Radiance */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(230,202,164,0.16) 0%, rgba(206,164,242,0.10) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Graphic Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6CAA4] animate-pulse" />
          <span className="text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] font-semibold">
            AUDITABLE QUALIFICATION CREDENTIAL
          </span>
        </div>
        <div className="text-[9.5px] font-mono text-[#A1A1AA] uppercase tracking-wider">
          EVIDENCE LEDGER #9A4F
        </div>
      </div>

      {/* Prestige Certificate Visual Mockup */}
      <div className="relative z-10 my-auto py-1 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={isActive ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.7, scale: 0.96, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative rounded-xl p-3.5 sm:p-4 bg-gradient-to-b from-[#1E1C24]/95 via-[#16151B]/95 to-[#100F14]/98 border border-[#E6CAA4]/35 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden"
        >
          {/* Subtle Guilloche Outline Decorative Border */}
          <div className="absolute inset-1 sm:inset-1.5 rounded-lg border border-[#E6CAA4]/20 pointer-events-none" />

          {/* Certificate Content Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src="/certify-icon.png"
                alt="Certify Seal"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              />
              <div>
                <div className="text-[9.5px] sm:text-[10px] font-mono tracking-[0.2em] text-[#E6CAA4] uppercase font-bold">
                  CERTIFY QUALIFICATION
                </div>
                <div className="text-[9.5px] text-[#A1A1AA] font-mono">
                  DEMONSTRATED MASTERY
                </div>
              </div>
            </div>

            {/* Restrained Champagne Seal */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#E6CAA4] via-[#CEA4F2] to-[#B388E0] p-[1px] shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#16151B] flex items-center justify-center">
                <span className="text-[#E6CAA4] text-[11px] font-bold">★</span>
              </div>
            </div>
          </div>

          {/* Credential Name */}
          <div className="mb-2">
            <div className="text-[8.5px] sm:text-[9px] font-mono text-[#CFC2B4]/70 uppercase tracking-widest mb-0.5">
              AWARDED FOR DEMONSTRATED COMPETENCE
            </div>
            <div className="font-['Newsreader',Georgia,serif] text-base sm:text-lg md:text-xl text-[#FEF5E5] font-normal leading-tight">
              Applied Engineering &amp; Socratic Synthesis
            </div>
          </div>

          {/* Verification Evidence Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/[0.08] text-[9.5px] font-mono text-[#E6CAA4]">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>Viva Defense Passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>Rubric Verified</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[#CEA4F2]">◆</span>
              <span>Evidence Ledger #9A4F</span>
            </div>
          </div>

          {/* Watermark Notice */}
          <div className="mt-1.5 text-[8.5px] font-mono uppercase tracking-[0.2em] text-[#9CA3AF]/60 text-center">
            ILLUSTRATIVE PREVIEW • AUDITABLE CREDENTIAL
          </div>
        </motion.div>
      </div>

      {/* Bottom Proof Status Indicator */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#CFC2B4]/80">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Verifiable Credential</span>
        </div>
        <div className="text-[#A1A1AA]">
          Cryptographic Evidence Ledger • Socratic Defense
        </div>
      </div>
    </div>
  );
};

export default StorySlideOutcome;
