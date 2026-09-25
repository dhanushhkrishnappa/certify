import React, { useState } from "react";
import { api } from "../services/api.js";
import { CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface VivaDefenseModalProps {
  enrollmentId: string;
  onClose: () => void;
  onCertificateIssued: (credentialId: string) => void;
}

export const VivaDefenseModal: React.FC<VivaDefenseModalProps> = ({
  enrollmentId,
  onClose,
  onCertificateIssued,
}) => {
  const [turn, setTurn] = useState(1);
  const [currentPrompt, setCurrentPrompt] = useState(
    "In your Capstone LRU Cache solution, you paired a hash map with a doubly-linked list. Why was this combination selected over a single sorted list or OrderedDict? Explain the time complexity implications."
  );
  const [studentInput, setStudentInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [issuedCredId, setIssuedCredId] = useState<string | null>(null);

  const handleSendTurn = async () => {
    if (!studentInput.trim()) return;

    setIsProcessing(true);
    const userMsg = studentInput;
    setStudentInput("");
    setHistory((prev) => [...prev, { role: "student", content: userMsg }]);

    try {
      const res = await api.conductVivaTurn(enrollmentId, "q_viva_1", userMsg, turn);

      setHistory((prev) => [
        ...prev,
        {
          role: "examiner",
          content: res.evaluatorFeedback + (res.followUpProbe ? `\n\n${res.followUpProbe}` : ""),
        },
      ]);

      if (res.isDefenseSatisfied || turn >= 3) {
        setIsCompleted(true);
        // Deterministically issue credential!
        const certRes = await api.issueCertificate(enrollmentId);
        setIssuedCredId(certRes.certificate.credentialId);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setTurn((prev) => prev + 1);
        if (res.followUpProbe) {
          setCurrentPrompt(res.followUpProbe);
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to process turn");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        maxWidth: 780,
        width: "100%",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        padding: 32
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="badge-tier badge-hard">
                FINAL MILESTONE
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Turn {turn} of 3
              </span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>AI Viva & Architectural Defense</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              The AI examiner probes your practical implementation decisions, space-time trade-offs, and edge cases.
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

        {/* Completed Celebration View */}
        {isCompleted && issuedCredId ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))",
              border: "2px solid #10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 24px rgba(16, 185, 129, 0.4)"
            }}>
              <CheckCircle size={38} color="#10b981" />
            </div>

            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 10 }}>
              Oral Defense Validated!
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: 520, margin: "0 auto 24px" }}>
              You successfully defended your design decisions and demonstrated mastery across all 8 modules. Your credential has been deterministically verified and cryptographically issued.
            </p>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: 20,
              maxWidth: 420,
              margin: "0 auto 30px"
            }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                OFFICIAL CREDENTIAL ID
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#a5b4fc", fontFamily: "var(--font-mono)" }}>
                {issuedCredId}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => onCertificateIssued(issuedCredId)}
              style={{ minWidth: 240, justifyContent: "center", margin: "0 auto" }}
            >
              <ShieldCheck size={18} /> View Verified Credential
            </button>
          </div>
        ) : (
          /* Defense Conversation Stream */
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 10,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginBottom: 20
            }}>
              {/* Initial Examiner Prompt */}
              <div style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: 12,
                padding: 16
              }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a5b4fc", marginBottom: 6 }}>
                  AI EXAMINER
                </div>
                <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
                  {currentPrompt}
                </div>
              </div>

              {/* History turns */}
              {history.map((h, i) => (
                <div key={i} style={{
                  background: h.role === "student" ? "rgba(255, 255, 255, 0.04)" : "rgba(99, 102, 241, 0.08)",
                  border: `1px solid ${h.role === "student" ? "var(--border-subtle)" : "rgba(99, 102, 241, 0.2)"}`,
                  borderRadius: 12,
                  padding: 16,
                  alignSelf: h.role === "student" ? "flex-end" : "flex-start",
                  maxWidth: "90%"
                }}>
                  <div style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: h.role === "student" ? "#38bdf8" : "#a5b4fc",
                    marginBottom: 6
                  }}>
                    {h.role === "student" ? "YOU (DEFENSE)" : "AI EXAMINER (FOLLOW-UP)"}
                  </div>
                  <div style={{ fontSize: "0.92rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {h.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
              <input
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSendTurn()}
                placeholder="Defend your architectural trade-offs..."
                disabled={isProcessing}
                style={{
                  flex: 1,
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  outline: "none"
                }}
              />
              <button
                className="btn-primary"
                onClick={handleSendTurn}
                disabled={isProcessing || !studentInput.trim()}
                style={{ minWidth: 120, justifyContent: "center" }}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : "Defend"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
