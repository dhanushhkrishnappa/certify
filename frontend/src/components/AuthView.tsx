import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Lock, User as UserIcon } from "lucide-react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";
import Silk from "./landing/Silk.js";
import CodeSlots from "./common/CodeSlots.js";
import { authClient } from "../lib/authClient.js";

// Clean Professional Vector Icons
const EmailIcon = () => (
  <svg className="size-5 sm:size-6 text-[#FEF5E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.6-5.2 3.6-9.15z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

interface AuthViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel?: () => void;
  initialMode?: "signin" | "signup";
}

// Curated Minimalist Monochrome Avatars
import { PRESET_AVATARS } from "../constants/avatars.js";
export { PRESET_AVATARS };

export const PERSONA_OPTIONS = [
  {
    id: "student",
    title: "University Student",
    description: "CS or STEM Degree",
    icon: "🎓",
  },
  {
    id: "engineer",
    title: "Software Engineer",
    description: "Practicing Developer",
    icon: "💻",
  },
  {
    id: "switcher",
    title: "Career Switcher",
    description: "Transitioning to Tech",
    icon: "🚀",
  },
  {
    id: "researcher",
    title: "Researcher / Academic",
    description: "Faculty & Scientist",
    icon: "🔬",
  },
  {
    id: "self-taught",
    title: "Self-Directed Learner",
    description: "Independent Builder",
    icon: "📚",
  },
];

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onCancel,
  initialMode = "signin",
}) => {
  // Mode: "signin" | "signup"
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");

  // Multi-step signup flow:
  // 1 = Account Credentials, 2 = Email OTP Verification
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);

  // Form states - Step 1: Credentials
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form states - Step 2: OTP Verification
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Forgot Password flow states:
  // 1 = Request Reset (Enter Email)
  // 2 = Verify Code (Enter 6-Digit Code via CodeSlots)
  // 3 = Create & Confirm New Password
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetOtpCode, setResetOtpCode] = useState("");
  const [verifiedResetCode, setVerifiedResetCode] = useState("");
  const [resetSlotsStatus, setResetSlotsStatus] = useState<"idle" | "error" | "success">("idle");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetCooldown, setResetCooldown] = useState(30);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // Signup OTP status
  const [signupSlotsStatus, setSignupSlotsStatus] = useState<"idle" | "error" | "success">("idle");

  // App & session state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP Resend cooldown timer
  useEffect(() => {
    if (signUpStep === 2 && resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [signUpStep, resendCooldown]);

  // Forgot Password OTP Resend cooldown timer
  useEffect(() => {
    if (isForgotPassword && forgotStep === 2 && resetCooldown > 0) {
      const timer = setInterval(() => {
        setResetCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isForgotPassword, forgotStep, resetCooldown]);

  // ─── Sign In Handler ────────────────────────────────────────────────────────
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const userEmail = email.trim();
      const userPassword = password;

      if (!userEmail || !userPassword) {
        setErrorMessage("Please enter both email and password.");
        setIsLoading(false);
        return;
      }

      const data = await api.login(userEmail, userPassword);
      localStorage.setItem("certify_token", data.token);

      const enrichedUser: User = {
        ...data.user,
        fullName: data.user.fullName || data.user.name || userEmail.split("@")[0],
      };

      onLoginSuccess(enrichedUser, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Social Sign In (Google Only) ──────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign-in is currently unavailable. Please sign in with email.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Forgot Password Handlers (3-Step Flow) ─────────────────────────────────
  // Step 1: Submit account email to receive 6-digit reset code
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage("");
    setResetStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail);
      setResetOtpCode("");
      setVerifiedResetCode("");
      setResetSlotsStatus("idle");
      setResetCooldown(30);
      setResetStatus(res.message || "A 6-digit reset code has been dispatched to your email.");
      setForgotStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset code. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Validate 6-digit code via CodeSlots
  const handleVerifyResetOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || resetOtpCode).trim();
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the reset code.");
      setResetSlotsStatus("error");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      await api.verifyResetOtp(email.trim(), code);
      setResetSlotsStatus("success");
      setVerifiedResetCode(code);
      setResetStatus("Verification successful! Now set your new password.");
      setTimeout(() => {
        setForgotStep(3);
        setResetSlotsStatus("idle");
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setResetSlotsStatus("error");
      setErrorMessage(err.message || "Invalid or expired verification code.");
      setIsLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (resetCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage("");
    setResetStatus(null);
    setResetSlotsStatus("idle");

    try {
      const res = await api.forgotPassword(email.trim());
      setResetStatus(res.message || "Fresh 6-digit reset code dispatched to your email!");
      setResetCooldown(30);
      setResetOtpCode("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set and confirm new password (Only accessible after Step 2 verification)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage("");
    setResetStatus(null);

    if (resetNewPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(email.trim(), verifiedResetCode, resetNewPassword);
      setResetSuccessMessage("Password reset successfully! Please sign in with your new password.");
      setIsForgotPassword(false);
      setForgotStep(1);
      setPassword(resetNewPassword);
      setResetNewPassword("");
      setResetConfirmPassword("");
      setResetOtpCode("");
      setVerifiedResetCode("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Sign Up Step 1: Submit Credentials & Dispatch OTP ─────────────────────
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }
    setIsLoading(true);
    try {
      await api.register(trimmedEmail, password, trimmedName);

      // Reset OTP states and start 30s cooldown — user must enter the 6-digit code from their email
      setOtpDigits(["", "", "", "", "", ""]);
      setSignupSlotsStatus("idle");
      setResendCooldown(30);
      setResendStatus(null);

      // Advance directly to Step 2: Email OTP Verification
      setSignUpStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Sign Up Step 2: Verification Handler (React Bits CodeSlots) ────────────
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      setSignupSlotsStatus("error");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await api.verifyOtp(email.trim(), code);
      setSignupSlotsStatus("success");

      const finalUser: User = res.user || {
        id: "u-" + Date.now(),
        email: email.trim(),
        fullName: fullName.trim(),
        role: "STUDENT",
        emailVerified: true,
      };

      if (res.token) {
        localStorage.setItem("certify_token", res.token);
      }
      localStorage.setItem("certify_user", JSON.stringify(finalUser));

      setTimeout(() => {
        onLoginSuccess(finalUser, res.token || "");
      }, 400);
    } catch (err: any) {
      setIsLoading(false);
      setSignupSlotsStatus("error");
      setErrorMessage(err.message || "Invalid or expired verification code. Please check your inbox or click Resend.");
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage("");
    setResendStatus(null);
    setSignupSlotsStatus("idle");

    try {
      const res = await api.resendOtp(email.trim());
      setResendStatus(res.message || "Fresh 6-digit code dispatched to your email!");
      setResendCooldown(30);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative flex flex-col items-center justify-center px-4 py-4 sm:py-6 bg-black font-['Plus_Jakarta_Sans',sans-serif] text-[#FEF5E5] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E] overflow-x-hidden">
      {/* Full-Page Silk Background */}
      <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
        <Silk
          speed={2.9}
          scale={0.4}
          color="#514369"
          noiseIntensity={1.7}
          rotation={3.2}
        />
      </div>

      {/* Top Left Navigation Back Button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="fixed top-4 left-4 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors cursor-pointer group font-medium px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] backdrop-blur-md"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to home</span>
        </button>
      )}

      {/* Unified Compact Card Container */}
      <div
        className="relative z-10 flex w-full transition-all duration-300 flex-col items-center justify-center gap-2.5 my-auto max-w-sm sm:max-w-[420px]"
      >
        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onCancel?.();
          }}
          className="flex items-center justify-center cursor-pointer group transition-transform hover:scale-[1.02]"
          aria-label="Certify Home"
        >
          <img
            src="/certify-logo.webp"
            alt="Certify"
            fetchPriority="high"
            decoding="async"
            className="h-7 sm:h-8 w-auto object-contain brightness-110 drop-shadow-[0_2px_14px_rgba(206,164,242,0.3)]"
          />
        </a>

        {/* Elevated Dark Glass Card */}
        <div
          data-slot="card"
          className="flex w-full flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0c10]/95 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 text-[#FEF5E5] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(206,164,242,0.08)_0%,transparent_65%)]"
            aria-hidden="true"
          />

          {/* ════════════════════════════════════════════════════════════════════
              MODE A: FORGOT PASSWORD / PASSWORD RESET (3-STEP FLOW)
             ════════════════════════════════════════════════════════════════════ */}
          {isForgotPassword ? (
            <>
              {/* ── STEP 1: Enter Account Email ── */}
              {forgotStep === 1 && (
                <>
                  <div className="grid auto-rows-min gap-1.5 text-center relative z-10">
                    <div className="inline-flex items-center justify-center size-11 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-white shadow-inner mb-1 mx-auto">
                      <EmailIcon />
                    </div>
                    <h1 className="font-semibold text-lg sm:text-xl text-[#FEF5E5] tracking-tight">
                      Reset your password
                    </h1>
                    <p className="text-xs text-[#A1A1AA] leading-snug">
                      Enter your account email and we'll dispatch a 6-digit verification code.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="forgot-email">
                          Account Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="email"
                            id="forgot-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="learner@certify.edu"
                            required
                            autoFocus
                            className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                          />
                        </div>
                      </div>

                      {errorMessage && (
                        <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md text-left">
                          {errorMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md text-xs font-semibold bg-white hover:bg-neutral-100 text-[#0A0A0C] h-9 px-4 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                      >
                        {isLoading ? "Dispatching code..." : "Send Verification Code →"}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setErrorMessage("");
                          }}
                          className="text-xs text-[#A1A1AA] hover:text-[#FEF5E5] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ArrowLeft className="size-3" /> Back to Sign In
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {/* ── STEP 2: Verify 6-Digit Code via React Bits CodeSlots ── */}
              {forgotStep === 2 && (
                <>
                  <div className="grid auto-rows-min gap-1.5 text-center relative z-10">
                    <div className="inline-flex items-center justify-center size-11 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-white shadow-inner mb-1 mx-auto">
                      <EmailIcon />
                    </div>
                    <h1 className="font-semibold text-lg sm:text-xl text-[#FEF5E5] tracking-tight">
                      Enter Verification Code
                    </h1>
                    <p className="text-xs text-[#A1A1AA] leading-snug">
                      We sent a 6-digit code to <span className="font-semibold text-white">{email}</span>.
                    </p>
                  </div>

                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-center">
                      <label className="text-xs font-medium text-[#FEF5E5] mb-1">
                        6-Digit Verification Code
                      </label>
                      <div className="flex justify-center py-1">
                        <CodeSlots
                          length={6}
                          value={resetOtpCode}
                          status={resetSlotsStatus}
                          onChange={(code) => {
                            setResetOtpCode(code);
                            if (resetSlotsStatus === "error") setResetSlotsStatus("idle");
                          }}
                          onComplete={async (code) => {
                            await handleVerifyResetOtp(code);
                          }}
                          autoFocus={true}
                          accentColor="#ffffff"
                          inkColor="#CEA4F2"
                          slotColor="#181724"
                          digitColor="#0c0c10"
                          dangerColor="#ff3b30"
                          slotSize={44}
                          gap={8}
                          radius={12}
                          bounce={0.2}
                          settle={0.3}
                          rise={8}
                          cascade={20}
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md text-left">
                        {errorMessage}
                      </p>
                    )}

                    {resetStatus && (
                      <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-md text-left">
                        {resetStatus}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleVerifyResetOtp()}
                      disabled={isLoading || resetOtpCode.length < 6}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md text-xs font-semibold bg-white hover:bg-neutral-100 text-[#0A0A0C] h-9 px-4 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                    >
                      {isLoading ? "Verifying..." : "Verify Code →"}
                    </button>

                    {/* Resend & Change Email Row */}
                    <div className="flex items-center justify-between gap-3 text-xs text-[#A1A1AA] pt-1">
                      {resetCooldown > 0 ? (
                        <span className="text-[#71717A] text-[11px]">
                          Resend code in {resetCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendResetOtp}
                          disabled={isLoading}
                          className="text-[#CEA4F2] hover:underline font-semibold cursor-pointer disabled:opacity-50 text-[11px]"
                        >
                          Resend Code
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setErrorMessage("");
                        }}
                        className="text-[#A1A1AA] hover:text-[#FEF5E5] text-[11px] cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setForgotStep(1);
                          setErrorMessage("");
                        }}
                        className="text-xs text-[#A1A1AA] hover:text-[#FEF5E5] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="size-3" /> Back to Sign In
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 3: Create & Confirm New Password ── */}
              {forgotStep === 3 && (
                <>
                  <div className="grid auto-rows-min gap-1.5 text-center relative z-10">
                    <div className="inline-flex items-center justify-center size-11 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-white shadow-inner mb-1 mx-auto">
                      <Lock className="size-5 text-[#FEF5E5]" />
                    </div>
                    <h1 className="font-semibold text-lg sm:text-xl text-[#FEF5E5] tracking-tight">
                      Create New Password
                    </h1>
                    <p className="text-xs text-[#A1A1AA] leading-snug">
                      Enter and confirm your new password to regain access to your account.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-3">
                      {/* New Password */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="reset-new-password">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="password"
                            id="reset-new-password"
                            value={resetNewPassword}
                            onChange={(e) => setResetNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            autoFocus
                            className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                          />
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="reset-confirm-password">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="password"
                            id="reset-confirm-password"
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            required
                            className={`h-9 w-full min-w-0 rounded-md border bg-black/40 pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none text-[#FEF5E5] placeholder-[#71717A] ${
                              resetConfirmPassword && resetConfirmPassword !== resetNewPassword
                                ? "border-rose-500/70 focus:ring-rose-500/30"
                                : "border-white/[0.1] hover:border-white/[0.18] focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40"
                            }`}
                          />
                        </div>
                      </div>

                      {errorMessage && (
                        <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md text-left">
                          {errorMessage}
                        </p>
                      )}

                      {resetStatus && (
                        <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-md text-left">
                          {resetStatus}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md text-xs font-semibold bg-white hover:bg-neutral-100 text-[#0A0A0C] h-9 px-4 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                      >
                        {isLoading ? "Updating password..." : "Reset Password & Return to Sign In"}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setForgotStep(1);
                            setErrorMessage("");
                          }}
                          className="text-xs text-[#A1A1AA] hover:text-[#FEF5E5] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ArrowLeft className="size-3" /> Back to Sign In
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </>
          ) : !isSignUp ? (
            <>
              {/* Header */}
              <div className="grid auto-rows-min gap-1 text-center relative z-10">
                <h1 className="font-semibold text-lg sm:text-xl text-[#FEF5E5] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs sm:text-[13px] text-[#A1A1AA] leading-snug">
                  Sign in to access your Socratic workspace and verified ledger.
                </p>
              </div>

              {/* Form Content */}
              <div className="relative z-10">
                <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                  {/* Google Login Only (Apple ID Removed) */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.22] px-4 py-2.5 text-xs font-semibold text-[#FEF5E5] transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
                  >
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-2 my-1">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <span className="text-[11px] text-[#71717A] uppercase tracking-wider">or continue with email</span>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="signin-email">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="signin-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="learner@certify.edu"
                      required
                      className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] px-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="signin-password">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotStep(1);
                          setErrorMessage("");
                          setResetSuccessMessage("");
                        }}
                        className="text-[11px] text-[#A1A1AA] hover:text-[#CEA4F2] cursor-pointer transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      id="signin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] px-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                    />
                  </div>

                  {resetSuccessMessage && (
                    <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-md text-left">
                      {resetSuccessMessage}
                    </p>
                  )}

                  {errorMessage && (
                    <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md text-xs font-semibold bg-white hover:bg-neutral-100 text-[#0A0A0C] h-9 px-4 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                  >
                    {isLoading ? "Signing in..." : "Sign In to Workspace"}
                  </button>

                  <p className="text-xs text-[#A1A1AA] text-center pt-1">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setSignUpStep(1);
                        setErrorMessage("");
                      }}
                      className="underline underline-offset-4 hover:text-[#FEF5E5] cursor-pointer text-[#CEA4F2] font-semibold"
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              </div>
            </>
          ) : (
            /* ════════════════════════════════════════════════════════════════════
               MODE B: MINIMAL SIGN UP (STEP 1: DETAILS | STEP 2: VERIFY OTP)
               ════════════════════════════════════════════════════════════════════ */
            <>
              {signUpStep === 1 ? (
                <>
                  {/* Header */}
                  <div className="grid auto-rows-min gap-1 text-center relative z-10">
                    <h1 className="font-semibold text-lg sm:text-xl text-[#FEF5E5] tracking-tight">
                      Create an account
                    </h1>
                    <p className="text-xs text-[#A1A1AA] leading-snug">
                      Enter your details to register your workspace.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <form onSubmit={handleStep1Submit} className="flex flex-col gap-3">
                      {/* Google Sign Up Button — exactly fit into middle */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.22] px-4 py-2.5 text-xs font-semibold text-[#FEF5E5] transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
                      >
                        <GoogleIcon />
                        <span>Sign up with Google</span>
                      </button>

                      <div className="flex items-center gap-2 my-0.5">
                        <div className="h-px flex-1 bg-white/[0.08]" />
                        <span className="text-[11px] text-[#71717A] uppercase tracking-wider">or register with email</span>
                        <div className="h-px flex-1 bg-white/[0.08]" />
                      </div>

                      {/* Full Name */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="signup-name">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="text"
                            id="signup-name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Alex Chen"
                            required
                            className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="signup-email">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="email"
                            id="signup-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="learner@certify.edu"
                            required
                            className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="signup-password">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="password"
                            id="signup-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            className="h-9 w-full min-w-0 rounded-md border border-white/[0.1] bg-black/40 hover:border-white/[0.18] pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40 text-[#FEF5E5] placeholder-[#71717A]"
                          />
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-[#FEF5E5]" htmlFor="signup-confirm">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 size-3.5 text-[#71717A]" />
                          <input
                            type="password"
                            id="signup-confirm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                            className={`h-9 w-full min-w-0 rounded-md border bg-black/40 pl-9 pr-3 py-1 text-xs shadow-xs transition-colors outline-none text-[#FEF5E5] placeholder-[#71717A] ${
                              confirmPassword && confirmPassword !== password
                                ? "border-rose-500/70 focus:ring-rose-500/30"
                                : "border-white/[0.1] hover:border-white/[0.18] focus:border-[#CEA4F2]/70 focus:ring-1 focus:ring-[#CEA4F2]/40"
                            }`}
                          />
                        </div>
                      </div>

                      {errorMessage && (
                        <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md text-left">
                          {errorMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md text-xs font-semibold bg-white hover:bg-neutral-100 text-[#0A0A0C] h-9 px-4 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                      >
                        {isLoading ? "Dispatching code..." : "Create Account →"}
                      </button>

                      <p className="text-xs text-[#A1A1AA] text-center pt-1">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(false);
                            setErrorMessage("");
                          }}
                          className="underline underline-offset-4 hover:text-[#FEF5E5] cursor-pointer text-[#CEA4F2] font-semibold"
                        >
                          Sign In
                        </button>
                      </p>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Verification Code */}
                  <div className="grid auto-rows-min gap-1.5 text-center relative z-10">
                    <div className="inline-flex items-center justify-center size-11 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-white shadow-inner mb-1 mx-auto">
                      <EmailIcon />
                    </div>
                    <h1 className="font-semibold text-lg sm:text-xl text-[#FEF5E5] tracking-tight">
                      Enter Verification Code
                    </h1>
                    <p className="text-xs text-[#A1A1AA] leading-snug">
                      We sent a 6-digit code to <span className="font-semibold text-white">{email}</span>.
                    </p>
                  </div>

                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-center">
                      <label className="text-xs font-medium text-[#FEF5E5] mb-1">
                        6-Digit Verification Code
                      </label>
                      <div className="flex justify-center py-1">
                        <CodeSlots
                          length={6}
                          value={otpDigits.join("")}
                          status={signupSlotsStatus}
                          onChange={(code) => {
                            const arr = Array.from({ length: 6 }, (_, i) => code[i] || "");
                            setOtpDigits(arr);
                            if (signupSlotsStatus === "error") setSignupSlotsStatus("idle");
                          }}
                          onComplete={async (code) => {
                            await handleVerifyOtp(code);
                          }}
                          autoFocus={true}
                          accentColor="#ffffff"
                          inkColor="#CEA4F2"
                          slotColor="#181724"
                          digitColor="#0c0c10"
                          dangerColor="#ff3b30"
                          slotSize={44}
                          gap={8}
                          radius={12}
                          bounce={0.2}
                          settle={0.3}
                          rise={8}
                          cascade={20}
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md text-left">
                        {errorMessage}
                      </p>
                    )}

                    {resendStatus && (
                      <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-md text-left">
                        {resendStatus}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={isLoading || otpDigits.join("").length < 6}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md text-xs font-semibold bg-white hover:bg-neutral-100 text-[#0A0A0C] h-9 px-4 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                    >
                      {isLoading ? "Verifying..." : "Verify & Enter Workspace →"}
                    </button>

                    {/* Resend & Change Email Row */}
                    <div className="flex items-center justify-between gap-3 text-xs text-[#A1A1AA] pt-1">
                      {resendCooldown > 0 ? (
                        <span className="text-[#71717A] text-[11px]">
                          Resend code in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-[#CEA4F2] hover:underline font-semibold cursor-pointer disabled:opacity-50 text-[11px]"
                        >
                          Resend Code
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSignUpStep(1);
                          setErrorMessage("");
                        }}
                        className="text-[#A1A1AA] hover:text-[#FEF5E5] text-[11px] cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setSignUpStep(1);
                          setErrorMessage("");
                        }}
                        className="text-xs text-[#A1A1AA] hover:text-[#FEF5E5] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="size-3" /> Back to Sign In
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};
