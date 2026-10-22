import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";

interface RemediationStudioViewProps {
  courseSlug?: string;
  conceptName?: string;
  onNavigate: (view: string) => void;
  onReturnToStudio?: () => void;
  onResolved?: () => void;
}

export const RemediationStudioView: React.FC<RemediationStudioViewProps> = ({
  courseSlug = "python-fundamentals",
  onNavigate,
  onReturnToStudio,
  onResolved,
}) => {
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [activeTarget, setActiveTarget] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      try {
        const enrollRes = await api.enrollOrResume(courseSlug);
        const eid = enrollRes.enrollment.id;
        const sid = enrollRes.session.id;
        setEnrollmentId(eid);
        const plan = await api.getRemediationPlan(sid);
        const list = plan.remediationTargets || [];
        setTargets(list);
        setActiveTarget(list[0] || null);
      } catch {
        setTargets([]);
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, [courseSlug]);

  const handleVerifyConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !activeTarget) return;
    setSubmitting(true);
    try {
      const res = await api.submitRemediationCheck(
        enrollmentId,
        activeTarget.conceptId,
        answerText
      );
      setFeedback(res);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15062B] text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Analyzing concept mastery records below 0.75...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#15062B] text-slate-100 min-h-screen flex flex-col p-6">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Targeted Concept Remediation Loop
          </span>
          <h1 className="text-xl font-bold text-white mt-1">
            {activeTarget ? activeTarget.conceptName : "All Chapter Concepts Above Threshold"}
          </h1>
        </div>
        <button
          onClick={() => (onReturnToStudio ? onReturnToStudio() : onNavigate("studio"))}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-white/10"
        >
          Return to Studio
        </button>
      </header>

      <main className="max-w-3xl w-full mx-auto space-y-6">
        {activeTarget ? (
          <div className="bg-[#1D0B38] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Current Mastery: {Math.round((activeTarget.currentMastery || 0) * 100)}%</span>
              <span>Required Threshold: 75%</span>
            </div>
            <p className="text-sm text-slate-200">{activeTarget.prompt}</p>

            <form onSubmit={handleVerifyConcept} className="space-y-4">
              <textarea
                rows={4}
                required
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write a clear explanation addressing the specific concept mechanics..."
                className="w-full rounded-lg bg-[#120524] border border-white/15 p-3 text-sm text-white"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                {submitting ? "Verifying Understanding..." : "Verify Concept Mastery"}
              </button>
            </form>

            {feedback && (
              <div className="p-4 rounded-lg bg-[#120524] border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-purple-300">
                  Updated Mastery: {Math.round((feedback.newMastery || 0) * 100)}% —{" "}
                  {feedback.masteryReached ? "Remediation Complete" : "Additional Practice Needed"}
                </div>
                <p className="text-xs text-slate-300">{feedback.rationale}</p>
                <div className="pt-2">
                  <button
                    onClick={() => (onResolved ? onResolved() : onNavigate("assessment"))}
                    className="px-4 py-2 rounded bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Return to Chapter Assessment
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1D0B38] border border-white/10 rounded-xl p-6 text-center space-y-4">
            <p className="text-sm text-slate-200">
              All concepts in your active chapter meet the 0.75 mastery requirement.
            </p>
            <button
              onClick={() => (onResolved ? onResolved() : onNavigate("studio"))}
              className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-xs font-semibold"
            >
              Return to Learning Studio
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
