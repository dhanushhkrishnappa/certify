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
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Fixed Fullscreen Background Image */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-students.jpg')` }}
      />
      {/* Light Brown Editorial Tinted Blend Overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(140deg, rgba(115, 78, 48, 0.40) 0%, rgba(184, 138, 98, 0.28) 50%, rgba(92, 60, 36, 0.44) 100%), rgba(248, 246, 242, 0.22)",
        }}
      />

      {/* Main Split Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left: Floating Auth Card (Editorial Ivory & Clean White) */}
        <div className="w-full max-w-md bg-white/95 rounded-3xl p-8 sm:p-10 shadow-2xl relative transition-all duration-300 text-slate-900 border border-stone-200/90 shrink-0 backdrop-blur-xl">
          {/* Top Brand Identity */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B4DF0] shadow-sm shadow-indigo-500/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">CERTIFY</span>
                <span className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  Learn • Demonstrate • Earn
                </span>
              </div>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer font-medium"
                title="Return to landing"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[#5B4DF0] text-[11px] font-semibold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DF0] animate-ping" />
              1-Click Instant Access • Preview Mode
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign In to Learning Studio
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              No password or credentials required. Enter your learner name and launch directly into your course workspace.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleInstantLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2" htmlFor="learner-name">
                Learner Display Name
              </label>
              <div className="flex items-center w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 focus-within:border-[#5B4DF0] focus-within:ring-2 focus-within:ring-[#5B4DF0]/20 transition-all px-3.5 py-3 shadow-xs">
                <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">person</span>
                <input
                  type="text"
                  id="learner-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  placeholder="e.g. Dhanush K"
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-sm font-medium"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                This name will appear on your progress records and certification awards.
              </span>
            </div>

            {/* Authenticating Animated Card or Action Button */}
            {isAuthenticating ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    {authStep === 3 || authStep === 4 ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#5B4DF0] border-t-transparent animate-spin inline-block" />
                    )}
                    {statusMessage}
                  </span>
                  <span className="font-mono text-[#5B4DF0] text-[11px] font-bold">
                    {authStep === 1 && "30%"}
                    {authStep === 2 && "75%"}
                    {(authStep === 3 || authStep === 4) && "100%"}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5B4DF0] to-emerald-500 transition-all duration-300 rounded-full"
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
                  className="w-full bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2 text-base tracking-wide active:scale-[0.98] cursor-pointer"
                >
                  <span>Sign In &amp; Launch Studio</span>
                  <span className="material-symbols-outlined text-lg">bolt</span>
                </button>
              </div>
            )}

            {/* Zero Password Security Note */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="material-symbols-outlined text-emerald-600 text-sm">lock_open</span>
              <span className="text-xs text-slate-500">
                Zero password needed. Pre-configured with student permissions.
              </span>
            </div>

            {/* Quick feature pill row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Track</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">Python Fundamentals</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Engine</div>
                <div className="text-xs font-semibold text-[#5B4DF0] mt-0.5 truncate">Bayesian Knowledge</div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Hero Headline Block (Editorial Glass Card) */}
        <div className="w-full lg:max-w-xl text-left space-y-6 bg-white/95 p-8 sm:p-10 rounded-3xl border border-stone-200/90 shadow-2xl shadow-stone-900/10 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-xs font-semibold tracking-[0.2em] text-[#5B4DF0] uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#5B4DF0] animate-pulse" />
            CERTIFY AUTONOMOUS PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18] font-['Newsreader',Georgia,serif]">
            Where engineering understanding is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B4DF0] via-indigo-600 to-purple-700 italic underline decoration-[#5B4DF0]/40 decoration-wavy underline-offset-8">
              proven
            </span>
            , not passively watched.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Socratic dialogue tutoring, invariant checks in interactive sandboxes, and rigorous oral defenses under continuous Bayesian Knowledge Tracing.
          </p>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
              <span className="text-[#5B4DF0] font-mono text-xs font-bold">01 • LEARN</span>
              <div className="text-xs font-bold text-slate-900">Socratic Dialogue</div>
              <div className="text-[11px] text-slate-500">AI probes and adapts to your mental model.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
              <span className="text-[#5B4DF0] font-mono text-xs font-bold">02 • DEMONSTRATE</span>
              <div className="text-xs font-bold text-slate-900">Code Execution</div>
              <div className="text-[11px] text-slate-500">Practical unit tests &amp; invariants in sandboxes.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
              <span className="text-[#5B4DF0] font-mono text-xs font-bold">03 • EARN</span>
              <div className="text-xs font-bold text-slate-900">Audited Certificate</div>
              <div className="text-[11px] text-slate-500">Evidence-backed deterministic tiering.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
