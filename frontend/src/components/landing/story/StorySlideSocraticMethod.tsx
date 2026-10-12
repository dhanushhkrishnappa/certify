import React from "react";
import { motion } from "motion/react";

interface StorySlideSocraticMethodProps {
  isActive: boolean;
}

export const StorySlideSocraticMethod: React.FC<StorySlideSocraticMethodProps> = ({ isActive }) => {
  return (
    <div className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#18171E] via-[#131217] to-[#0E0E12] text-[#FEF5E5] select-none overflow-hidden">
      {/* Subtle Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(206,164,242,0.14) 0%, rgba(230,202,164,0.06) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Graphic Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-pulse" />
          <span className="text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] font-semibold">
            SOCRATIC INQUIRY CHAMBER
          </span>
        </div>
        <div className="text-[9.5px] font-mono text-[#A1A1AA] uppercase tracking-wider">
          ADAPTIVE REASONING
        </div>
      </div>

      {/* Animated Socratic Conversation Chamber */}
      <div className="relative z-10 my-auto py-1 max-w-xl w-full mx-auto">
        <div className="relative pl-3.5 sm:pl-4 border-l-2 border-[#CEA4F2]/30 space-y-2">
          {/* Step 1: AI Tutor Initial Question */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.5, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="rounded-xl p-2.5 sm:p-3 bg-[#1C1A24]/90 border border-[#CEA4F2]/20 shadow-md backdrop-blur-md"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-pulse" />
              <span className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#CEA4F2] font-semibold">
                AI SOCRATIC TUTOR • INQUIRY
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#FEF5E5] font-medium leading-snug">
              "What happens when you try this with an empty list?"
            </p>
            <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-black/50 border border-white/10 font-mono text-[10px] text-[#E6CAA4]">
              items = []
            </div>
          </motion.div>

          {/* Step 2: Learner Reasoning Response */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.5, x: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="rounded-xl p-2.5 sm:p-3 bg-[#141418]/90 border border-white/10 shadow-md backdrop-blur-md ml-3 sm:ml-5"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#10B981] font-semibold">
                LEARNER REASONING
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#EDE4D8] font-normal leading-snug">
              "It returns zero because there are no items to accumulate."
            </p>
          </motion.div>

          {/* Step 3: AI Follow-Up Probe */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.5, x: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
            className="rounded-xl p-2.5 sm:p-3 bg-[#1C1A24]/90 border border-[#CEA4F2]/25 shadow-md backdrop-blur-md"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6CAA4]" />
              <span className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#E6CAA4] font-semibold">
                AI FOLLOW-UP • BOUNDARY CHECK
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#FEF5E5] font-medium leading-snug">
              "Good. What would happen if the input were missing altogether?"
            </p>
            <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-black/50 border border-white/10 font-mono text-[10px] text-[#E6CAA4]">
              def summarize(items=None):
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Technical Indicator */}
      <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-white/[0.06] text-[10px] font-mono text-[#CFC2B4]/80">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2]" />
          <span>Active Cognitive Evaluation</span>
        </div>
        <div className="text-[9.5px] text-[#A1A1AA]">
          Rubric: Conceptual Judgment &gt; Syntax Recall
        </div>
      </div>
    </div>
  );
};

export default StorySlideSocraticMethod;
