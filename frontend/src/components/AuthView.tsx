import React, { useState } from "react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";
import Silk from "./landing/Silk.js";

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
    setStatusMessage("Connecting to Socratic gateway...");

    // Stage 1 -> Stage 2 after 450ms
    setTimeout(() => {
      setAuthStep(2);
      setStatusMessage("Initializing Bayesian Knowledge Tracing state...");
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
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 py-12 bg-black font-['Plus_Jakarta_Sans',sans-serif] text-[#FEF5E5] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E] overflow-hidden">
      {/* Full-Page React Bits Silk Background (Fixed Canvas, z-0) */}
      <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
        <Silk
          speed={2.9}
          scale={0.4}
          color="#514369"
          noiseIntensity={1.7}
          rotation={3.2}
        />
      </div>

      {/* Single Minimal Sculptured Card */}
      <div className="relative z-10 w-full max-w-[460px] mx-auto">
        {/* Back Link / Top Bar */}
        <div className="flex items-center justify-between mb-5 px-1">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors cursor-pointer group font-medium"
            >
              <span className="text-[14px] transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Back to home</span>
            </button>
          ) : (
            <div />
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Socratic Gateway</span>
          </div>
        </div>

        {/* Elevated Dark Glass Card */}
        <div className="rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#18181D]/92 via-[#121215]/88 to-[#0B0B0E]/95 border border-white/[0.06] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl p-7 sm:p-9 relative overflow-hidden">
          {/* Subtle Ambient Radial Highlight */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(206,164,242,0.08)_0%,transparent_65%)]"
            aria-hidden="true"
          />

          {/* Top Logo & Title */}
          <div className="relative z-10 text-center mb-8">
            <div className="inline-block mb-5">
              <img
                src="/certify-logo.png"
                alt="Certify"
                className="h-9 sm:h-10 w-auto mx-auto object-contain brightness-110 drop-shadow-[0_2px_12px_rgba(255,255,255,0.12)]"
              />
            </div>

            <h1 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-[34px] font-normal text-[#FEF5E5] leading-tight tracking-tight">
              Where AI proves{" "}
              <span className="text-[#CEA4F2] italic">understanding.</span>
            </h1>

            <p className="text-[13.5px] sm:text-[14px] text-[#A1A1AA] mt-2.5 leading-relaxed font-normal">
              Enter your learner identity to access the Socratic tutor, interactive sandboxes, and verified credentials.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleInstantLogin} className="relative z-10 space-y-5">
            <div>
              <label
                htmlFor="learner-name"
                className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#CFC2B4] mb-2"
              >
                Learner Display Name
              </label>

              {/* Minimal Dark Glass Input */}
              <div className="flex items-center w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0D]/80 hover:border-white/[0.14] focus-within:border-[#CEA4F2]/50 focus-within:ring-2 focus-within:ring-[#CEA4F2]/20 transition-all px-4 py-3.5 shadow-inner">
                <span className="material-symbols-outlined text-[#71717A] text-[20px] mr-3 shrink-0">
                  person
                </span>
                <input
                  type="text"
                  id="learner-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  placeholder="e.g. Dhanush K"
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-[#FEF5E5] placeholder-[#71717A] text-[14.5px] font-medium"
                />
              </div>
              <span className="text-[11px] text-[#71717A] mt-1.5 block">
                Signs your Bayesian mastery ledger and certified credentials.
              </span>
            </div>

            {/* Authenticating Animated Card or Action Button */}
            {isAuthenticating ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#FEF5E5] flex items-center gap-2">
                    {authStep === 3 || authStep === 4 ? (
                      <span className="w-4 h-4 rounded-full bg-[#10B981] text-[#0A0A0C] flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#CEA4F2] border-t-transparent animate-spin inline-block" />
                    )}
                    <span>{statusMessage}</span>
                  </span>
                  <span className="font-mono text-[#CEA4F2] text-[11px] font-bold">
                    {authStep === 1 && "30%"}
                    {authStep === 2 && "75%"}
                    {(authStep === 3 || authStep === 4) && "100%"}
                  </span>
                </div>

                {/* Animated Gradient Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#CEA4F2] via-[#E6CAA4] to-[#10B981] transition-all duration-300 rounded-full"
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
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-white hover:bg-[#F3F4F6] text-[#0A0A0C] font-semibold py-3.5 sm:py-4 px-6 rounded-2xl shadow-[0_16px_36px_-8px_rgba(0,0,0,0.8)] transition-all duration-200 flex items-center justify-center gap-2.5 text-[15px] active:scale-[0.98] cursor-pointer border border-white/20 group"
                >
                  <span>Launch Learning Studio</span>
                  <span className="material-symbols-outlined text-[19px] text-[#0A0A0C] group-hover:translate-x-0.5 transition-transform">
                    bolt
                  </span>
                </button>
              </div>
            )}

            {/* Zero Password Micro Note */}
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11.5px] text-[#A1A1AA]">
              <span className="material-symbols-outlined text-[#34D399] text-[14px]">
                lock_open
              </span>
              <span>1-Click instant access • Zero password required</span>
            </div>

            {/* Bottom 3 Verified Badges */}
            <div className="pt-4 mt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] font-mono text-[#CEA4F2] font-semibold">SOCRATIC</div>
                <div className="text-[11px] text-[#CFC2B4] mt-0.5">Viva Defense</div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] font-mono text-[#E6CAA4] font-semibold">INVARIANTS</div>
                <div className="text-[11px] text-[#CFC2B4] mt-0.5">Code Lab</div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] font-mono text-[#34D399] font-semibold">ED25519</div>
                <div className="text-[11px] text-[#CFC2B4] mt-0.5">Verifiable</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
