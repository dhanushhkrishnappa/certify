import React, { useRef, useEffect } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "../../motion/motionVocabulary.js";
import { BulgeCard } from "./webgl/BulgeCard.js";
import { SandboxTerminalSvg, VivaChamberWaveformSvg, CryptographicSealSvg } from "../motion/ProofGraphics.js";

export const ProofBentoSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bento-item",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
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
      className="relative py-24 px-4 sm:px-6 lg:px-12 bg-[#170C06] border-t border-[#3E2416] overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
              Six Pillars of Defensible Understanding
            </h2>
          </div>
          <p className="text-[15px] text-[#CFC2B4] max-w-md leading-relaxed">
            Certify replaces multiple-choice trivia with deep conversational inquiry, real unit invariant assertions, oral capstones, and cryptographic credentials.
          </p>
        </div>

        {/* Bento Grid (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: AI-Guided Socratic Inquiry */}
          <div className="bento-item">
            <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#C59B27] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#24130D] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8C6D58]">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] flex items-center justify-center text-[#5D3B75]">
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                  </div>
                </div>
                <h3 className="text-[19px] font-bold text-[#22120B] mb-2 font-['Newsreader',Georgia,serif]">
                  AI-Guided Socratic Inquiry
                </h3>
                <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                  Engage in deep technical dialogues where the AI tutor identifies subtle misconceptions, questions your architecture, and leads you toward first-principles clarity.
                </p>
              </div>

              {/* Socratic Signal Preview */}
              <div className="p-3.5 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] font-mono text-[11px] text-[#5C4538] space-y-1.5">
                <div className="text-[#5D3B75] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5D3B75] animate-pulse" />
                  Socratic Query
                </div>
                <p className="italic text-[#4A3225]">
                  "What invariant breaks if we mutate state inside a generator yield?"
                </p>
              </div>
            </BulgeCard>
          </div>

          {/* Card 2: Adaptive Practice */}
          <div className="bento-item">
            <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#C59B27] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#24130D] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8C6D58]">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] flex items-center justify-center text-[#8C5835]">
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                  </div>
                </div>
                <h3 className="text-[19px] font-bold text-[#22120B] mb-2 font-['Newsreader',Georgia,serif]">
                  Adaptive Concept Mastery
                </h3>
                <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                  Every concept is modeled individually. If you struggle with closure cells, the curriculum adapts practice tasks until proof of mastery converges.
                </p>
              </div>

              {/* Adaptive Progress Meters */}
              <div className="p-3.5 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-[#5C4538]">Memory References</span>
                    <span className="text-emerald-700 font-bold">96%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#DECBB7] overflow-hidden">
                    <div className="h-full bg-emerald-600 w-[96%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-[#5C4538]">Frame Call Stacks</span>
                    <span className="text-[#8C5835] font-bold">84%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#DECBB7] overflow-hidden">
                    <div className="h-full bg-[#8C5835] w-[84%]" />
                  </div>
                </div>
              </div>
            </BulgeCard>
          </div>

          {/* Card 3: Practical Code Sandboxes */}
          <div className="bento-item">
            <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#C59B27] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#24130D] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8C6D58]">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] flex items-center justify-center text-emerald-700">
                    <span className="material-symbols-outlined text-[20px]">terminal</span>
                  </div>
                </div>
                <h3 className="text-[19px] font-bold text-[#22120B] mb-2 font-['Newsreader',Georgia,serif]">
                  Practical Sandboxes
                </h3>
                <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                  Automated test suites and invariant validation executed inside isolated code execution environments with real unit test assertions.
                </p>
              </div>

              <div>
                <SandboxTerminalSvg />
              </div>
            </BulgeCard>
          </div>

          {/* Card 4: Oral Viva Defense */}
          <div className="bento-item">
            <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#C59B27] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#24130D] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8C6D58]">04</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] flex items-center justify-center text-[#5D3B75]">
                    <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                  </div>
                </div>
                <h3 className="text-[19px] font-bold text-[#22120B] mb-2 font-['Newsreader',Georgia,serif]">
                  Oral Viva Defense
                </h3>
                <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                  Multi-turn Socratic oral defense simulating an authentic faculty committee probing your design choices, trade-offs, and boundary assumptions.
                </p>
              </div>

              <div>
                <VivaChamberWaveformSvg />
              </div>
            </BulgeCard>
          </div>

          {/* Card 5: Proof of Understanding */}
          <div className="bento-item">
            <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#C59B27] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#24130D] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8C6D58]">05</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] flex items-center justify-center text-[#8C5835]">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                </div>
                <h3 className="text-[19px] font-bold text-[#22120B] mb-2 font-['Newsreader',Georgia,serif]">
                  Atomic Evidence Trail
                </h3>
                <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                  Every interaction, practice test, and oral response compiles into a verified evidence trail that stands up to peer and employer scrutiny.
                </p>
              </div>

              {/* Evidence Flow Stepper */}
              <div className="p-3.5 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-[#4A3225] font-semibold">
                  <span>INTERACTION</span>
                  <span className="text-[#8C6D58]">→</span>
                  <span>PRACTICE</span>
                  <span className="text-[#8C6D58]">→</span>
                  <span>VIVA</span>
                </div>
                <div className="h-1.5 bg-[#DECBB7] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#5D3B75] to-[#8C5835] w-full" />
                </div>
                <div className="text-[10px] text-emerald-700 font-bold text-right">
                  Dossier Validated ✓
                </div>
              </div>
            </BulgeCard>
          </div>

          {/* Card 6: Cryptographic Credential */}
          <div className="bento-item">
            <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#C59B27] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#24130D] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8C6D58]">06</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE3D2] border border-[#DECBB7] flex items-center justify-center text-[#8C5835]">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                </div>
                <h3 className="text-[19px] font-bold text-[#22120B] mb-2 font-['Newsreader',Georgia,serif]">
                  Audited Certification
                </h3>
                <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                  Verifiable credential dossier backed by accumulated chapter-level evidence, Ed25519 digital signature, and deterministic tiering rules.
                </p>
              </div>

              <div>
                <CryptographicSealSvg />
              </div>
            </BulgeCard>
          </div>
        </div>
      </div>
    </section>
  );
};
