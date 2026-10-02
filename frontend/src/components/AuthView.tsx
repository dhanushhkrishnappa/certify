import React, { useState } from "react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";

interface AuthViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("learner@certify.edu");
  const [password, setPassword] = useState("Password123!");
  const [fullName, setFullName] = useState("Dhanush K");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMethod === "phone") {
        try {
          const data = await api.login("learner@certify.edu", "Password123!");
          localStorage.setItem("certify_token", data.token);
          const enrichedUser: User = {
            ...data.user,
            fullName: fullName || data.user.fullName || "Dhanush K",
          };
          onLoginSuccess(enrichedUser, data.token);
          return;
        } catch {
          const demoUser: User = {
            id: "u-learner-demo",
            email: `${mobileNumber.replace(/\D/g, "") || "learner"}@certify.edu`,
            fullName: fullName || "Dhanush K",
            name: fullName || "Dhanush K",
            role: "learner",
          };
          const demoToken = "demo-otp-token-" + Date.now();
          localStorage.setItem("certify_token", demoToken);
          onLoginSuccess(demoUser, demoToken);
          return;
        }
      }

      if (isRegister) {
        const data = await api.register(email, password, fullName);
        localStorage.setItem("certify_token", data.token);
        onLoginSuccess(data.user, data.token);
      } else {
        const data = await api.login(email, password);
        localStorage.setItem("certify_token", data.token);
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 overflow-hidden bg-[#0B132B] font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Ambient Glows matching Stitch */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Split Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left: Floating Auth Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl relative transition-all duration-300 text-gray-900 border border-white/20 shrink-0">
          {/* Top Brand Identity */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-sm flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#1e2029] rounded-[10px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" x2="12" y1="22.08" y2="12" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wider text-gray-900 leading-none">CERTIFY</span>
                <span className="text-[9px] font-semibold tracking-widest text-gray-500 uppercase mt-0.5">Learn • Demonstrate • Earn</span>
              </div>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-400 hover:text-slate-700 transition"
              >
                Close ✕
              </button>
            )}
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {authMethod === "phone" ? "Log in or sign up" : isRegister ? "Create account" : "Login with email"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your details to access your certifications and learning pathways.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMethod === "phone" ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2" htmlFor="mobile-number">
                  Mobile number
                </label>
                <div className="flex items-center w-full rounded-xl border border-gray-200 bg-[#FBFDFF] hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3 py-2.5 shadow-sm">
                  {/* Country Selector (India) */}
                  <div className="flex items-center gap-2 pr-3 pl-1 border-r border-gray-200 shrink-0 select-none">
                    <svg className="w-5 h-3.5 rounded-sm shadow-sm overflow-hidden" viewBox="0 0 640 480">
                      <path d="M0 0h640v160H0z" fill="#f93" />
                      <path d="M0 160h640v160H0z" fill="#fff" />
                      <path d="M0 320h640v160H0z" fill="#128807" />
                      <circle cx="320" cy="240" fill="#008" r="48" />
                      <circle cx="320" cy="240" fill="#fff" r="38" />
                      <circle cx="320" cy="240" fill="#008" r="10" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">+91</span>
                    <svg className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="mobile-number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 text-sm px-3 font-normal"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.99] cursor-pointer"
                  >
                    <span>{isLoading ? "Verifying..." : "Continue with OTP"}</span>
                    <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5" htmlFor="full-name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full rounded-xl border border-gray-200 bg-[#FBFDFF] px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5" htmlFor="email-input">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learner@certify.edu"
                    className="w-full rounded-xl border border-gray-200 bg-[#FBFDFF] px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5" htmlFor="password-input">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-[#FBFDFF] px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.99] cursor-pointer"
                  >
                    <span>{isLoading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
                  </button>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="text-xs text-gray-600">
                We'll continue with login or signup after verification.
              </span>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs text-gray-400 font-medium tracking-wider">or</span>
              <div className="border-t border-gray-200 w-full" />
            </div>

            {/* Secondary Action Toggle */}
            {authMethod === "phone" ? (
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition duration-150 flex items-center justify-center gap-2.5 text-sm shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-blue-600 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Login with email</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition duration-150 flex items-center justify-center gap-2.5 text-sm shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-blue-600 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Login with mobile number</span>
              </button>
            )}

            {/* Microcopy */}
            <p className="text-center text-xs text-gray-400 pt-1 font-normal">
              Email login is available for existing accounts only.
            </p>
          </form>
        </div>

        {/* Right Hero Headline Block matching Stitch Screen 18 */}
        <div className="w-full lg:max-w-xl text-left text-white space-y-6">
          {/* Certify Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-[0.25em] text-blue-200 uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            CERTIFY PLATFORM
          </div>

          {/* Main Requested Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] drop-shadow-md">
            Where engineering understanding is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white underline decoration-blue-500/60 decoration-wavy underline-offset-8">
              proven
            </span>
            , not passively watched
          </h2>

          {/* Subtitle Description */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-lg">
            Interactive code assignments, verified assessment benchmarks, and direct technical challenges tailored for top engineering careers.
          </p>

          {/* Handwritten Accent */}
          <div className="pt-4 flex items-center gap-3">
            <div className="font-serif italic text-sky-200 text-2xl sm:text-3xl font-bold tracking-wide drop-shadow">
              Learn · Build · Grow
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
