import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";

interface ChapterAssessmentViewProps {
  courseSlug: string;
  chapterTitle?: string;
  onNavigate: (view: string) => void;
  onComplete?: () => void;
  onNavigateRemediation?: () => void;
  onPassed?: () => void;
}

export const ChapterAssessmentView: React.FC<ChapterAssessmentViewProps> = ({
  courseSlug,
  chapterTitle,
  onNavigate,
  onComplete,
  onNavigateRemediation,
  onPassed,
}) => {
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.getCourseBySlug(courseSlug),
          api.enrollOrResume(courseSlug),
        ]);
        const eid = enrollRes.enrollment.id;
        setEnrollmentId(eid);
        const chapters = courseRes.course?.versions?.[0]?.chapters || [];
        const currentChapId = enrollRes.session?.currentChapterId || chapters[0]?.id;
        const activeChap = chapters.find((c: any) => c.id === currentChapId) || chapters[0];
        setChapter(activeChap);
      } catch (err: any) {
        setError(err.message || "Failed to load chapter assessment.");
      } finally {
        setLoading(false);
      }
    };
    loadChapter();
  }, [courseSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !chapter) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = (chapter.concepts || []).map((c: any) => ({
        questionId: c.id,
        answerText: answers[c.id] || "",
      }));
      const res = await api.submitChapterAssessment(enrollmentId, chapter.id, payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to evaluate chapter assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0518] text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading chapter rubric &amp; concept probes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0518] text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              Deterministic Chapter Mastery Gate (Threshold ≥ 0.75)
            </span>
            <h1 className="text-xl font-bold text-white mt-1">
              {chapter?.title || chapterTitle || "Chapter Assessment"}
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

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {(chapter?.concepts || []).map((concept: any, idx: number) => (
              <div
                key={concept.id}
                className="bg-[#160A29] border border-white/10 rounded-xl p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-300">
                    Concept {idx + 1}: {concept.name}
                  </span>
                </div>
                <p className="text-sm text-slate-200">{concept.description}</p>
                <textarea
                  rows={4}
                  required
                  value={answers[concept.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [concept.id]: e.target.value })}
                  placeholder={`Explain ${concept.name} and demonstrate how it works in Python...`}
                  className="w-full rounded-lg bg-[#0D0518] border border-white/15 p-3 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? "Evaluating Against Rubric..." : "Submit Chapter Assessment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#160A29] border border-white/10 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Evaluation Verdict
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  {result.passed
                    ? "Chapter Mastery Gate Passed"
                    : "Targeted Concept Remediation Required"}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-300">
                  {Math.round((result.score || 0) * 100)}%
                </span>
                <p className="text-xs text-slate-400">Rubric Score</p>
              </div>
            </div>

            <div className="space-y-3">
              {(result.conceptResults || []).map((cr: any) => (
                <div
                  key={cr.conceptId}
                  className="p-3.5 rounded-lg bg-[#0D0518] border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{cr.conceptName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{cr.rationale}</div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className={cr.passed ? "text-emerald-400" : "text-amber-400"}>
                      P(L) = {Math.round((cr.newMastery || 0) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              {result.passed ? (
                <button
                  onClick={() => (onPassed ? onPassed() : onComplete ? onComplete() : onNavigate("studio"))}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Continue to Next Chapter / Final Exam
                </button>
              ) : (
                <button
                  onClick={() =>
                    onNavigateRemediation ? onNavigateRemediation() : onNavigate("remediation")
                  }
                  className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  Enter Targeted Remediation Studio
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
