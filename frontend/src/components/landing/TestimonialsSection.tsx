import React, { useRef, useState } from "react";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface ExperienceReport {
  id: string;
  cohort: string;
  focusTrack: string;
  quote: string;
  vivaChallenge: string;
  outcome: string;
}

const EXPERIENCE_REPORTS: ExperienceReport[] = [
  {
    id: "rep-01",
    cohort: "Cohort 2026.A — Systems Track",
    focusTrack: "Python Memory & Concurrency",
    quote:
      "Unlike conventional platforms where I could just watch videos at 2x speed, Certify interrupted me the moment I wrote code with an unclosed generator frame. The oral defense probed why I chose a generator over an eager list, forcing me to justify memory allocations.",
    vivaChallenge: "Defended generator frame stack teardown vs list comprehension trade-offs.",
    outcome: "Certified Advanced Tier",
  },
  {
    id: "rep-02",
    cohort: "Cohort 2026.B — Core CS Track",
    focusTrack: "Data Structures & Invariants",
    quote:
      "The practical sandbox didn't just check if my code outputted the right value on test case 1; it ran invariant assertions checking algorithmic time complexity and hash collision resilience under adversarial inputs.",
    vivaChallenge: "Defended dynamic hash bucket resizing against quadratic degradation.",
    outcome: "Certified Proficient Tier",
  },
  {
    id: "rep-03",
    cohort: "Cohort 2026.C — Systems Architecture",
    focusTrack: "Distributed Protocols & Consensus",
    quote:
      "When I sent my credential verification link to hiring managers, they could click directly into the atomic ledger to see the exact oral viva questions I answered and unit tests my solution passed.",
    vivaChallenge: "Defended split-brain partition tolerance under quorum minority.",
    outcome: "Certified Advanced Tier",
  },
];

export const TestimonialsSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : EXPERIENCE_REPORTS.length - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < EXPERIENCE_REPORTS.length - 1 ? prev + 1 : 0));
  };

  const current = EXPERIENCE_REPORTS[activeIdx];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
            How Learners Experience the Standard
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Reflections from candidates who have completed the Socratic dialogue, code sandboxes, and oral defense capstone.
          </p>
        </div>

        {/* Carousel Container */}
        <div ref={containerRef} className="relative">
          <BulgeCard className="rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] p-8 sm:p-12 shadow-2xl relative text-[#22120B]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#DFCDBB] pb-6 mb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#5D3B75] font-semibold block mb-1">
                  {current.cohort}
                </span>
                <span className="font-mono text-sm text-[#22120B] font-bold">
                  {current.focusTrack}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#276A47] font-mono text-xs font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#276A47] animate-pulse" />
                {current.outcome}
              </div>
            </div>

            <p className="font-['Newsreader',Georgia,serif] text-xl sm:text-2xl text-[#22120B] italic leading-relaxed mb-8">
              "{current.quote}"
            </p>

            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#DFCDBB] text-xs font-mono text-[#5C4538] space-y-1 shadow-xs">
              <span className="text-[#8B7568] uppercase block text-[10px] tracking-wider font-semibold">
                Defended Oral Capstone Topic:
              </span>
              <p className="text-[#22120B] font-medium">{current.vivaChallenge}</p>
            </div>
          </BulgeCard>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-2">
              {EXPERIENCE_REPORTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${activeIdx === i ? "w-8 bg-[#DCA86A]" : "w-2 bg-[#5A3825]"
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] flex items-center justify-center text-[#24130D] hover:bg-[#F2E5D5] transition-colors cursor-pointer shadow-sm"
                aria-label="Previous report"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] flex items-center justify-center text-[#24130D] hover:bg-[#F2E5D5] transition-colors cursor-pointer shadow-sm"
                aria-label="Next report"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
