import React, { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-01",
    question: "What is CERTIFY and how does it differ from traditional online platforms?",
    answer:
      "Most online platforms certify passive attendance—such as letting videos play in background tabs or guessing multiple-choice quizzes. CERTIFY is a Socratic learning protocol that evaluates genuine understanding. Through active AI dialogues, code sandboxes with invariant tests, and oral viva defenses, CERTIFY ensures you understand first principles before granting a credential.",
  },
  {
    id: "faq-02",
    question: "How does the Socratic AI tutor probe my understanding?",
    answer:
      "Instead of lecturing, the AI tutor asks probing architectural questions. When you propose a solution, it tests boundary conditions, concurrency invariants, and memory trade-offs. The engine maintains a Bayesian knowledge tracer per concept, adapting the conversation until misconceptions are completely resolved.",
  },
  {
    id: "faq-03",
    question: "What makes the CERTIFY credential verifiable?",
    answer:
      "Each credential is cryptographically signed using Ed25519 digital signatures and hosted on an immutable dossier URL. Anyone—such as an employer or admissions officer—can verify the candidate's exact oral defense transcript, practical sandbox test passes, and Bayesian mastery ratings with zero login or paywall.",
  },
  {
    id: "faq-04",
    question: "How does the Oral Viva Defense work?",
    answer:
      "The Viva Chamber simulates an authentic engineering thesis defense. An AI examiner presents trade-off dilemmas and asks you to justify your code implementation (e.g., explaining why a generator preserves O(1) memory or defending algorithmic complexity). Your spoken or written defense is evaluated against rigorous academic rubrics.",
  },
  {
    id: "faq-05",
    question: "What happens if I encounter challenging concepts or fail an invariant check?",
    answer:
      "Certify pairs you with an interactive Socratic AI Tutor embedded inside every lesson. Instead of punitive failure, the tutor explores your mental model, runs targeted counter-examples in your browser sandbox, and guides you to the correct architectural intuition.",
  },
  {
    id: "faq-06",
    question: "Which engineering courses are currently available?",
    answer:
      "Our flagship track is Python Fundamentals: Deep Architecture (CPython memory models, closures, generators, and bytecode). We also offer tracks in Web Development Foundations, Data Structures & Problem Solving, GenAI & LLM Application Engineering, and SQL & Relational Database Architecture.",
  },
  {
    id: "faq-07",
    question: "How do I begin learning on Certify?",
    answer:
      "Simply choose any course from the curriculum catalog and start working through its structured interactive modules. Each lesson incorporates theory overviews, key objectives, real-time code execution, and oral viva readiness checks.",
  },
  {
    id: "faq-08",
    question: "Does CERTIFY replace university computer science curricula?",
    answer:
      "CERTIFY complements academic rigor by enforcing practical invariant verification and oral defense. Many students use Certify to prepare for high-stakes technical interviews and university thesis defenses.",
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>("faq-01");

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="relative pt-12 sm:pt-16 pb-14 sm:pb-18 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
            Understanding the Protocol
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Everything you need to know about the Socratic pedagogy, oral viva examinations, and cryptographic credentials.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? "bg-gradient-to-b from-[#1C1C22]/95 via-[#141418]/92 to-[#0E0E11]/96 border-white/[0.12] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.9)] text-[#FEF5E5]"
                    : "bg-gradient-to-b from-[#16161B]/80 to-[#101013]/80 border-white/[0.06] hover:border-white/[0.10] shadow-sm text-[#FEF5E5]"
                }`}
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-['Newsreader',Georgia,serif] text-lg sm:text-xl text-[#FEF5E5] font-normal">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white shrink-0 transition-transform duration-300 shadow-xs ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      expand_more
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-[14.5px] text-[#D1D5DB] leading-relaxed border-t border-white/[0.06] animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
