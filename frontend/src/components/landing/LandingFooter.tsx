import React from "react";

interface LandingFooterProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
  onSignIn: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
  onSignIn,
}) => {
  return (
    <footer className="relative bg-[#0B0503]/80 backdrop-blur-md pt-16 pb-12 px-6 lg:px-12 text-[#A89682]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2C180E]">
          {/* Brand & Manifesto Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/certify-icon.png"
                alt="Certify"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-[#FEF5E5] leading-none font-sans">
                  Certify
                </span>
                <span className="text-[8.5px] font-bold tracking-[0.2em] text-[#C7B299] uppercase mt-1">
                  LEARN • DEMONSTRATE • EARN
                </span>
              </div>
            </div>

            <p className="text-sm text-[#CFC2B4] leading-relaxed max-w-sm">
              The Socratic AI engineering qualification protocol. Moving beyond passive completion to defensible, cryptographically verified competency.
            </p>

            <div className="text-xs font-mono text-[#8A7969] pt-2">
              Ed25519 Cryptographic Ledger • Deterministic Tiering
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#E6CAA4]">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#how-it-works" className="hover:text-[#FEF5E5] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <button
                  onClick={onExploreCourses}
                  className="hover:text-[#FEF5E5] transition-colors text-left cursor-pointer"
                >
                  Curriculum Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={onBeginDiagnostic}
                  className="hover:text-[#FEF5E5] transition-colors text-left cursor-pointer"
                >
                  Baseline Diagnostic
                </button>
              </li>
              <li>
                <a href="#pedagogy" className="hover:text-[#FEF5E5] transition-colors">
                  Proof Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#E6CAA4]">
              Protocol
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#manifesto" className="hover:text-[#FEF5E5] transition-colors">
                  Manifesto
                </a>
              </li>
              <li>
                <a href="#pedagogy" className="hover:text-[#FEF5E5] transition-colors">
                  Socratic Standard
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#FEF5E5] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <button
                  onClick={onSignIn}
                  className="hover:text-[#FEF5E5] transition-colors text-left cursor-pointer"
                >
                  Chamber Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Verification */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#E6CAA4]">
              Verification
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-[#8A7969] block">Ed25519 Public Keys</span>
              </li>
              <li>
                <span className="text-[#8A7969] block">Atomic Ledger Dossiers</span>
              </li>
              <li>
                <span className="text-[#8A7969] block">Zero-Paywall Verification</span>
              </li>
              <li>
                <span className="text-emerald-400 block font-bold">Protocol Status: LIVE</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8A7969]">
          <p>© 2026 CERTIFY Protocol. Deterministic, evidence-backed mastery verification.</p>
          <div className="flex items-center gap-6">
            <a href="#manifesto" className="hover:text-[#CFC2B4] transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#manifesto" className="hover:text-[#CFC2B4] transition-colors">
              Terms of Protocol
            </a>
            <span>•</span>
            <a href="#faq" className="hover:text-[#CFC2B4] transition-colors">
              Academic Integrity
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
