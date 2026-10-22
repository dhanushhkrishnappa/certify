import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";

interface CredentialDetailsViewProps {
  user?: User | null;
  credentialId?: string;
  onBack?: () => void;
}

export const CredentialDetailsView: React.FC<CredentialDetailsViewProps> = ({
  credentialId,
  onBack,
}) => {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!credentialId) {
      setLoading(false);
      setError("No credential verification code specified.");
      return;
    }
    api
      .verifyPublicCredential(credentialId)
      .then((res) => setRecord(res))
      .catch((err) => setError(err.message || "Credential not found."))
      .finally(() => setLoading(false));
  }, [credentialId]);

  return (
    <div className="min-h-screen bg-[#0D0518] text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-white/10"
          >
            ← Back to Credentials
          </button>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Verifying credential &amp; Ed25519 signature...</p>
        ) : error || !record ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            {error || "Credential record not found."}
          </div>
        ) : (
          <div className="bg-[#160A29] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  {record.status} • Ed25519 Verified:{" "}
                  {String(record.cryptographicVerification?.signatureVerified)}
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">{record.courseTitle}</h1>
                <p className="text-sm text-slate-300 mt-0.5">Recipient: {record.recipientName}</p>
              </div>
              <div className="text-right font-mono text-xs text-purple-300">
                <div>{record.verificationCode}</div>
                <div className="text-slate-400 mt-1">
                  {new Date(record.issuedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {record.evidenceSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Final Composite</div>
                  <div className="text-base font-bold text-emerald-400">
                    {Math.round(record.evidenceSummary.finalCompositeScore * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Concept Mastery</div>
                  <div className="text-base font-bold text-white">
                    {Math.round(record.evidenceSummary.conceptMasteryScore * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Rubric Quizzes</div>
                  <div className="text-base font-bold text-white">
                    {Math.round(record.evidenceSummary.rubricQuizScore * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Practical Sandbox</div>
                  <div className="text-base font-bold text-white">
                    {Math.round(record.evidenceSummary.practicalProjectScore * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">AI Viva Defense</div>
                  <div className="text-base font-bold text-white">
                    {Math.round(record.evidenceSummary.vivaDefenseScore * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0518] border border-white/10">
                  <div className="text-slate-400">Consistency &amp; Depth</div>
                  <div className="text-base font-bold text-white">
                    {Math.round(
                      ((record.evidenceSummary.consistencyScore +
                        record.evidenceSummary.interactionDepthScore) /
                        2) *
                        100
                    )}
                    %
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-[#0D0518] border border-white/10 font-mono text-[11px] text-slate-400 break-all space-y-1">
              <div>Algorithm: {record.cryptographicVerification?.algorithm}</div>
              <div>Signature: {record.cryptographicVerification?.signatureHash}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
