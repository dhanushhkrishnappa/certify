import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Plus, ArrowUpRight, ShieldCheck, Clock } from "lucide-react";

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

/**
 * FAQ 9 Block from React Bits Pro
 * Configured with strict single-open accordion behavior, dual-column alignment,
 * and authoritative, professional Certify academic qualification content.
 */
const CERTIFY_FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-01",
    category: "pedagogy",
    question: "How does the Socratic dialogue method evaluate engineering competence?",
    answer:
      "Rather than relying on passive video lectures or multiple-choice quizzes, Certify employs dialectical Socratic interrogation. The tutor challenges your architectural decisions, introduces runtime edge cases, and tests state invariants in real-time execution environments. Candidates must defend their reasoning from first principles before concept mastery is awarded.",
  },
  {
    id: "faq-02",
    category: "credentials",
    question: "What cryptographic standards secure the issued credentials?",
    answer:
      "Every certificate is cryptographically signed using asymmetric Ed25519 keypairs and verified against an immutable SHA-256 hash digest of the candidate's complete assessment evidence. Public dossier URLs allow hiring managers and university committees to verify the record without paywalls, accounts, or proprietary third-party validators.",
  },
  {
    id: "faq-03",
    category: "assessment",
    question: "How does the Oral AI Viva Defense work?",
    answer:
      "The Viva Chamber simulates an authentic university thesis defense. Candidates are questioned on algorithmic invariants, memory lifecycle tradeoffs, and failure recovery mechanics under strict academic rubrics. Spoken and written defenses are recorded directly into the verifiable evidence dossier.",
  },
  {
    id: "faq-04",
    category: "pedagogy",
    question: "What role does Bayesian Knowledge Tracing (BKT) play in learning?",
    answer:
      "The platform implements probabilistic Bayesian Knowledge Tracing to continuously calculate the latent probability of mastery across every syllabus node. The engine estimates prior knowledge, slip rates, and guess probabilities to dynamically route learners toward genuine conceptual gaps rather than redundant exercises.",
  },
  {
    id: "faq-05",
    category: "runtime",
    question: "How is code execution verified for safety and determinism?",
    answer:
      "All code submissions execute within isolated ephemeral Linux sandbox environments. Submissions are subjected to property-based tests, memory allocation boundaries, concurrency stress tests, and deterministic runtime assertions rather than heuristic string comparison.",
  },
  {
    id: "faq-06",
    category: "workflow",
    question: "What is the required workflow to access the AI Learning Studio?",
    answer:
      "To ensure structured progression, learners must first explore the course catalog, review the complete module curriculum and syllabus objectives, and complete formal course enrollment. Once enrolled, the candidate gains continuous access to the dedicated Socratic Studio, module invariant tests, and the comprehensive final viva.",
  },
  {
    id: "faq-07",
    category: "verification",
    question: "What evidence is made available to employers and academic institutions?",
    answer:
      "Each credential links to a permanent verification dossier containing the candidate's complete codebase, automated test suite passes, Bayesian mastery distribution metrics across all competencies, and full Viva examination transcripts.",
  },
  {
    id: "faq-08",
    category: "institutional",
    question: "Can academic departments or enterprises license the Certify platform?",
    answer:
      "Yes. Universities and engineering organizations integrate Certify for prerequisite qualification, technical placement screening, and internal leveling benchmarks. Institutional portals provide cohort telemetry, custom curriculum authoring, and private verification nodes.",
  },
];

export const FaqSection: React.FC = () => {
  // Strict accordion behavior: only one card open at any time
  const [openId, setOpenId] = useState<string | null>("faq-01");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Divide into two balanced columns to prevent row-stretching and maintain clean vertical flow
  const column1 = CERTIFY_FAQ_ITEMS.filter((_, idx) => idx % 2 === 0);
  const column2 = CERTIFY_FAQ_ITEMS.filter((_, idx) => idx % 2 === 1);

  const renderCard = (item: FaqItem) => {
    const isOpen = openId === item.id;

    return (
      <div
        key={item.id}
        className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
          isOpen
            ? "bg-[#141418]/95 border-white/[0.14] shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
            : "bg-[#111114]/70 border-white/[0.07] hover:border-white/[0.12] hover:bg-[#15151a]/85 shadow-sm"
        }`}
      >
        {/* Header Button */}
        <button
          type="button"
          onClick={() => toggleItem(item.id)}
          aria-expanded={isOpen}
          className="w-full p-5 sm:p-5.5 text-left flex items-start justify-between gap-3.5 cursor-pointer focus:outline-none select-none"
        >
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] sm:text-[15.5px] font-semibold text-[#FEF5E5] leading-snug">
            {item.question}
          </span>
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 ${
              isOpen
                ? "bg-white/[0.10] border-white/20 text-white rotate-45"
                : "bg-white/[0.03] border-white/[0.06] text-zinc-400 rotate-0"
            }`}
          >
            <Plus className="w-4 h-4" />
          </div>
        </button>

        {/* Expandable Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 text-[13.5px] sm:text-sm text-zinc-400 leading-relaxed font-sans border-t border-white/[0.04]">
                {item.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section
      id="faq"
      className="relative pt-20 sm:pt-28 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-left mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-mono text-purple-300 uppercase tracking-widest mb-4">
            <span>Platform Specification • Protocol FAQ</span>
          </div>
          <h2 className="font-sans font-bold text-3xl sm:text-5xl lg:text-6xl text-[#FEF5E5] font-normal tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 mt-3 max-w-2xl leading-relaxed font-sans">
            Authoritative technical details regarding Socratic pedagogy, oral viva defenses, Bayesian modeling, and cryptographic verification.
          </p>
        </div>

        {/* 2-Column Layout: Sticky Contact Panel (Left) & FAQ Columns (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Sticky Contact Panel */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <div className="rounded-3xl border border-white/[0.08] bg-[#111114]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              {/* Subtle Ambient Radial Highlight */}
              <div
                className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-5">
                <h3 className="font-sans font-bold text-2xl sm:text-3xl text-[#FEF5E5] font-normal leading-snug">
                  Academic & Institutional Inquiries
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans font-normal">
                  For university partnerships, enterprise verification pipelines, or technical syllabus inquiries, contact the Certify Academic Secretariat.
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Response</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#FEF5E5] tracking-tight">
                      &lt; 4h
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Secretariat review
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Security</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#FEF5E5] tracking-tight">
                      100%
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Cryptographic uptime
                    </div>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-2">
                  <a
                    href="mailto:academic@certify.edu?subject=Institutional%20Inquiry%20regarding%20Certify%20Platform"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer group/btn"
                  >
                    <Mail className="w-4 h-4 text-black" />
                    <span>Contact Academic Secretariat</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                  <p className="text-[11px] text-zinc-500 text-center mt-2.5 font-normal">
                    Academic Secretariat hours: 09:00–18:00 UTC.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: 2 Independent Columns for Clean Height & Flow */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4.5 items-start">
              {/* Column 1 */}
              <div className="flex flex-col gap-4 sm:gap-4.5">
                {column1.map(renderCard)}
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4 sm:gap-4.5">
                {column2.map(renderCard)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
