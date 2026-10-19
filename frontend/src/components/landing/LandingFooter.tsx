import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface LandingFooterProps {
  onExploreCourses: () => void;
  onSignIn: () => void;
  onRequestEarlyAccess?: (email: string) => Promise<void> | void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onExploreCourses,
  onSignIn,
  onRequestEarlyAccess,
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEarlyAccessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedEmail = (formData.get("email") as string)?.trim() || email.trim();

    if (!submittedEmail || !submittedEmail.includes("@") || !submittedEmail.includes(".")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");

      if (onRequestEarlyAccess) {
        await onRequestEarlyAccess(submittedEmail);
      } else {
        // Persist to local storage for authentic lead retention
        try {
          const existing = JSON.parse(localStorage.getItem("certify_early_access") || "[]");
          existing.push({ email: submittedEmail, timestamp: new Date().toISOString() });
          localStorage.setItem("certify_early_access", JSON.stringify(existing));
        } catch {
          // Ignore storage quota/permission errors
        }
        // Brief simulated latency for tactile feedback
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setStatus("success");
      setEmail("");

      // Return to idle state after 5 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch {
      setStatus("error");
      setErrorMessage("Could not submit request. Please try again.");
    }
  };

  return (
    <footer className="relative w-full pt-4 sm:pt-6 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden z-10 font-sans">
      {/* Centered Floating Container - Stretched Horizontally */}
      <div className="max-w-[1360px] mx-auto">
        {/* Outer Metallic Gradient Rim / Bezel (3px padding creates the calibrated metallic border) */}
        <div
          className="relative rounded-[40px] p-[2.5px] sm:p-[3px] transition-all duration-300"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(205, 209, 216, 0.85) 12%, rgba(165, 170, 180, 0.45) 32%, rgba(125, 130, 140, 0.3) 58%, rgba(215, 218, 224, 0.8) 86%, rgba(255, 255, 255, 0.95) 100%)",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 12px 28px -4px rgba(0, 0, 0, 0.16), 0 28px 56px -10px rgba(0, 0, 0, 0.32), 0 45px 90px -20px rgba(0, 0, 0, 0.45)",
          }}
        >
          {/* Inner Liquid Glass Card Surface */}
          <div
            className="relative w-full rounded-[37px] px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14 backdrop-blur-2xl"
            style={{
              background:
                "linear-gradient(150deg, rgba(214, 218, 224, 0.96) 0%, rgba(238, 241, 245, 0.93) 48%, rgba(208, 212, 219, 0.96) 100%)",
              boxShadow:
                "inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -2px 3px 0 rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Top Grid: Brand & Form (Left) vs 3 Columns (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left Column: Brand Identity, Tagline & Request Early Access Form */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                {/* Brand Header with Official Certify Logo Wordmark */}
                <a
                  href="#"
                  className="inline-flex items-center cursor-pointer select-none group"
                  aria-label="Certify Home"
                >
                  <img
                    src="/certify-logo-dark.png"
                    alt="Certify"
                    className="h-[36px] sm:h-[42px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </a>

                {/* Updated Target Footer Sentence */}
                <p className="mt-4 text-[14px] sm:text-[14.5px] text-[#4B5563] leading-relaxed max-w-md">
                  Learn with AI. Demonstrate your skills. Earn a credential that reflects what you know.
                </p>

                {/* Request Early Access Form */}
                <form
                  onSubmit={handleEarlyAccessSubmit}
                  className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full max-w-md"
                >
                  <div className="relative flex-1">
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Your email"
                      required
                      disabled={status === "loading" || status === "success"}
                      className="w-full h-11 px-4 text-sm text-[#111827] placeholder-[#71717A] bg-white/60 hover:bg-white/80 focus:bg-white rounded-full border border-white/85 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all duration-200 disabled:opacity-60"
                    />
                  </div>

                  {/* Early Access Button (replacing Subscribe) */}
                  <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="h-11 px-5 rounded-full bg-[#111116] hover:bg-[#202029] text-white text-sm font-medium tracking-tight shadow-[0_4px_14px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-90 disabled:cursor-default"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Requesting...</span>
                      </>
                    ) : status === "success" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        <span>Access Requested</span>
                      </>
                    ) : (
                      <span>Request early access</span>
                    )}
                  </button>
                </form>

                {/* Form feedback status */}
                {status === "success" && (
                  <p className="mt-2.5 text-xs font-medium text-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>You're on the priority queue. We'll send an invite code shortly.</span>
                  </p>
                )}
                {status === "error" && (
                  <p className="mt-2.5 text-xs font-medium text-red-600 animate-in fade-in duration-200">
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Right Columns: PRODUCT, COMPANY, RESOURCES */}
              <div className="lg:col-span-6 xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-6 pt-2 lg:pt-0">
                {/* Column 1: PRODUCT */}
                <div className="space-y-3.5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                    Product
                  </h4>
                  <ul className="space-y-2.5 text-[14px] text-[#374151]">
                    <li>
                      <button
                        onClick={onExploreCourses}
                        className="hover:text-[#111827] transition-colors duration-150 text-left cursor-pointer"
                      >
                        Features
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onExploreCourses}
                        className="hover:text-[#111827] transition-colors duration-150 text-left cursor-pointer"
                      >
                        Pricing
                      </button>
                    </li>
                    <li>
                      <a
                        href="#pedagogy"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Integrations
                      </a>
                    </li>
                    <li>
                      <a
                        href="#how-it-works"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Changelog
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 2: COMPANY */}
                <div className="space-y-3.5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                    Company
                  </h4>
                  <ul className="space-y-2.5 text-[14px] text-[#374151]">
                    <li>
                      <a
                        href="#manifesto"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#how-it-works"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Work
                      </a>
                    </li>
                    <li>
                      <a
                        href="#pedagogy"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Careers
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={onSignIn}
                        className="hover:text-[#111827] transition-colors duration-150 text-left cursor-pointer"
                      >
                        Contact
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 3: RESOURCES */}
                <div className="space-y-3.5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                    Resources
                  </h4>
                  <ul className="space-y-2.5 text-[14px] text-[#374151]">
                    <li>
                      <a
                        href="#manifesto"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="#faq"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Support
                      </a>
                    </li>
                    <li>
                      <a
                        href="#verification"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Community
                      </a>
                    </li>
                    <li>
                      <a
                        href="#manifesto"
                        className="hover:text-[#111827] transition-colors duration-150 block"
                      >
                        Privacy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Inset Divider Line */}
            <div className="w-full h-px bg-black/[0.08] my-8 sm:my-10" />

            {/* Bottom Bar: Copyright & 4 Social Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-xs text-[#6B7280]">
              <p className="order-2 sm:order-1 text-[13px] font-normal">
                © 2026 Certify. Socratic AI engineering qualification protocol.
              </p>

              {/* 4 Social Pill / Circular Buttons Matching Framer Reference */}
              <div className="order-1 sm:order-2 flex items-center gap-2.5">
                {/* 1. X (Twitter) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Certify on X"
                  className="w-9 h-9 rounded-full bg-white/50 hover:bg-white text-[#374151] hover:text-black border border-white/80 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* 2. Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Certify on Instagram"
                  className="w-9 h-9 rounded-full bg-white/50 hover:bg-white text-[#374151] hover:text-black border border-white/80 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* 3. LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Certify on LinkedIn"
                  className="w-9 h-9 rounded-full bg-white/50 hover:bg-white text-[#374151] hover:text-black border border-white/80 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>

                {/* 4. GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Certify on GitHub"
                  className="w-9 h-9 rounded-full bg-white/50 hover:bg-white text-[#374151] hover:text-black border border-white/80 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
