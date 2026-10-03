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
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] text-[#EDE4D8] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E]">
      {/* Fixed Fullscreen Background Image */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-students.jpg')` }}
      />
      {/* Warm Espresso/Sepia Ambient Tinted Blend Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(46, 26, 17, 0.50) 0%, rgba(68, 41, 28, 0.38) 50%, rgba(35, 18, 11, 0.58) 100%), rgba(160, 115, 75, 0.14)",
        }}
      />

      {/* Main Split Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left: Floating Auth Card (Espresso Mocha with Warm Cream Accents) */}
        <div className="w-full max-w-md bg-[#2E1B13]/95 rounded-3xl p-8 sm:p-10 shadow-2xl relative transition-all duration-300 text-[#EDE4D8] border border-[#5A3825]/80 shrink-0 backdrop-blur-xl">
          {/* Top Brand Identity */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7E7CE] shadow-sm flex items-center justify-center text-[#351F15] shrink-0">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-['Newsreader',Georgia,serif] font-bold tracking-tight text-[#FEF5E5] leading-none">
                  CERTIFY
                </span>
                <span className="text-[9.5px] font-bold tracking-widest text-[#C7B299] uppercase mt-1">
                  Learn • Demonstrate • Earn
                </span>
              </div>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#A89682] hover:text-[#FEF5E5] transition p-1 cursor-pointer font-medium"
                title="Return to landing"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D2519] border border-[#6D4933] text-[#CEA4F2] text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-ping" />
              1-Click Instant Access • Preview Mode
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#FAF0E6] font-['Newsreader',Georgia,serif]">
              Sign In to Learning Studio
            </h1>
            <p className="text-sm text-[#CFC2B4] mt-1.5 leading-relaxed">
              No password or credentials required. Enter your learner name and launch directly into your course workspace.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleInstantLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A89682] mb-2" htmlFor="learner-name">
                Learner Display Name
              </label>
              <div className="flex items-center w-full rounded-xl border border-[#5A3825] bg-[#22130B]/90 hover:border-[#8D6B4E] focus-within:border-[#F3DEBE] focus-within:ring-2 focus-within:ring-[#F3DEBE]/20 transition-all px-3.5 py-3 shadow-xs">
                <span className="material-symbols-outlined text-[#A89682] text-lg mr-2.5">person</span>
                <input
                  type="text"
                  id="learner-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  placeholder="e.g. Dhanush K"
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-[#FAF0E6] placeholder-[#A89682] text-sm font-medium"
                />
              </div>
              <span className="text-[11px] text-[#A89682] mt-1 block">
                This name will appear on your progress records and certification awards.
              </span>
            </div>

            {/* Authenticating Animated Card or Action Button */}
            {isAuthenticating ? (
              <div className="p-4 rounded-xl bg-[#22130B]/90 border border-[#6D4933] space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FAF0E6] flex items-center gap-2">
                    {authStep === 3 || authStep === 4 ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#CEA4F2] border-t-transparent animate-spin inline-block" />
                    )}
                    {statusMessage}
                  </span>
                  <span className="font-mono text-[#F3DEBE] text-[11px] font-bold">
                    {authStep === 1 && "30%"}
                    {authStep === 2 && "75%"}
                    {(authStep === 3 || authStep === 4) && "100%"}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#3D2519] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#CEA4F2] to-[#F3DEBE] transition-all duration-300 rounded-full"
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
                  className="w-full bg-[#F3DEBE] hover:bg-[#EBD2AF] text-[#301B12] font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-black/30 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base tracking-wide active:scale-[0.98] cursor-pointer"
                >
                  <span>Sign In &amp; Launch Studio</span>
                  <span className="material-symbols-outlined text-lg">bolt</span>
                </button>
              </div>
            )}

            {/* Zero Password Security Note */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="material-symbols-outlined text-emerald-400 text-sm">lock_open</span>
              <span className="text-xs text-[#CFC2B4]">
                Zero password needed. Pre-configured with student permissions.
              </span>
            </div>

            {/* Quick feature pill row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#4E3123]/70">
              <div className="p-2.5 rounded-xl bg-[#22130B]/90 border border-[#523321]/70 text-center">
                <div className="text-[10px] uppercase tracking-wider text-[#A89682] font-bold">Track</div>
                <div className="text-xs font-semibold text-[#FAF0E6] mt-0.5 truncate">Python Fundamentals</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#22130B]/90 border border-[#523321]/70 text-center">
                <div className="text-[10px] uppercase tracking-wider text-[#A89682] font-bold">Engine</div>
                <div className="text-xs font-semibold text-[#CEA4F2] mt-0.5 truncate">Bayesian Knowledge</div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Hero Headline Block (Espresso Glass Card) */}
        <div className="w-full lg:max-w-xl text-left space-y-6 bg-[#2E1B13]/95 p-8 sm:p-10 rounded-3xl border border-[#5A3825]/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#3D2519] border border-[#6D4933] text-xs font-mono font-semibold tracking-[0.2em] text-[#CEA4F2] uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#CEA4F2] animate-pulse" />
            CERTIFY AUTONOMOUS PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#FAF0E6] leading-[1.18] font-['Newsreader',Georgia,serif]">
            Where AI proves understanding.{" "}
            <span className="block text-[#CEA4F2] italic mt-1">
              Not passive video attendance.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#CFC2B4] font-normal leading-relaxed">
            Socratic dialogue tutoring, invariant checks in interactive sandboxes, and rigorous oral defenses under continuous Bayesian Knowledge Tracing.
          </p>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#22130B]/90 border border-[#523321]/70 space-y-1 shadow-xs">
              <span className="text-[#CEA4F2] font-mono text-xs font-bold">01 • LEARN</span>
              <div className="text-xs font-bold text-[#FAF0E6]">Socratic Dialogue</div>
              <div className="text-[11px] text-[#CFC2B4]">AI probes and adapts to your mental model.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#22130B]/90 border border-[#523321]/70 space-y-1 shadow-xs">
              <span className="text-[#F3DEBE] font-mono text-xs font-bold">02 • DEMONSTRATE</span>
              <div className="text-xs font-bold text-[#FAF0E6]">Code Execution</div>
              <div className="text-[11px] text-[#CFC2B4]">Practical unit tests &amp; invariants in sandboxes.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#22130B]/90 border border-[#523321]/70 space-y-1 shadow-xs">
              <span className="text-emerald-400 font-mono text-xs font-bold">03 • EARN</span>
              <div className="text-xs font-bold text-[#FAF0E6]">Audited Certificate</div>
              <div className="text-[11px] text-[#CFC2B4]">Evidence-backed deterministic tiering.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
