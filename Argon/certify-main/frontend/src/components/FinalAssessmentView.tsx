import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";

interface FinalAssessmentViewProps {
  courseSlug: string;
  onNavigate: (view: string) => void;
  onSubmitForViva?: () => void;
  onCancel?: () => void;
  onSubmitAssessment?: () => void;
}

export const FinalAssessmentView: React.FC<FinalAssessmentViewProps> = ({
  courseSlug,
  onNavigate,
  onSubmitAssessment,
}) => {
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [code, setCode] = useState<string>(
    `def summarize_scores(records):\n    result = {}\n    for item in records:\n        if not item.get("active"):\n            continue\n        name = item["name"]\n        scores = item.get("scores", [])\n        result[name] = round(sum(scores) / len(scores), 2) if scores else 0.0\n    return result\n`
  );
  const [practicalResult, setPracticalResult] = useState<any>(null);
  const [vivaTurnInput, setVivaTurnInput] = useState("");
  const [vivaState, setVivaState] = useState<any>(null);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [submittingViva, setSubmittingViva] = useState(false);
  const [issuingCert, setIssuingCert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .enrollOrResume(courseSlug)
      .then((res) => setEnrollmentId(res.enrollment.id))
      .catch((err) => setError(err.message));
  }, [courseSlug]);

  const handleRunPractical = async () => {
    if (!enrollmentId) return;
    setSubmittingCode(true);
    setError(null);
    try {
      const res = await api.submitPracticalAssessment(
        enrollmentId,
        code,
        "practical-summarize-scores"
      );
      setPracticalResult(res);
    } catch (err: any) {
      setError(err.message || "Practical sandbox execution failed.");
    } finally {
      setSubmittingCode(false);
    }
  };

  const handleSubmitVivaTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !vivaTurnInput.trim()) return;
    setSubmittingViva(true);
    setError(null);
    try {
      const res = await api.conductVivaTurn(
        enrollmentId,
        vivaTurnInput.trim(),
        vivaState?.attemptId
      );
      setVivaState(res);
      setVivaTurnInput("");
    } catch (err: any) {
      setError(err.message || "Viva defense submission failed.");
    } finally {
      setSubmittingViva(false);
    }
  };

  const handleIssueCredential = async () => {
    if (!enrollmentId) return;
    setIssuingCert(true);
    setError(null);
    try {
      await api.issueCertificate(enrollmentId);
      if (onSubmitAssessment) onSubmitAssessment();
      else onNavigate("certification-result");
    } catch (err: any) {
      setError(err.message || "Certification eligibility requirements not yet satisfied.");
    } finally {
      setIssuingCert(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0518] text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              Summative Demonstration &amp; AI Viva Defense
            </span>
            <h1 className="text-xl font-bold text-white mt-1">
              Python Fundamentals — Practical Code Task &amp; 3-Turn Viva
            </h1>
          </div>
          <button
            onClick={() => onNavigate("studio")}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-white/10"
          >
            Back to Studio
          </button>
        </header>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Practical Coding Sandbox */}
        <section className="bg-[#160A29] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Part 1: Isolated Python Sandbox Task (summarize_scores)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Implement <code>summarize_scores(records)</code> to return a dictionary mapping
                active record names to their rounded mean score (2 decimal places), or 0.0 if empty.
              </p>
            </div>
            <button
              onClick={handleRunPractical}
              disabled={submittingCode}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              {submittingCode ? "Running in Subprocess Sandbox..." : "Run & Persist Practical Tests"}
            </button>
          </div>

          <textarea
            rows={10}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full font-mono text-xs rounded-lg bg-[#0D0518] border border-white/15 p-4 text-emerald-300"
          />

          {practicalResult && (
            <div className="p-4 rounded-lg bg-[#0D0518] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={practicalResult.passed ? "text-emerald-400" : "text-amber-400"}>
                  Practical Score: {Math.round((practicalResult.score || 0) * 100)}% (
                  {practicalResult.passedCount}/{practicalResult.totalCount} Deterministic Unit Tests
                  Passed)
                </span>
                <span className="text-slate-400 font-mono">
                  {practicalResult.executionTimeMs}ms
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Persisted 3-Turn Viva Defense */}
        <section className="bg-[#160A29] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Part 2: Multi-Turn Socratic Viva Defense (3 Persisted Turns)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Defend your implementation choices, memory references, and iteration trade-offs.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300">
              Turns Completed: {vivaState?.turnNumber || 0} / 3
            </span>
          </div>

          {vivaState && (
            <div className="p-4 rounded-lg bg-[#0D0518] border border-white/10 space-y-2 text-xs">
              <div className="text-purple-300 font-semibold">
                Cumulative Viva Score: {Math.round((vivaState.cumulativeScore || 0) * 100)}%
              </div>
              <p className="text-slate-300">{vivaState.rationale}</p>
              {vivaState.nextPrompt && (
                <p className="text-white font-medium pt-2 border-t border-white/10">
                  Next Defense Probe: {vivaState.nextPrompt}
                </p>
              )}
            </div>
          )}

          {(!vivaState || !vivaState.isDefenseSatisfied) && (
            <form onSubmit={handleSubmitVivaTurn} className="space-y-3">
              <textarea
                rows={4}
                required
                value={vivaTurnInput}
                onChange={(e) => setVivaTurnInput(e.target.value)}
                placeholder="Explain how your code handles mutable dictionary state, empty lists, and time/space complexity..."
                className="w-full rounded-lg bg-[#0D0518] border border-white/15 p-3 text-sm text-white"
              />
              <button
                type="submit"
                disabled={submittingViva}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {submittingViva ? "Recording Viva Turn..." : "Submit Viva Defense Turn"}
              </button>
            </form>
          )}

          {vivaState?.isComplete && (
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={handleIssueCredential}
                disabled={issuingCert}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                {issuingCert
                  ? "Verifying Deterministic Evidence & Signing Ed25519..."
                  : "Evaluate Eligibility & Issue Ed25519 Credential"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
