import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import type { PublicVerification } from "../types/index.js";

interface PublicVerifyViewProps {
  initialCredentialId?: string;
  onBack?: () => void;
}

export const PublicVerifyView: React.FC<PublicVerifyViewProps> = ({
  initialCredentialId = "",
  onBack,
}) => {
  const [credentialInput, setCredentialInput] = useState(initialCredentialId);
  const [verification, setVerification] = useState<PublicVerification | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runVerification = async (idToVerify: string) => {
    const cleanId = idToVerify.trim();
    if (!cleanId) return;

    setIsLoading(true);
    setErrorMessage(null);
    setVerification(null);

    try {
      const result = await api.verifyPublicCredential(cleanId);
      setVerification(result);
    } catch (err: any) {
      // NEVER render a fake fallback credential on 404 or error!
      setErrorMessage(
        err?.message ||
          `Credential '${cleanId}' was not found in the public verification registry.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCredentialId) {
      runVerification(initialCredentialId);
    }
  }, [initialCredentialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(credentialInput);
  };

  return (
    <div className="min-h-screen bg-[#15062B] text-slate-100 p-6 md:p-12 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-300">
              CERTIFY Public Credential Registry
            </span>
            <h1 className="text-3xl font-bold text-white mt-1">
              Verify a Learner Credential
            </h1>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer"
            >
              ← Return
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={credentialInput}
            onChange={(e) => setCredentialInput(e.target.value)}
            placeholder="Enter Credential ID (e.g., CERT-2026-PY-A1B2C3D4E5F6)"
            className="flex-1 rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-[#5d3df3] hover:bg-[#4e2fe0] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Credential"}
          </button>
        </form>

        {errorMessage && (
          <div
            role="alert"
            data-testid="verify-error-banner"
            className="p-6 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-100 space-y-2"
          >
            <div className="text-sm font-bold uppercase tracking-wider text-rose-300">
              Verification Failed — Unrecognized Credential
            </div>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {verification && (
          <div
            data-testid="verify-result-card"
            className={`p-8 rounded-2xl border space-y-6 ${
              verification.isValid
                ? "bg-emerald-950/30 border-emerald-500/40"
                : "bg-rose-950/40 border-rose-500/40"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Credential ID: {verification.credentialId}
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {verification.recipientName}
                </h2>
                <p className="text-sm text-purple-200">
                  {verification.courseTitle} • Tier: <strong>{verification.tier}</strong>
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                  verification.isValid
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                }`}
              >
                {verification.isValid
                  ? "VALID & ED25519 VERIFIED"
                  : `INVALID (${verification.status || "UNVERIFIED"})`}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs text-slate-400">Composite Score</div>
                <div className="text-lg font-bold text-white">
                  {typeof verification.compositeScore === "number"
                    ? `${(verification.compositeScore * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs text-slate-400">Chapter Mastery</div>
                <div className="text-lg font-bold text-white">
                  {verification.evidenceSummary?.chapterMastery !== undefined
                    ? `${(verification.evidenceSummary.chapterMastery * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs text-slate-400">Practical Sandbox</div>
                <div className="text-lg font-bold text-white">
                  {verification.evidenceSummary?.practicalPerformance !== undefined
                    ? `${(verification.evidenceSummary.practicalPerformance * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs text-slate-400">AI Viva Defense</div>
                <div className="text-lg font-bold text-white">
                  {verification.evidenceSummary?.vivaDefenseScore !== undefined
                    ? `${(verification.evidenceSummary.vivaDefenseScore * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1 text-slate-300 break-all">
              <div>
                Signature Verification:{" "}
                <strong className="text-white">
                  {(verification as any).signatureVerified ? "PASSED (Ed25519)" : "FAILED"}
                </strong>
              </div>
              <div>Signature: {verification.signatureHash}</div>
            </div>

            {verification.trustNotice && (
              <p className="text-xs text-slate-300 leading-relaxed">{verification.trustNotice}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
