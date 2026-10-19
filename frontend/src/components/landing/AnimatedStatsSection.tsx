import React, { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger, MOTION_EASING, prefersReducedMotion } from "../../motion/motionVocabulary.js";

interface StatItem {
  id: string;
  targetNumber: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description: string;
}

const STATS: StatItem[] = [
  {
    id: "signals",
    targetNumber: 6,
    label: "Core Evidence Signals",
    description: "Multi-layered validation across conceptual mastery, dialogue, code sandboxes, and oral viva.",
  },
  {
    id: "journey",
    targetNumber: 1,
    label: "Continuous Learning Journey",
    description: "Socratic guidance and verification fused into a single seamless engineering flow.",
  },
  {
    id: "invariants",
    targetNumber: 14,
    suffix: "+",
    label: "Unit Invariant Checks",
    description: "Strict memory layout, type safety, and time complexity assertions executed per module.",
  },
  {
    id: "defensibility",
    targetNumber: 100,
    suffix: "%",
    label: "Defensible Verification",
    description: "Deterministic backend tiering rules backed by Ed25519 cryptographic signatures.",
  },
];

export const AnimatedStatsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>(() =>
    prefersReducedMotion()
      ? { signals: 6, journey: 1, invariants: 14, defensibility: 100 }
      : { signals: 0, journey: 0, invariants: 0, defensibility: 0 }
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 82%",
        onEnter: () => {
          STATS.forEach((stat) => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: stat.targetNumber,
              duration: 1.6,
              ease: MOTION_EASING.expoOut,
              onUpdate: () => {
                setCounts((prev) => ({
                  ...prev,
                  [stat.id]: Math.round(obj.val),
                }));
              },
            });
          });
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative pt-6 sm:pt-8 pb-14 sm:pb-18 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((st) => (
            <div
              key={st.id}
              className="p-7 rounded-2xl bg-gradient-to-b from-[#1C1C20]/90 via-[#141416]/88 to-[#0E0E10]/92 border border-white/12 hover:border-white/25 backdrop-blur-xl shadow-xl flex flex-col justify-between text-[#FEF5E5] hover:shadow-2xl transition-all"
            >
              <div>
                <div className="font-['Newsreader',Georgia,serif] text-5xl sm:text-6xl text-[#FEF5E5] font-normal leading-none mb-3">
                  {st.prefix}
                  {counts[st.id]}
                  {st.suffix}
                </div>

                <h4 className="font-mono text-sm font-semibold text-[#CEA4F2] mb-2 uppercase tracking-wide">
                  {st.label}
                </h4>
              </div>

              <p className="text-xs text-[#D1D5DB] leading-relaxed mt-4 pt-3 border-t border-white/10">
                {st.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
