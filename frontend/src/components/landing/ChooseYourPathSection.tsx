import React from "react";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface ChooseYourPathSectionProps {
  onBeginDiagnostic: () => void;
  onExploreCourses: () => void;
  onSignIn: () => void;
}

export const ChooseYourPathSection: React.FC<ChooseYourPathSectionProps> = ({
  onBeginDiagnostic,
  onExploreCourses,
  onSignIn,
}) => {
  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
            Choose Your Learning Path
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Start with zero-stakes baseline calibration, or dive straight into deep Socratic mastery and formal qualification.
          </p>
        </div>

        {/* 3 Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Path 1: Baseline Diagnostic */}
          <BulgeCard className="rounded-3xl bg-gradient-to-b from-[#1C1C20]/90 via-[#141416]/88 to-[#0E0E10]/92 border border-white/12 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl text-[#FEF5E5]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#CEA4F2] font-semibold block mb-2">
                Phase 01 // Calibration
              </span>
              <h3 className="font-['Newsreader',Georgia,serif] text-2xl text-[#FEF5E5] mb-3">
                Diagnostic Assessment
              </h3>
              <p className="text-sm text-[#D1D5DB] leading-relaxed mb-6">
                Take a quick 7-minute Socratic dialogue session. Calibrate your baseline knowledge curve and identify missing prerequisites.
              </p>

              <ul className="space-y-3 text-xs font-mono text-[#FEF5E5] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Free zero-stakes diagnostic
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> No password or setup needed
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Immediate Bayesian skill profile
                </li>
              </ul>
            </div>

            <button
              onClick={onBeginDiagnostic}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#FEF5E5] text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/15 shadow-md"
            >
              <span>Begin Free Diagnostic</span>
              <span className="text-[#E6CAA4]">→</span>
            </button>
          </BulgeCard>

          {/* Path 2: Socratic Learning Studio (Highlighted) */}
          <BulgeCard
            className="rounded-3xl bg-gradient-to-b from-[#222228]/95 via-[#18181C]/92 to-[#101013]/95 border-2 border-white/25 backdrop-blur-xl p-8 flex flex-col justify-between shadow-2xl relative text-[#FEF5E5]"
            highlightColor="rgba(255, 255, 255, 0.15)"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white text-[#111827] font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#E6CAA4] font-semibold block mb-2 mt-1">
                Phase 02 // Mastery
              </span>
              <h3 className="font-['Newsreader',Georgia,serif] text-2xl text-[#FEF5E5] mb-3">
                AI Learning Studio
              </h3>
              <p className="text-sm text-[#D1D5DB] leading-relaxed mb-6">
                Full access to curated curriculum tracks, real-time Socratic partner dialogues, adaptive remediation, and live code sandboxes.
              </p>

              <ul className="space-y-3 text-xs font-mono text-[#FEF5E5] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Socratic AI tutor on every chapter
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Automated unit invariant sandboxes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Misconception targeted remediation
                </li>
              </ul>
            </div>

            <button
              onClick={onExploreCourses}
              className="w-full py-3.5 rounded-xl bg-white text-[#111827] hover:bg-[#F3F4F6] text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-transparent"
            >
              <span>Explore Curriculum Tracks</span>
              <span className="text-[#111827]">→</span>
            </button>
          </BulgeCard>

          {/* Path 3: Formal Engineering Qualification */}
          <BulgeCard className="rounded-3xl bg-gradient-to-b from-[#1C1C20]/90 via-[#141416]/88 to-[#0E0E10]/92 border border-white/12 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl text-[#FEF5E5]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#CEA4F2] font-semibold block mb-2">
                Phase 03 // Certification
              </span>
              <h3 className="font-['Newsreader',Georgia,serif] text-2xl text-[#FEF5E5] mb-3">
                Formal Defense &amp; Credential
              </h3>
              <p className="text-sm text-[#D1D5DB] leading-relaxed mb-6">
                Comprehensive final chapter evaluation, adversarial code tests, oral viva cross-examination, and an Ed25519 signed dossier.
              </p>

              <ul className="space-y-3 text-xs font-mono text-[#FEF5E5] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Oral viva capstone defense
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Deterministic mastery tiering
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span> Immutable digital credential link
                </li>
              </ul>
            </div>

            <button
              onClick={onSignIn}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#FEF5E5] text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/15 shadow-md"
            >
              <span>Sign In to Access Chamber</span>
              <span className="text-[#E6CAA4]">→</span>
            </button>
          </BulgeCard>
        </div>
      </div>
    </section>
  );
};
