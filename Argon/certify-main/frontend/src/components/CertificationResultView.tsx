import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";

interface CertificationResultViewProps {
  courseSlug: string;
  onNavigate: (view: string) => void;
  onViewCredential?: (credId: string) => void;
  onReturnDashboard?: () => void;
}

export const CertificationResultView: React.FC<CertificationResultViewProps> = ({
  courseSlug,
  onNavigate,
  onViewCredential,
}) => {
  const [certResult, setCertResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrIssue = async () => {
      setLoading(true);
      setError(null);
      try {
        const listRes = await api.listMyCredentials();
        const existing = (listRes.credentials || []).find(
          (c: any) => c.courseSlug === courseSlug
        );
        if (existing) {
          const verified = await api.verifyPublicCredential(existing.verificationCode);
          setCertResult(verified);
        } else {
          const enrollRes = await api.enrollOrResume(courseSlug);
          const issued = await api.issueCertificate(enrollRes.enrollment.id);
          setCertResult({
            verificationCode: issued.certificate.verificationCode,
            issuedAt: issued.certificate.issuedAt,
            signatureAlgorithm: issued.cryptographicProof?.algorithm || "Ed25519",
            evidenceSummary: issued.evidenceSnapshot,
          });
        }
      } catch (err: any) {
        setError(err.message || "Certification eligibility requirements are not yet complete.");
      } finally {
        setLoading(false);
      }
    };
    loadOrIssue();
  }, [courseSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0518] text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading deterministic certification decision...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0518] text-slate-100 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#160A29] border border-white/10 rounded-2xl p-8 space-y-6">
        {error ? (
          <>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Deterministic Gate Incomplete
            </span>
            <h1 className="text-xl font-bold text-white">Certification Not Yet Issued</h1>
            <p className="text-sm text-slate-300">{error}</p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onNavigate("studio")}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold"
              >
                Return to Learning Studio
              </button>
              <button
                onClick={() => onNavigate("final-exam")}
                className="px-4 py-2 rounded-lg border border-white/15 text-slate-200 text-xs font-semibold"
              >
                Go to Final Assessment &amp; Viva
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Ed25519 Signed Credential Issued
              </span>
              <span className="text-xs font-mono text-purple-300">
                {certResult?.verificationCode}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Python Fundamentals Certification Earned
            </h1>
            {certResult?.evidenceSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Final Composite</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {Math.round((certResult.evidenceSummary.finalCompositeScore || 0) * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Concept Mastery</div>
                  <div className="text-lg font-bold text-white">
                    {Math.round((certResult.evidenceSummary.conceptMasteryScore || 0) * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Practical Sandbox</div>
                  <div className="text-lg font-bold text-white">
                    {Math.round((certResult.evidenceSummary.practicalProjectScore || 0) * 100)}%
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() =>
                  onViewCredential
                    ? onViewCredential(certResult.verificationCode)
                    : onNavigate("credential-details")
                }
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Inspect Signed Credential
              </button>
              <button
                onClick={() => onNavigate("verify")}
                className="px-5 py-2.5 rounded-lg border border-white/15 text-slate-200 text-xs font-semibold"
              >
                Open Public Verification Portal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
