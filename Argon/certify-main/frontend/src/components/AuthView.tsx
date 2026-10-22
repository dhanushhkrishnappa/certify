import React, { useState } from "react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";
import Silk from "./landing/Silk.js";

interface AuthViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("learner@certify.edu");
  const [password, setPassword] = useState("Password123!");
  const [fullName, setFullName] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;

    setErrorMessage(null);
    setIsAuthenticating(true);

    try {
      const data =
        mode === "login"
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), password, fullName.trim());

      localStorage.setItem("certify_token", data.token);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Authentication failed. Verify that the backend server is running and credentials are valid."
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 py-12 bg-black font-['Plus_Jakarta_Sans',sans-serif] text-[#FEF5E5] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E] overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
        <Silk speed={2.9} scale={0.4} color="#514369" noiseIntensity={1.7} rotation={3.2} />
      </div>

      <div className="relative z-10 w-full max-w-[460px] mx-auto">
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
            <span>Authenticated Session</span>
          </div>
        </div>

        <div className="rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#18181D]/92 via-[#121215]/88 to-[#0B0B0E]/95 border border-white/[0.06] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl p-7 sm:p-9 relative overflow-hidden">
          <div className="relative z-10 text-center mb-6">
            <h1 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-[34px] font-normal text-[#FEF5E5] leading-tight tracking-tight">
              Where AI proves{" "}
              <span className="text-[#CEA4F2] italic">understanding.</span>
            </h1>
            <p className="text-[13.5px] text-[#A1A1AA] mt-2 leading-relaxed">
              Sign in or create a learner account to track your mastery and earn verifiable credentials.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-[#0A0A0C] shadow"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-[#0A0A0C] shadow"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="relative z-10 mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            {mode === "register" && (
              <div>
                <label
                  htmlFor="learner-fullname"
                  className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#CFC2B4] mb-1.5"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="learner-fullname"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  placeholder="Alex Chen"
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0D]/80 px-4 py-3 text-[#FEF5E5] placeholder-[#71717A] text-sm focus:border-[#CEA4F2]/50 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="learner-email"
                className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#CFC2B4] mb-1.5"
              >
                Email Address
              </label>
              <input
                type="email"
                id="learner-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isAuthenticating}
                placeholder="learner@certify.edu"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0D]/80 px-4 py-3 text-[#FEF5E5] placeholder-[#71717A] text-sm focus:border-[#CEA4F2]/50 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="learner-password"
                className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#CFC2B4] mb-1.5"
              >
                Password
              </label>
              <input
                type="password"
                id="learner-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isAuthenticating}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0D]/80 px-4 py-3 text-[#FEF5E5] placeholder-[#71717A] text-sm focus:border-[#CEA4F2]/50 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-white hover:bg-[#F3F4F6] text-[#0A0A0C] font-semibold py-3.5 px-6 rounded-2xl shadow transition-all duration-200 flex items-center justify-center gap-2 text-[15px] cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isAuthenticating
                    ? "Authenticating..."
                    : mode === "login"
                    ? "Sign In to Workspace"
                    : "Create Learner Account"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
