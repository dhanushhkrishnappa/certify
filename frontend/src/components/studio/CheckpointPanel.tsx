import React, { useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "../../services/api.js";
import type { Question } from "../../types/index.js";

interface CheckpointPanelProps {
  chapterId: string;
  chapterTitle: string;
  enrollmentId: string;
  onClose: () => void;
  onCompleted: (result: any) => void;
}

export const CheckpointPanel: React.FC<CheckpointPanelProps> = ({
  chapterId,
  chapterTitle,
  enrollmentId,
  onClose,
  onCompleted,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api
      .getChapterQuestions(chapterId, enrollmentId)
      .then((data) => {
        if (!mounted) return;
        setQuestions(data.questions || []);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err?.message || "Could not load checkpoint questions.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [chapterId, enrollmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        studentAnswer: answers[q.id] || "",
      }));
      const res = await api.submitChapterAssessment(chapterId, enrollmentId, payload);
      setResult(res);
      onCompleted(res);
    } catch (err: any) {
      setError(err?.message || "Failed to evaluate checkpoint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#101014] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#101014]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-violet-400 font-semibold">
              Rubric-Evaluated Conceptual Checkpoint
            </div>
            <h2 className="text-base font-semibold text-white">
              {chapterTitle.replace(/^\*\*\s*/, "")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading rubric checkpoint...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 font-mono">
                      Q{idx + 1} · {q.questionType}
                    </span>
                    <span className="text-zinc-500">{q.tier}</span>
                  </div>
                  <p className="text-sm text-zinc-100 whitespace-pre-line leading-relaxed">
                    {q.prompt}
                  </p>
                  <textarea
                    rows={4}
                    required
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="Explain your reasoning clearly in your own words (include memory/runtime behavior or a short Python snippet where appropriate)..."
                    className="w-full rounded-lg border border-white/[0.1] bg-[#09090c] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-400/60"
                  />
                </div>
              ))}

              {result && (
                <div
                  className={`rounded-xl border p-4 space-y-3 ${
                    result.isPassed
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-amber-500/40 bg-amber-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-white">
                      {result.isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{result.message}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">
                      {Math.round((result.score || 0) * 100)}%
                    </span>
                  </div>

                  {Array.isArray(result.answerFeedback) &&
                    result.answerFeedback.map((fb: any, i: number) => (
                      <div key={i} className="space-y-1.5 border-t border-white/[0.08] pt-2">
                        <div className="text-xs text-zinc-200 font-medium">
                          Question {i + 1}: {fb.summary}
                        </div>
                        <div className="space-y-1">
                          {(fb.criteriaResults || []).map((cr: any, j: number) => (
                            <div
                              key={j}
                              className="text-[11px] flex items-start gap-2 text-zinc-300"
                            >
                              <span
                                className={`font-mono px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                                  cr.verdict === "DEMONSTRATED"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : cr.verdict === "MISCONCEPTION"
                                    ? "bg-rose-500/20 text-rose-300"
                                    : "bg-amber-500/20 text-amber-200"
                                }`}
                              >
                                {cr.verdict}
                              </span>
                              <span>{cr.reasoning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/[0.1] px-4 py-2 text-xs text-zinc-300 hover:bg-white/[0.05] cursor-pointer"
                >
                  {result?.isPassed ? "Done" : "Back to Tutor"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || questions.length === 0}
                  className="rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Evaluating Rubrics..." : result ? "Resubmit Checkpoint" : "Submit for Rubric Grading"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
