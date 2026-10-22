import React from "react";
import { motion } from "motion/react";

interface StorySlideGapProps {
  isActive: boolean;
}

export const StorySlideGap: React.FC<StorySlideGapProps> = ({ isActive }) => {
  const checkpoints = [
    {
      id: "watch",
      label: "WATCH",
      sublabel: "Passive Ingestion",
      status: "COMPLETED",
      desc: "Video finished. Illusion of mastery.",
      icon: "✓",
      isComplete: true,
      color: "#10B981",
    },
    {
      id: "explain",
      label: "EXPLAIN",
      sublabel: "Socratic Inquiry",
      status: "CRITICAL GAP",
      desc: "Articulate the underlying principle.",
      icon: "02",
      isComplete: false,
      color: "#CEA4F2",
    },
    {
      id: "apply",
      label: "APPLY",
      sublabel: "Practical Synthesis",
      status: "UNTESTED",
      desc: "Solve edge cases without syntax aids.",
      icon: "03",
      isComplete: false,
      color: "#E6CAA4",
    },
    {
      id: "adapt",
      label: "ADAPT",
      sublabel: "Demonstrated Mastery",
      status: "ADAPTIVE",
      desc: "Retain & transfer knowledge into production.",
      icon: "04",
      isComplete: false,
      color: "#FEF5E5",
    },
  ];

  return (
    <div className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#18171E] via-[#131217] to-[#0D0C10] text-[#FEF5E5] select-none overflow-hidden">
      {/* Ambient Radial Highlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(206,164,242,0.14) 0%, rgba(230,202,164,0.06) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Graphic Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-pulse" />
          <span className="text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] font-semibold">
            LEARNING PATH VERIFICATION
          </span>
        </div>
        <div className="text-[9.5px] font-mono text-[#A1A1AA] uppercase tracking-wider">
          4 CHECKPOINTS
        </div>
      </div>

      {/* Kinetic 4-Checkpoint Path */}
      <div className="relative z-10 my-auto py-2">
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Background Connecting Line */}
          <div className="hidden sm:block absolute top-[24px] left-[12%] right-[12%] h-[2px] bg-white/[0.08] -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-[#10B981] via-[#CEA4F2] to-transparent"
              initial={{ width: "25%" }}
              animate={isActive ? { width: "75%" } : { width: "25%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </div>

          {checkpoints.map((node, index) => {
            const isFirst = index === 0;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 12 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.35 }}
                className={`relative rounded-xl p-2.5 sm:p-3 border transition-all duration-300 ${
                  isFirst
                    ? "bg-[#181C1A]/90 border-emerald-500/30 shadow-[0_4px_16px_rgba(16,185,129,0.12)]"
                    : index === 1
                    ? "bg-[#1A1822]/90 border-[#CEA4F2]/30 shadow-[0_4px_16px_rgba(206,164,242,0.10)]"
                    : "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                {/* Node Top Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold ${
                      isFirst
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : index === 1
                        ? "bg-[#CEA4F2]/20 text-[#CEA4F2] border border-[#CEA4F2]/40 animate-pulse"
                        : "bg-white/10 text-white/60 border border-white/10"
                    }`}
                  >
                    {node.icon}
                  </div>
                  <span
                    className={`text-[8.5px] font-mono uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full ${
                      isFirst
                        ? "bg-emerald-500/15 text-emerald-300"
                        : index === 1
                        ? "bg-[#CEA4F2]/15 text-[#CEA4F2]"
                        : "bg-white/5 text-[#9CA3AF]"
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                {/* Node Title & Sublabel */}
                <div className="text-xs sm:text-[13px] font-semibold tracking-wide text-[#FEF5E5] mb-0.5">
                  {node.label}
                </div>
                <div className="text-[10px] font-mono text-[#E6CAA4]/80 mb-1">
                  {node.sublabel}
                </div>
                <div className="text-[10px] text-[#A1A1AA] leading-snug line-clamp-2">
                  {node.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Concept Fragment Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#CFC2B4]/80">
        <div className="flex items-center gap-1.5">
          <span className="text-[#E6CAA4] font-semibold">COGNITIVE BIAS:</span>
          <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
            Syntax Memorization ≠ Conceptual Judgment
          </span>
        </div>
        <div className="hidden sm:block text-[#A1A1AA]">
          Passive Memory Decays in 48 Hours
        </div>
      </div>
    </div>
  );
};

export default StorySlideGap;
