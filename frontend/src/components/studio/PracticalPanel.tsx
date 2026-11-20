import React, { useState } from "react";
import { X, Play, CheckCircle2, XCircle, Code2 } from "lucide-react";
import { api } from "../../services/api.js";

interface PracticalPanelProps {
  enrollmentId: string;
  moduleId: string;
  moduleTitle: string;
  taskId: string;
  objective: string;
  onClose: () => void;
  onCompleted: (result: any) => void;
}

const STARTER_TEMPLATES: Record<string, string> = {
  "practical-m01-normalize-inventory": `def normalize_inventory(items):\n    # Return a new dict mapping stripped lowercase names to int quantities\n    # without mutating the caller's input list or dicts.\n    result = {}\n    for item in items:\n        key = str(item["name"]).strip().lower()\n        result[key] = int(item["qty"])\n    return result\n`,
  "practical-m02-classify-ticket": `def classify_ticket(age, is_student):\n    # Return 'child', 'student', 'senior', or 'adult'\n    if age < 12:\n        return "child"\n    elif age <= 25 and is_student:\n        return "student"\n    elif age >= 65:\n        return "senior"\n    return "adult"\n`,
  "practical-m03-filter-active": `def filter_active(records):\n    # Return dict of active records with score >= 80, or list of uppercase active names\n    return {r["name"]: r["score"] for r in records if r.get("active") and r.get("score", 0) >= 80}\n`,
  "practical-m04-moving-average": `def moving_average(numbers, k):\n    # Return list of sliding window averages of size k\n    if k <= 0 or k > len(numbers):\n        return []\n    return [sum(numbers[i:i+k]) / k for i in range(len(numbers) - k + 1)]\n`,
  "practical-m05-safe-parse-records": `def safe_parse_records(raw_lines):\n    # Parse valid integers and count errors, returning ([valid_ints], error_count)\n    valid = []\n    errors = 0\n    for item in raw_lines:\n        try:\n            valid.append(int(item))\n        except (ValueError, TypeError):\n            errors += 1\n    return (valid, errors)\n`,
  "practical-m06-stats-summary": `import math\n\ndef stats_summary(numbers):\n    # Return dict with mean, median, and ceil of mean\n    if not numbers:\n        return {"mean": 0.0, "median": 0.0, "ceil": 0}\n    s = sorted(numbers)\n    n = len(s)\n    mean = sum(s) / n\n    med = s[n // 2] if n % 2 != 0 else (s[n // 2 - 1] + s[n // 2]) / 2.0\n    return {"mean": round(mean, 4), "median": round(med, 4), "ceil": math.ceil(mean)}\n`,
  "practical-m07-tdd-discount": `def apply_discount(price, pct):\n    # Validate and calculate price after discount, raising ValueError for invalid bounds\n    if price < 0:\n        raise ValueError("Price cannot be negative")\n    if pct < 0 or pct > 100:\n        raise ValueError("Discount percentage must be between 0 and 100")\n    return round(price * (1.0 - pct / 100.0), 4)\n`,
  "practical-m08-stream-filter": `def stream_filter(lines, prefix):\n    # Generator yielding normalized lines matching prefix with O(1) memory\n    for line in lines:\n        cleaned = line.strip()\n        if cleaned.startswith(prefix):\n            yield cleaned\n`,
  "practical-m09-extract-codes": `import re\n\ndef extract_codes(text):\n    # Extract uppercase ticket codes like TKT-1234 using regex\n    return re.findall(r"\\bTKT-\\d{4}\\b", text)\n`,
  "practical-m10-gradebook-class": `class GradeBook:\n    def __init__(self):\n        self.scores = {}\n\n    def add_score(self, name, score):\n        if not (0 <= score <= 100):\n            raise ValueError("Score must be between 0 and 100")\n        self.scores[name] = score\n\n    def average(self):\n        if not self.scores:\n            return 0.0\n        return sum(self.scores.values()) / len(self.scores)\n`,
};

export const PracticalPanel: React.FC<PracticalPanelProps> = ({
  enrollmentId,
  moduleId,
  moduleTitle,
  taskId,
  objective,
  onClose,
  onCompleted,
}) => {
  const [code, setCode] = useState(
    STARTER_TEMPLATES[taskId] ||
      `# Implement the required Python solution for ${taskId}\n\ndef solution():\n    pass\n`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleRun = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitPractical(enrollmentId, taskId, code, moduleId);
      setResult(res);
      onCompleted(res);
    } catch (err: any) {
      setError(err?.message || "Practical submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#101014] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#101014]">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-violet-400" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-violet-400 font-semibold">
                Module Practical Verification · {taskId}
              </div>
              <h2 className="text-base font-semibold text-white">{moduleTitle}</h2>
            </div>
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
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-xs text-zinc-300 leading-relaxed">
            {objective}
          </div>

          <textarea
            rows={12}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-white/[0.12] bg-[#08080b] p-4 font-mono text-xs text-emerald-200 focus:outline-none focus:border-violet-400/60"
          />

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div
              className={`rounded-xl border p-4 space-y-2.5 ${
                result.passed
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-rose-500/40 bg-rose-500/10"
              }`}
            >
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>
                  {result.passed
                    ? "Practical Harness Passed! Next Module Unlocked."
                    : "Practical Tests Failed — Review Details & Retry"}
                </span>
                <span className="font-mono">
                  {result.testsPassed}/{result.testsRun} ({Math.round((result.score || 0) * 100)}%)
                </span>
              </div>
              <div className="space-y-1.5">
                {(result.testResults || []).map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-zinc-200 bg-black/25 rounded-lg px-3 py-2"
                  >
                    {t.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-[11px] text-zinc-400">{t.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.1] px-4 py-2 text-xs text-zinc-300 hover:bg-white/[0.05] cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-white font-semibold px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {submitting ? "Running Harness..." : "Run Practical Unit Tests"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
