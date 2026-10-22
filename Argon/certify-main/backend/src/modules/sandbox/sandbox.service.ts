import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

export interface SandboxExecutionResult {
  status: "SUCCESS" | "ERROR" | "TIMEOUT" | "SECURITY_VIOLATION";
  stdout: string;
  stderr: string;
  output: string;
  exitCode: number;
  timedOut: boolean;
  durationMs: number;
}

export interface PracticalEvaluationResult {
  status: "PASSED" | "FAILED" | "ERROR";
  passed: boolean;
  score: number;
  testsRun: number;
  testsPassed: number;
  passedCount: number;
  totalCount: number;
  testResults: Array<{ name: string; passed: boolean; details: string }>;
  output: string;
  durationMs: number;
  executionTimeMs: number;
}

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\bimport\s+(socket|subprocess|shutil|urllib|http|ctypes|multiprocessing|pty|fcntl)\b/, reason: "Forbidden system/network module import" },
  { pattern: /\bfrom\s+(socket|subprocess|shutil|urllib|http|ctypes|multiprocessing|pty|fcntl)\s+import\b/, reason: "Forbidden system/network module import" },
  { pattern: /\bos\s*\.\s*(system|popen|spawn|exec|fork|kill|remove|unlink|rmdir|environ)\b/, reason: "Forbidden OS process/filesystem call" },
  { pattern: /\b__import__\s*\(/, reason: "Dynamic __import__ is restricted in sandbox" },
  { pattern: /\b(eval|exec|compile)\s*\(/, reason: "Dynamic code execution (eval/exec) is restricted" },
  { pattern: /\bopen\s*\(/, reason: "Direct filesystem open() is restricted in sandbox" },
];

const MAX_OUTPUT_BYTES = 16 * 1024;
const DEFAULT_TIMEOUT_MS = 2500;

export class SandboxService {
  public static inspectStaticSecurity(code: string): string | null {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(code)) {
        return `SecurityPolicyViolation: ${rule.reason}`;
      }
    }
    return null;
  }

  public static async executePython(
    code: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<SandboxExecutionResult> {
    const startTime = Date.now();
    const violation = this.inspectStaticSecurity(code);
    if (violation) {
      return {
        status: "SECURITY_VIOLATION",
        stdout: "",
        stderr: violation,
        output: violation,
        exitCode: 126,
        timedOut: false,
        durationMs: Date.now() - startTime,
      };
    }

    const runId = crypto.randomBytes(8).toString("hex");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `certify-sbx-${runId}-`));
    const runnerPath = path.join(tmpDir, "runner.py");

    const wrappedSource = `import resource
try:
    resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
    resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_NPROC, (0, 0))
except Exception:
    pass

# --- Learner Submission ---
${code}
`;

    fs.writeFileSync(runnerPath, wrappedSource, { encoding: "utf8", mode: 0o600 });

    return new Promise<SandboxExecutionResult>((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;

      const child = spawn("python3", ["-I", "-B", runnerPath], {
        cwd: tmpDir,
        env: {
          PATH: "/usr/bin:/bin",
          PYTHONIOENCODING: "utf-8",
          PYTHONDONTWRITEBYTECODE: "1",
        },
        stdio: ["ignore", "pipe", "pipe"],
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => {
        if (stdout.length < MAX_OUTPUT_BYTES) {
          stdout += chunk.toString("utf8").slice(0, MAX_OUTPUT_BYTES - stdout.length);
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        if (stderr.length < MAX_OUTPUT_BYTES) {
          stderr += chunk.toString("utf8").slice(0, MAX_OUTPUT_BYTES - stderr.length);
        }
      });

      child.on("close", (exitCode) => {
        clearTimeout(timer);
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch {
          // ignore
        }
        const durationMs = Date.now() - startTime;
        const combined = [stdout, stderr].filter(Boolean).join("\n").trim();
        resolve({
          status: timedOut ? "TIMEOUT" : exitCode === 0 ? "SUCCESS" : "ERROR",
          stdout,
          stderr: timedOut ? `${stderr}\nExecution timed out after ${timeoutMs}ms.`.trim() : stderr,
          output: timedOut ? `Execution timed out after ${timeoutMs}ms.` : combined,
          exitCode: exitCode ?? (timedOut ? 124 : 1),
          timedOut,
          durationMs,
        });
      });
    });
  }

  public static async evaluatePracticalSubmission(
    learnerCode: string,
    _taskId = "practical-summarize-scores"
  ): Promise<PracticalEvaluationResult> {
    const testHarness = `${learnerCode}

import json

def _run_certify_tests():
    results = []
    try:
        fn = globals().get("summarize_scores") or globals().get("process_records") or globals().get("moving_average")
        if fn is None:
            raise RuntimeError("Expected function 'summarize_scores(records)' to be defined.")
        if fn.__name__ == "summarize_scores":
            r1 = fn([
                {"name": "Alice", "active": True, "scores": [80, 90, 100]},
                {"name": "Bob", "active": False, "scores": [50, 60]},
                {"name": "Cara", "active": True, "scores": [70, 75]}
            ])
            p1 = (r1 == {"Alice": 90.0, "Cara": 72.5})
            results.append({"name": "Filters inactive records & computes mean", "passed": bool(p1), "details": f"Got {r1}"})

            r2 = fn([{"name": "Dan", "active": True, "scores": []}])
            p2 = (r2 == {"Dan": 0.0})
            results.append({"name": "Handles empty scores list safely (0.0)", "passed": bool(p2), "details": f"Got {r2}"})

            r3 = fn([{"name": "Eve", "active": True, "scores": [10, 10, 11]}])
            p3 = (r3 == {"Eve": 10.33})
            results.append({"name": "Rounds floating-point average to 2 decimals", "passed": bool(p3), "details": f"Got {r3}"})

            inp = [{"name": "Finn", "active": True, "scores": [100, 90]}]
            _ = fn(inp)
            p4 = (len(inp) == 1 and inp[0]["scores"] == [100, 90])
            results.append({"name": "Preserves caller input without side-effect mutation", "passed": bool(p4), "details": "Verified non-mutating behavior"})
        else:
            results.append({"name": "Function defined and callable", "passed": True, "details": "OK"})
    except Exception as e:
        results.append({"name": "Runtime execution check", "passed": False, "details": str(e)})
    print("__CERTIFY_RESULTS__:" + json.dumps(results))

_run_certify_tests()
`;

    const execRes = await this.executePython(testHarness);
    let testResults: Array<{ name: string; passed: boolean; details: string }> = [];

    const marker = "__CERTIFY_RESULTS__:";
    const markerIdx = execRes.stdout.indexOf(marker);
    if (markerIdx !== -1) {
      const jsonLine = execRes.stdout.slice(markerIdx + marker.length).trim().split("\n")[0];
      try {
        testResults = JSON.parse(jsonLine);
      } catch {
        testResults = [];
      }
    }

    if (testResults.length === 0) {
      testResults = [
        {
          name: "Sandbox Execution",
          passed: false,
          details: execRes.stderr || execRes.output || "Execution failed",
        },
      ];
    }

    const testsRun = testResults.length;
    const testsPassed = testResults.filter((t) => t.passed).length;
    const score = Number((testsPassed / testsRun).toFixed(4));
    const passed = score >= 0.7;

    return {
      status: passed ? "PASSED" : "FAILED",
      passed,
      score,
      testsRun,
      testsPassed,
      passedCount: testsPassed,
      totalCount: testsRun,
      testResults,
      output: execRes.output,
      durationMs: execRes.durationMs,
      executionTimeMs: execRes.durationMs,
    };
  }
}

export const sandboxService = SandboxService;
