import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import type { Question } from "../types/index.js";
import { Award, CheckCircle, Loader2 } from "lucide-react";

interface ChapterAssessmentModalProps {
  chapterId: string;
  chapterTitle: string;
  enrollmentId: string;
  onClose: () => void;
  onAssessmentCompleted: () => void;
}

export const ChapterAssessmentModal: React.FC<ChapterAssessmentModalProps> = ({
  chapterId,
  chapterTitle,
  enrollmentId,
  onClose,
  onAssessmentCompleted,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    api.getChapterQuestions(chapterId)
      .then((data) => {
        setQuestions(data.questions);
        const initialAnswers: { [qId: string]: string } = {};
        data.questions.forEach((q) => {
          initialAnswers[q.id] = "";
        });
        setAnswers(initialAnswers);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [chapterId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, studentAnswer]) => ({
        questionId,
        studentAnswer,
      }));

      const res = await api.submitChapterAssessment(chapterId, enrollmentId, payload);
      setResult(res);
      onAssessmentCompleted();
    } catch (err: any) {
      alert(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        maxWidth: 760,
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 32
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <span className="badge-tier badge-medium" style={{ marginBottom: 6 }}>
              Chapter Verification
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{chapterTitle}</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              The AI tutor transitions to assessor mode. Explain and reason through these questions in your own words.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              color: "#fff",
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            <Loader2 className="animate-spin" size={28} style={{ margin: "0 auto 12px" }} />
            Loading chapter assessment questions...
          </div>
        ) : result ? (
          /* Assessment Results Card */
          <div style={{ textAlign: "center", padding: "24px 12px" }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: result.isPassed ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              border: `2px solid ${result.isPassed ? "#10b981" : "#f59e0b"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              {result.isPassed ? <CheckCircle size={32} color="#10b981" /> : <Award size={32} color="#f59e0b" />}
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>
              {result.isPassed ? "Demonstrated Chapter Mastery!" : "Partial Understanding"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto 24px" }}>
              {result.isPassed
                ? "Your responses satisfied the atomic rubric criteria. Bayesian Knowledge Tracing scores updated."
                : "You demonstrated partial understanding. Socratic remediation will guide your weak concepts."}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              maxWidth: 400,
              margin: "0 auto 28px",
              textAlign: "left"
            }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Rubric Criteria Checked</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
                  {result.totalCriteriaDemonstrated} / {result.totalCriteriaChecked}
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Rubric Score</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#6366f1" }}>
                  {Math.round(result.score * 100)}%
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={onClose} style={{ minWidth: 200, justifyContent: "center" }}>
              Continue Learning
            </button>
          </div>
        ) : (
          /* Question Form */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                padding: 20
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a5b4fc" }}>
                    QUESTION {idx + 1} • {q.questionType}
                  </span>
                  <span className="badge-tier badge-easy" style={{ fontSize: "0.7rem" }}>
                    {q.tier}
                  </span>
                </div>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc", marginBottom: 12 }}>
                  {q.prompt}
                </p>
                <textarea
                  rows={3}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Explain your reasoning and how Python behaves in memory..."
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: 12,
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
              <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ minWidth: 160, justifyContent: "center" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Evaluating...
                  </>
                ) : (
                  "Submit Verification"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
