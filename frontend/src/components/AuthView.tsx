import React, { useState } from "react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";

interface AuthViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [fullName, setFullName] = useState("Dhanush K");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleInstantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthStep(1);
    setStatusMessage("Connecting to secure learning gateway...");

    // Stage 1 -> Stage 2 after 450ms
    setTimeout(() => {
      setAuthStep(2);
      setStatusMessage("Initializing Socratic AI tutor & BKT mastery state...");
    }, 450);

    // Stage 2 -> Stage 3 after 950ms
    setTimeout(() => {
      setAuthStep(3);
      setStatusMessage(`Authenticated as ${fullName || "Learner"} ✓`);
    }, 950);

    // Stage 3 -> Complete after 1350ms
    setTimeout(async () => {
      setAuthStep(4);
      setStatusMessage("Entering learning workspace...");

      try {
        // Attempt authentic login with seeded student account
        const data = await api.login("learner@certify.edu", "Password123!");
        localStorage.setItem("certify_token", data.token);
        const enrichedUser: User = {
          ...data.user,
          fullName: fullName.trim() || data.user.fullName || "Dhanush K",
          name: fullName.trim() || data.user.fullName || "Dhanush K",
        };
        onLoginSuccess(enrichedUser, data.token);
      } catch {
        // Seamless fallback if backend offline or unseeded
        const demoUser: User = {
          id: "u-learner-demo",
          email: "learner@certify.edu",
          fullName: fullName.trim() || "Dhanush K",
          name: fullName.trim() || "Dhanush K",
          role: "STUDENT",
        };
        const demoToken = "demo-token-" + Date.now();
        localStorage.setItem("certify_token", demoToken);
        onLoginSuccess(demoUser, demoToken);
      }
    }, 1350);
  };

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] text-[#FEF5E5] antialiased selection:bg-white/20 selection:text-white">
      {/* Fixed Fullscreen Background Image */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-students.jpg')` }}
      />
      {/* Dark Smoky Ambient Blend Overlay (No brown) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14, 14, 17, 0.75) 0%, rgba(10, 10, 12, 0.70) 50%, rgba(8, 8, 10, 0.88) 100%)",
        }}
      />

      {/* Main Split Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left: Floating Auth Card (Dark Smoky Translucent Surface) */}
        <div className="w-full max-w-md bg-gradient-to-b from-[#1C1C20]/90 via-[#141416]/88 to-[#0E0E10]/92 rounded-3xl p-8 sm:p-10 shadow-2xl relative transition-all duration-300 text-[#FEF5E5] border border-white/12 shrink-0 backdrop-blur-xl">
          {/* Top Brand Identity */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img
                src="/certify-logo.png"
                alt="Certify"
                className="h-9 sm:h-10 w-auto object-contain brightness-110"
              />
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#9CA3AF] hover:text-[#FEF5E5] transition p-1 cursor-pointer font-medium"
                title="Return to landing"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#382649]/60 border border-[#8B5FB0]/40 text-[#CEA4F2] text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-ping" />
              1-Click Instant Access • Preview Mode
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#FEF5E5] font-['Newsreader',Georgia,serif]">
              Sign In to Learning Studio
            </h1>
            <p className="text-sm text-[#D1D5DB] mt-1.5 leading-relaxed">
              No password or credentials required. Enter your learner name and launch directly into your course workspace.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleInstantLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D1D5DB] mb-2" htmlFor="learner-name">
                Learner Display Name
              </label>
              {/* Light Grey / Whitish Input Box for high clarity */}
              <div className="flex items-center w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] hover:border-[#CBD5E1] focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all px-3.5 py-3 shadow-xs">
                <span className="material-symbols-outlined text-[#4B5563] text-lg mr-2.5">person</span>
                <input
                  type="text"
                  id="learner-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  placeholder="e.g. Dhanush K"
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-[#111827] placeholder-[#9CA3AF] text-sm font-semibold"
                />
              </div>
              <span className="text-[11px] text-[#9CA3AF] mt-1 block">
                This name will appear on your progress records and certification awards.
              </span>
            </div>

            {/* Authenticating Animated Card or Action Button */}
            {isAuthenticating ? (
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-3 shadow-xs text-[#111827]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111827] flex items-center gap-2">
                    {authStep === 3 || authStep === 4 ? (
                      <span className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin inline-block" />
                    )}
                    {statusMessage}
                  </span>
                  <span className="font-mono text-[#7C3AED] text-[11px] font-bold">
                    {authStep === 1 && "30%"}
                    {authStep === 2 && "75%"}
                    {(authStep === 3 || authStep === 4) && "100%"}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] transition-all duration-300 rounded-full"
                    style={{
                      width:
                        authStep === 1
                          ? "30%"
                          : authStep === 2
                          ? "75%"
                          : "100%",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-white hover:bg-[#F3F4F6] text-[#111827] font-bold py-3.5 px-6 rounded-xl shadow-xl shadow-black/40 transition-all duration-200 flex items-center justify-center gap-2 text-base tracking-wide active:scale-[0.98] cursor-pointer border border-white"
                >
                  <span>Sign In &amp; Launch Studio</span>
                  <span className="material-symbols-outlined text-lg text-[#111827]">bolt</span>
                </button>
              </div>
            )}

            {/* Zero Password Security Note */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="material-symbols-outlined text-[#34D399] text-sm">lock_open</span>
              <span className="text-xs text-[#9CA3AF]">
                Zero password needed. Pre-configured with student permissions.
              </span>
            </div>

            {/* Quick feature pill row - Light Grey / Whitish */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-center shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Track</div>
                <div className="text-xs font-bold text-[#111827] mt-0.5 truncate">Python Fundamentals</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-center shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Engine</div>
                <div className="text-xs font-bold text-[#7C3AED] mt-0.5 truncate">Bayesian Knowledge</div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Hero Headline Block (Dark Smoky Translucent Card) */}
        <div className="w-full lg:max-w-xl text-left space-y-6 bg-gradient-to-b from-[#1C1C20]/90 via-[#141416]/88 to-[#0E0E10]/92 p-8 sm:p-10 rounded-3xl border border-white/12 shadow-2xl backdrop-blur-xl text-[#FEF5E5]">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#382649]/60 border border-[#8B5FB0]/40 text-xs font-mono font-semibold tracking-[0.2em] text-[#CEA4F2] uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#CEA4F2] animate-pulse" />
            CERTIFY AUTONOMOUS PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#FEF5E5] leading-[1.18] font-['Newsreader',Georgia,serif]">
            Where AI proves understanding.{" "}
            <span className="block text-[#CEA4F2] italic mt-1">
              Not passive video attendance.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#D1D5DB] font-normal leading-relaxed">
            Socratic dialogue tutoring, invariant checks in interactive sandboxes, and rigorous oral defenses under continuous Bayesian Knowledge Tracing.
          </p>

          {/* Value Pillars (Light Grey / Whitish Inner Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-1 shadow-xs">
              <span className="text-[#7C3AED] font-mono text-xs font-bold">01 • LEARN</span>
              <div className="text-xs font-bold text-[#111827]">Socratic Dialogue</div>
              <div className="text-[11px] text-[#4B5563]">AI probes and adapts to your mental model.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-1 shadow-xs">
              <span className="text-[#2563EB] font-mono text-xs font-bold">02 • DEMONSTRATE</span>
              <div className="text-xs font-bold text-[#111827]">Code Execution</div>
              <div className="text-[11px] text-[#4B5563]">Practical unit tests &amp; invariants in sandboxes.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-1 shadow-xs">
              <span className="text-[#15803D] font-mono text-xs font-bold">03 • EARN</span>
              <div className="text-xs font-bold text-[#111827]">Audited Certificate</div>
              <div className="text-[11px] text-[#4B5563]">Evidence-backed deterministic tiering.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
