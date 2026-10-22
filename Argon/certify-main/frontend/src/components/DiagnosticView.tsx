import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";

interface DiagnosticViewProps {
  courseSlug: string;
  onComplete: () => void;
  onCancel?: () => void;
  onNavigate: (view: string) => void;
}

interface DiagnosticQuestion {
  id: string;
  chapterId: string;
  chapterTitle: string;
  conceptId: string;
  conceptName: string;
  prompt: string;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  courseSlug,
  onComplete,
  onCancel,
  onNavigate,
}) => {
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answerText: string; isSkip: boolean }>>({});
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiagnostic = async () => {
      setLoading(true);
      setError(null);
      try {
        const enrollRes = await api.enrollOrResume(courseSlug);
        const eid = enrollRes.enrollment.id;
        setEnrollmentId(eid);
        const diagRes = await api.getDiagnosticQuestions(eid);
        setQuestions(diagRes.questions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load baseline diagnostic questions.");
      } finally {
        setLoading(false);
      }
    };
    loadDiagnostic();
  }, [courseSlug]);

  const currentQuestion = questions[currentIdx];

  const handleSaveStep = async (isSkip: boolean) => {
    if (!currentQuestion || !enrollmentId) return;
    const updatedAnswers = {
      ...answers,
      [currentQuestion.conceptId]: {
        answerText: isSkip ? "" : currentText.trim(),
        isSkip,
      },
    };
    setAnswers(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      const nextQ = questions[currentIdx + 1];
      setCurrentIdx(currentIdx + 1);
      setCurrentText(updatedAnswers[nextQ.conceptId]?.answerText || "");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = Object.entries(updatedAnswers).map(([conceptId, val]) => ({
        conceptId,
        answerText: val.answerText,
        isSkip: val.isSkip,
      }));
      await api.submitDiagnostic(enrollmentId, payload);
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to submit baseline diagnostic.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0518] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-purple-400 font-mono text-xs uppercase tracking-widest">
            Initializing Baseline Diagnostic
          </div>
          <p className="text-sm text-slate-400">Loading Python Fundamentals concept probes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0518] text-slate-100 flex flex-col p-6">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
            Baseline Diagnostic Calibration
          </span>
          <h1 className="text-xl font-bold text-white mt-1">
            {currentQuestion ? currentQuestion.conceptName : "Python Fundamentals"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400">
            Probe {questions.length > 0 ? currentIdx + 1 : 0} of {questions.length}
          </span>
          <button
            onClick={() => (onCancel ? onCancel() : onNavigate("course-details"))}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-white/10"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-between">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {currentQuestion ? (
          <div className="bg-[#160A29] border border-white/10 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Chapter: {currentQuestion.chapterTitle}</span>
              <span className="font-mono text-purple-300">BKT Prior Calibration</span>
            </div>

            <p className="text-base text-slate-100 leading-relaxed">{currentQuestion.prompt}</p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Your Technical Explanation
              </label>
              <textarea
                rows={5}
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Explain the underlying Python runtime mechanism in your own words..."
                className="w-full rounded-lg bg-[#0D0518] border border-white/15 p-3.5 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveStep(true)}
                className="px-4 py-2.5 rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-200 text-xs font-medium hover:bg-amber-500/20 disabled:opacity-50"
              >
                I haven&apos;t learned this yet (Honest Skip → P(L₀) = 0.05)
              </button>

              <button
                type="button"
                disabled={submitting || currentText.trim().length < 10}
                onClick={() => handleSaveStep(false)}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {submitting
                  ? "Calibrating Mastery..."
                  : currentIdx < questions.length - 1
                  ? "Save & Next Concept Probe"
                  : "Complete Diagnostic & Enter Studio"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#160A29] border border-white/10 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-300 mb-4">No diagnostic probes required.</p>
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold"
            >
              Continue to Learning Studio
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
