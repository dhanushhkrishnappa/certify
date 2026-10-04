import React, { useRef, useEffect } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "../../motion/motionVocabulary.js";

interface GalleryCard {
  step: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  accent: string;
  codeSnippet?: string;
  stats: { label: string; value: string }[];
}

const GALLERY_ITEMS: GalleryCard[] = [
  {
    step: "01",
    title: "Socratic AI Mentorship",
    tagline: "Probing first-principles reasoning",
    description:
      "Learners converse directly with a pedagogical engine that rejects superficial recall. Every prompt challenges memory boundaries, concurrency race conditions, and computational complexity.",
    badge: "SOCRATIC INQUIRY",
    accent: "#CEA4F2",
    codeSnippet: `// Socratic State Engine
const probe = tutor.evaluate({
  hypothesis: candidate.reasoning,
  boundaryChecks: ['heap_escape', 'cell_mutation']
});
assert(probe.rigorLevel === 'ADVANCED');`,
    stats: [
      { label: "P(L) Accuracy", value: "99.2%" },
      { label: "Probe Cadence", value: "Dynamic" },
    ],
  },
  {
    step: "02",
    title: "Isolated Code Sandboxes",
    tagline: "Real Python 3.11 Invariant Execution",
    description:
      "No pseudo-code mocks. Code executes in isolated sandboxes with strict limits on memory, execution time, and system calls. Unit assertions confirm structural invariants.",
    badge: "ISOLATED SANDBOX",
    accent: "#34D399",
    codeSnippet: `def test_closure_immutability():
    counter = make_counter(initial=10)
    assert counter() == 11
    # Verify free variable heap allocation
    assert len(counter.__closure__) == 1
    assert isinstance(counter.__closure__[0].cell_contents, int)`,
    stats: [
      { label: "Unit Invariants", value: "14/14" },
      { label: "Execution Time", value: "3.2ms" },
    ],
  },
  {
    step: "03",
    title: "AI Oral Viva Defense",
    tagline: "Live Architectural Cross-Examination",
    description:
      "Before certification, candidates enter the Viva Chamber. An expert AI examiner cross-examines implementation trade-offs, scalability bottlenecks, and failure modes.",
    badge: "ORAL VIVA",
    accent: "#E6CAA4",
    codeSnippet: `Examiner: "Why did you choose an LRU cache over a LFU frequency map here?"
Candidate: "LRU guarantees O(1) eviction with a doubly-linked hash map, avoiding frequency rebalancing overhead."
Status: DEFENDED ✓`,
    stats: [
      { label: "Viva Turns", value: "2–4" },
      { label: "Rubric Bar", value: "100% Blind" },
    ],
  },
  {
    step: "04",
    title: "Cryptographic Credential",
    tagline: "Immutable Proof of Demonstrated Competence",
    description:
      "A permanent, Ed25519 digitally signed qualification record. Employers can inspect the atomic evidence trail—including all code submissions and oral defense transcripts.",
    badge: "ED25519 VERIFIED",
    accent: "#F3DEBE",
    codeSnippet: `// Public Verification Payload
{
  "credentialId": "CERT-2026-PY-001842",
  "tier": "ADVANCED_MASTERY",
  "digitalSignature": "ed25519:8f9a2b...4c1d",
  "verificationUrl": "https://certify.edu/verify/CERT-2026-PY-001842"
}`,
    stats: [
      { label: "Signature", value: "Ed25519" },
      { label: "Public Access", value: "Zero Paywall" },
    ],
  },
];

export const ImageRevealGallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".gallery-row");

      items.forEach((item, i) => {
        const visual = item.querySelector(".gallery-visual");
        const content = item.querySelector(".gallery-content");

        gsap.fromTo(
          visual,
          {
            clipPath: i % 2 === 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
            scale: 1.08,
            opacity: 0,
          },
          {
            clipPath: "inset(0 0% 0 0)",
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: MOTION_EASING.expoOut,
            scrollTrigger: {
              trigger: item,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );

        gsap.fromTo(
          content,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: MOTION_EASING.expoOut,
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, galleryRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={galleryRef}
      className="relative py-28 px-4 sm:px-6 lg:px-12 bg-[#1A0D07] border-t border-[#3E2416] overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl md:text-6xl text-[#FEF5E5] font-normal leading-tight">
            How Certify Verifies Every Dimension
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Scroll through the four architectural milestones required to earn an autonomous Certify qualification.
          </p>
        </div>

        {/* Alternating Gallery Rows */}
        <div className="space-y-24">
          {GALLERY_ITEMS.map((item, idx) => {
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={item.step}
                className={`gallery-row flex flex-col ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center gap-10 lg:gap-16`}
              >
                {/* Visual / Code Card */}
                <div className="gallery-visual w-full lg:w-1/2 rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] p-6 sm:p-8 shadow-xl overflow-hidden relative group text-[#22120B]">
                  {/* Subtle Top Accent Glow */}
                  <div
                    className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none opacity-15"
                    style={{ backgroundColor: item.accent }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DFCDBB]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E08A7C]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B56F]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#82B895]" />
                    </div>
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#D5C2E8] bg-[#EDE2F5] text-[#5D3B75]">
                      {item.badge}
                    </span>
                  </div>

                  {/* Code Snippet Box */}
                  <pre className="font-mono text-xs text-[#EDE4D8] leading-relaxed overflow-x-auto p-4 rounded-xl bg-[#160B06] border border-[#3E2416] shadow-inner">
                    <code>{item.codeSnippet}</code>
                  </pre>

                  {/* Mini Stats Bar */}
                  <div className="mt-4 pt-3 border-t border-[#DFCDBB] flex items-center justify-between text-xs font-mono">
                    {item.stats.map((st) => (
                      <div key={st.label} className="flex items-center gap-1.5">
                        <span className="text-[#5C4538]">{st.label}:</span>
                        <span className="text-[#22120B] font-bold">{st.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content description */}
                <div className="gallery-content w-full lg:w-1/2 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-[#E6CAA4]">
                      {item.step}
                    </span>
                    <span className="h-px w-10 bg-[#5A3825]" />
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A89682]">
                      {item.tagline}
                    </span>
                  </div>

                  <h3 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-4xl text-[#FEF5E5] font-normal leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-[15px] sm:text-[16px] text-[#D5C4B1] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
