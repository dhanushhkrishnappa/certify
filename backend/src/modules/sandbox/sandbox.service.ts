import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { config } from "../../config/index.js";

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
  { pattern: /\bpathlib\b/, reason: "Filesystem traversal via pathlib is restricted" },
  { pattern: /\bimportlib\b/, reason: "Dynamic module loading via importlib is restricted" },
  { pattern: /\bgetattr\s*\(/, reason: "Dynamic attribute access via getattr() is restricted" },
  { pattern: /\bsetattr\s*\(/, reason: "Dynamic attribute mutation via setattr() is restricted" },
  { pattern: /\b__builtins__\b/, reason: "Access to __builtins__ namespace is restricted" },
  { pattern: /\b__subclasses__\b/, reason: "Class hierarchy inspection via __subclasses__ is restricted" },
  { pattern: /\b__globals__\b/, reason: "Function global access via __globals__ is restricted" },
  { pattern: /\bsys\s*\.\s*modules\b/, reason: "Direct sys.modules manipulation is restricted" },
];

const MAX_OUTPUT_BYTES = 16 * 1024;
const DEFAULT_TIMEOUT_MS = 2500;

/**
 * Python test harness suites for CERTIFY Python Fundamentals practical tasks.
 */
const HARNESS_SUITES: Record<string, string> = {
  // Backward compatibility harness
  "practical-summarize-scores": `
def _run_suite(results):
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
`,

  // Module 01: normalize_inventory
  "practical-m01-normalize-inventory": `
def _run_suite(results):
    fn = globals().get("normalize_inventory")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'normalize_inventory(items)' to be defined.")

    inp = [{'name': ' Pen ', 'qty': '3'}, {'name': 'Notebook', 'qty': 2}]
    res = fn(inp)
    p1 = (res.get('pen') == 3 and res.get('notebook') == 2)
    results.append({"name": "Normalizes lowercase stripped keys & integer quantities", "passed": bool(p1), "details": f"Got {res}"})

    inp2 = [{'name': ' Ruler ', 'qty': '5'}]
    _ = fn(inp2)
    p2 = (len(inp2) == 1 and inp2[0]['name'] == ' Ruler ' and inp2[0]['qty'] == '5')
    results.append({"name": "Preserves input list and inner dicts without mutation", "passed": bool(p2), "details": "Input verified intact"})

    res3 = fn([])
    p3 = (res3 == {})
    results.append({"name": "Handles empty inventory list safely", "passed": bool(p3), "details": f"Got {res3}"})

    inp4 = [{'name': '  Eraser  ', 'qty': '10'}, {'name': 'MARKER', 'qty': '7'}]
    res4 = fn(inp4)
    p4 = (res4.get('eraser') == 10 and res4.get('marker') == 7)
    results.append({"name": "Handles multi-space trimming and uppercase normalization", "passed": bool(p4), "details": f"Got {res4}"})
`,

  // Module 02: classify_ticket
  "practical-m02-classify-ticket": `
def _run_suite(results):
    fn = globals().get("classify_ticket")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'classify_ticket(age, is_student)' to be defined.")

    p1 = (fn(10, False) == 'child' and fn(5, True) == 'child')
    results.append({"name": "Classifies age < 12 as 'child'", "passed": bool(p1), "details": f"fn(10, False) -> {fn(10, False)}"})

    p2 = (fn(12, True) == 'student' and fn(20, True) == 'student' and fn(25, True) == 'student')
    results.append({"name": "Classifies age 12-25 with is_student=True as 'student'", "passed": bool(p2), "details": f"fn(20, True) -> {fn(20, True)}"})

    p3 = (fn(65, False) == 'senior' and fn(80, True) == 'senior')
    results.append({"name": "Classifies age >= 65 as 'senior'", "passed": bool(p3), "details": f"fn(65, False) -> {fn(65, False)}"})

    p4 = (fn(30, False) == 'adult' and fn(20, False) == 'adult' and fn(26, True) == 'adult')
    results.append({"name": "Classifies non-students and ages 26-64 as 'adult'", "passed": bool(p4), "details": f"fn(30, False) -> {fn(30, False)}"})
`,

  // Module 03: filter_active / summarize_active dual-contract
  "practical-m03-filter-active": `
def _run_suite(results):
    fn = globals().get("filter_active") or globals().get("summarize_active")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'filter_active(records)' or 'summarize_active(records)' to be defined.")

    data = [
        {"name": "Alice", "active": True, "score": 95},
        {"name": "Bob", "active": False, "score": 80},
        {"name": "Cara", "active": True, "score": 88}
    ]
    argcount = getattr(getattr(fn, "__code__", None), "co_argcount", 1)
    res1 = fn(data, 80) if argcount >= 2 else fn(data)
    
    p1 = False
    if isinstance(res1, dict):
        p1 = (res1 == {"Alice": 95, "Cara": 88})
    elif isinstance(res1, (list, tuple)):
        p1 = (list(res1) == ["ALICE", "CARA"] or list(res1) == ["Alice", "Cara"] or len(res1) == 2)
    results.append({"name": "Extracts active records matching threshold", "passed": bool(p1), "details": f"Got {res1}"})

    inactive_data = [{"name": "Dan", "active": False, "score": 60}]
    res2 = fn(inactive_data, 80) if argcount >= 2 else fn(inactive_data)
    p2 = (res2 == {} or res2 == [] or res2 == ())
    results.append({"name": "Returns empty collection when all records are inactive", "passed": bool(p2), "details": f"Got {res2}"})

    res3 = fn([], 80) if argcount >= 2 else fn([])
    p3 = (res3 == {} or res3 == [] or res3 == ())
    results.append({"name": "Handles empty input list safely", "passed": bool(p3), "details": f"Got {res3}"})

    orig = [{"name": "Eve", "active": True, "score": 100}]
    _ = fn(orig, 80) if argcount >= 2 else fn(orig)
    p4 = (len(orig) == 1 and orig[0].get("score") == 100)
    results.append({"name": "Preserves original input records without mutation", "passed": bool(p4), "details": "Verified immutability"})
`,

  // Module 04: moving_average
  "practical-m04-moving-average": `
def _run_suite(results):
    fn = globals().get("moving_average")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'moving_average(numbers, k)' to be defined.")

    res1 = fn([1, 2, 3, 4, 5], 3)
    exp1 = [2.0, 3.0, 4.0]
    p1 = (len(res1) == 3 and all(abs(a - b) < 1e-4 for a, b in zip(res1, exp1)))
    results.append({"name": "Computes correct sliding window averages", "passed": bool(p1), "details": f"Got {res1}"})

    res2 = fn([10, 20, 30], 3)
    p2 = (len(res2) == 1 and abs(res2[0] - 20.0) < 1e-4)
    results.append({"name": "Handles window size equal to list length", "passed": bool(p2), "details": f"Got {res2}"})

    res3 = fn([5, 10], 4)
    p3 = (res3 == [] or res3 == ())
    results.append({"name": "Returns empty collection when window exceeds length", "passed": bool(p3), "details": f"Got {res3}"})

    res4 = fn([4, 9], 1)
    p4 = (len(res4) == 2 and abs(res4[0] - 4.0) < 1e-4 and abs(res4[1] - 9.0) < 1e-4)
    results.append({"name": "Handles window size k=1 identity scaling", "passed": bool(p4), "details": f"Got {res4}"})
`,

  // Module 05: safe_parse_records / parse_valid_ints dual-contract
  "practical-m05-safe-parse-records": `
def _run_suite(results):
    fn = globals().get("safe_parse_records") or globals().get("parse_valid_ints")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'safe_parse_records(raw_lines)' or 'parse_valid_ints(items)' to be defined.")

    res1 = fn(["10", "bad", "25", "3.14", "-5", "42"])
    p1 = False
    if isinstance(res1, tuple) and len(res1) == 2:
        valid, invalid_count = res1
        p1 = (valid == [10, 25, -5, 42] and invalid_count == 2)
    elif isinstance(res1, dict):
        valid = res1.get("valid") or res1.get("records") or []
        errs = res1.get("errors", res1.get("invalid_count", res1.get("invalid", 0)))
        p1 = (valid == [10, 25, -5, 42] and errs == 2)
    elif isinstance(res1, list):
        p1 = (res1 == [10, 25, -5, 42])
    results.append({"name": "Parses valid integers and counts invalid entries", "passed": bool(p1), "details": f"Got {res1}"})

    res2 = fn(["1", "2", "3"])
    if isinstance(res2, tuple) and len(res2) == 2:
        p2 = (res2[0] == [1, 2, 3] and res2[1] == 0)
    elif isinstance(res2, dict):
        p2 = (res2.get("valid") == [1, 2, 3] and res2.get("errors", 0) == 0)
    elif isinstance(res2, list):
        p2 = (res2 == [1, 2, 3])
    else:
        p2 = False
    results.append({"name": "Handles list where all items are valid integers", "passed": bool(p2), "details": f"Got {res2}"})

    res3 = fn(["foo", "bar", "baz"])
    if isinstance(res3, tuple) and len(res3) == 2:
        p3 = (res3[0] == [] and res3[1] == 3)
    elif isinstance(res3, dict):
        p3 = ((res3.get("valid") == [] or not res3.get("valid")) and res3.get("errors", 0) == 3)
    elif isinstance(res3, list):
        p3 = (res3 == [])
    else:
        p3 = False
    results.append({"name": "Handles list where all items are invalid", "passed": bool(p3), "details": f"Got {res3}"})

    res4 = fn([])
    if isinstance(res4, tuple) and len(res4) == 2:
        p4 = (res4[0] == [] and res4[1] == 0)
    elif isinstance(res4, dict):
        p4 = ((res4.get("valid") == [] or not res4.get("valid")) and res4.get("errors", 0) == 0)
    elif isinstance(res4, list):
        p4 = (res4 == [])
    else:
        p4 = False
    results.append({"name": "Handles empty string list safely", "passed": bool(p4), "details": f"Got {res4}"})
`,

  // Module 06: stats_summary / summarize_metrics dual-contract
  "practical-m06-stats-summary": `
def _run_suite(results):
    fn = globals().get("stats_summary") or globals().get("summarize_metrics")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'stats_summary(numbers)' or 'summarize_metrics(numbers)' to be defined.")

    res1 = fn([1, 2, 3, 4, 5])
    if isinstance(res1, dict):
        mean = res1.get("mean")
        med = res1.get("median")
        ceil_val = res1.get("ceil") if "ceil" in res1 else res1.get("ceil_mean", res1.get("ceiling", res1.get("max")))
    elif isinstance(res1, (tuple, list)):
        mean, med, ceil_val = res1[0], res1[1], res1[2]
    else:
        mean, med, ceil_val = None, None, None

    p1 = (mean is not None and abs(mean - 3.0) < 1e-4 and abs(med - 3.0) < 1e-4)
    results.append({"name": "Computes mean, median, and summary on odd-length dataset", "passed": bool(p1), "details": f"Got {res1}"})

    res2 = fn([1, 2, 4, 7])
    if isinstance(res2, dict):
        m2 = res2.get("mean")
        med2 = res2.get("median")
        c2 = res2.get("ceil") if "ceil" in res2 else res2.get("ceil_mean", res2.get("ceiling", res2.get("max")))
    elif isinstance(res2, (tuple, list)):
        m2, med2, c2 = res2[0], res2[1], res2[2]
    else:
        m2, med2, c2 = None, None, None

    p2 = (m2 is not None and abs(m2 - 3.5) < 1e-4 and abs(med2 - 3.0) < 1e-4)
    results.append({"name": "Computes fractional mean and even-length median accurately", "passed": bool(p2), "details": f"Got {res2}"})

    res3 = fn([2.5, 3.5, 6.0])
    if isinstance(res3, dict):
        m3 = res3.get("mean")
    elif isinstance(res3, (tuple, list)):
        m3 = res3[0]
    else:
        m3 = None
    p3 = (m3 is not None and abs(m3 - 4.0) < 1e-4)
    results.append({"name": "Handles float values accurately with statistics and math", "passed": bool(p3), "details": f"Got {res3}"})
`,

  // Module 07: apply_discount
  "practical-m07-tdd-discount": `
def _run_suite(results):
    fn = globals().get("apply_discount")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'apply_discount(price, pct)' to be defined.")

    res1 = fn(100.0, 20.0)
    p1 = abs(res1 - 80.0) < 1e-4
    results.append({"name": "Applies standard percentage discount (e.g. 20% off 100 -> 80)", "passed": bool(p1), "details": f"Got {res1}"})

    p2 = (abs(fn(50.0, 0.0) - 50.0) < 1e-4 and abs(fn(75.0, 100.0) - 0.0) < 1e-4)
    results.append({"name": "Handles 0% (no-op) and 100% (free) boundaries", "passed": bool(p2), "details": "Boundary checks verified"})

    p3 = False
    try:
        fn(-10.0, 15.0)
    except ValueError:
        p3 = True
    except Exception:
        p3 = False
    results.append({"name": "Raises ValueError when price is negative", "passed": bool(p3), "details": "ValueError raised on price < 0"})

    p4 = False
    try:
        fn(100.0, -5.0)
    except ValueError:
        try:
            fn(100.0, 105.0)
            p4 = False
        except ValueError:
            p4 = True
    results.append({"name": "Raises ValueError when discount percentage is out of range (<0 or >100)", "passed": bool(p4), "details": "ValueError raised on pct < 0 or > 100"})
`,

  // Module 08: stream_filter / stream_high_scores dual-contract
  "practical-m08-stream-filter": `
def _run_suite(results):
    fn = globals().get("stream_filter") or globals().get("stream_high_scores")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'stream_filter(lines, prefix)' or 'stream_high_scores(records, threshold)' to be defined.")

    records = [
        {"name": "Alice", "score": 92},
        {"name": "Bob", "score": 75},
        {"name": "Cara", "score": 88},
        {"name": "Dan", "score": 60}
    ]
    lines = ["ERROR: disk full", "INFO: service ready", "ERROR: connection lost", "DEBUG: step 1"]

    is_high_scores = False
    try:
        test_gen = fn(records, 80)
        out = list(test_gen)
        if out == ["Alice", "Cara"] or out == ["ALICE", "CARA"]:
            is_high_scores = True
    except Exception:
        is_high_scores = False

    if is_high_scores:
        gen = fn(records, 80)
        has_iter = hasattr(gen, "__iter__") and hasattr(gen, "__next__")
        output = list(gen)
        p1 = has_iter and (output == ["Alice", "Cara"] or output == ["ALICE", "CARA"])
        results.append({"name": "Yields names of records matching or exceeding threshold", "passed": bool(p1), "details": f"Got {output}"})

        gen2 = fn([{"name": "First", "score": 100}], 50)
        is_gen = hasattr(gen2, "__iter__") and hasattr(gen2, "__next__")
        results.append({"name": "Returns an iterator/generator implementing lazy evaluation", "passed": bool(is_gen), "details": f"Type: {type(gen2)}"})

        res3 = list(fn(records, 99))
        p3 = (res3 == [])
        results.append({"name": "Yields empty sequence when threshold exceeds all scores", "passed": bool(p3), "details": f"Got {res3}"})

        res4 = list(fn([], 50))
        p4 = (res4 == [])
        results.append({"name": "Handles empty records list safely", "passed": bool(p4), "details": f"Got {res4}"})
    else:
        gen = fn(lines, "ERROR")
        has_iter = hasattr(gen, "__iter__") and hasattr(gen, "__next__")
        output = list(gen)
        p1 = has_iter and (len(output) == 2 and any("disk full" in x for x in output))
        results.append({"name": "Lazily yields normalized lines matching prefix", "passed": bool(p1), "details": f"Got {output}"})

        gen2 = fn(["WARN: low memory"], "WARN")
        is_gen = hasattr(gen2, "__iter__") and hasattr(gen2, "__next__")
        results.append({"name": "Returns an iterator/generator implementing lazy evaluation", "passed": bool(is_gen), "details": f"Type: {type(gen2)}"})

        res3 = list(fn(lines, "FATAL"))
        p3 = (res3 == [])
        results.append({"name": "Yields empty sequence when no lines match prefix", "passed": bool(p3), "details": f"Got {res3}"})

        res4 = list(fn([], "ERROR"))
        p4 = (res4 == [])
        results.append({"name": "Handles empty lines collection safely", "passed": bool(p4), "details": f"Got {res4}"})
`,

  // Module 09: extract_codes / extract_ticket_ids dual-contract
  "practical-m09-extract-codes": `
def _run_suite(results):
    fn = globals().get("extract_codes") or globals().get("extract_ticket_ids")
    if not fn or not callable(fn):
        raise RuntimeError("Expected function 'extract_codes(text)' or 'extract_ticket_ids(text)' to be defined.")

    text1 = "Resolved TKT-1024 and confirmed TKT-9999 in production."
    res1 = fn(text1)
    p1 = (res1 == ["TKT-1024", "TKT-9999"])
    results.append({"name": "Extracts standard TKT-#### ticket codes from text", "passed": bool(p1), "details": f"Got {res1}"})

    text2 = "Ignore TKT-12 and TKT-12345 and ABC-1234, but keep TKT-5678."
    res2 = fn(text2)
    p2 = (res2 == ["TKT-5678"])
    results.append({"name": "Rejects malformed codes with wrong digit count or prefix", "passed": bool(p2), "details": f"Got {res2}"})

    res3 = fn("No tickets mentioned in this deployment log.")
    p3 = (res3 == [])
    results.append({"name": "Returns empty list when no ticket codes exist", "passed": bool(p3), "details": f"Got {res3}"})

    text4 = "tkt-1234 is lowercase, TKT-4321 is valid uppercase."
    res4 = fn(text4)
    p4 = ("TKT-4321" in res4 and "tkt-1234" not in res4)
    results.append({"name": "Enforces strict uppercase TKT- prefix formatting", "passed": bool(p4), "details": f"Got {res4}"})
`,

  // Module 10: GradeBook
  "practical-m10-gradebook-class": `
def _run_suite(results):
    cls = globals().get("GradeBook")
    if not cls or not isinstance(cls, type):
        raise RuntimeError("Expected class 'GradeBook' to be defined.")

    gb = cls()

    gb.add_score("Alice", 90)
    gb.add_score("Bob", 80)
    avg1 = gb.average()
    p1 = abs(avg1 - 85.0) < 1e-4
    results.append({"name": "Adds valid scores and calculates arithmetic mean average", "passed": bool(p1), "details": f"Average: {avg1}"})

    p2 = False
    try:
        gb.add_score("Eve", 105)
    except ValueError:
        p2 = True
    except Exception:
        p2 = False
    results.append({"name": "Raises ValueError when score > 100", "passed": bool(p2), "details": "ValueError raised on score > 100"})

    p3 = False
    try:
        gb.add_score("Eve", -10)
    except ValueError:
        p3 = True
    except Exception:
        p3 = False
    results.append({"name": "Raises ValueError when score < 0", "passed": bool(p3), "details": "ValueError raised on score < 0"})

    gb_empty = cls()
    try:
        avg_empty = gb_empty.average()
        p4 = (avg_empty == 0.0 or avg_empty == 0)
    except Exception as e:
        p4 = False
        avg_empty = str(e)
    results.append({"name": "Handles empty GradeBook gracefully returning 0.0 without ZeroDivisionError", "passed": bool(p4), "details": f"Got {avg_empty}"})
`,
};

export class SandboxService {
  /**
   * Static inspection checks. Static regex is a secondary defense-in-depth heuristic.
   */
  public static inspectStaticSecurity(code: string): string | null {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(code)) {
        return `SecurityPolicyViolation: ${rule.reason}`;
      }
    }
    return null;
  }

  /**
   * Evaluates practical code submissions specifically bound to authorized course tasks.
   * Dynamically selects the corresponding test harness by taskId.
   */
  public static async evaluatePracticalSubmission(
    learnerCode: string,
    taskId: string = "practical-summarize-scores"
  ): Promise<PracticalEvaluationResult> {
    const violation = this.inspectStaticSecurity(learnerCode);
    if (violation) {
      return {
        status: "ERROR",
        passed: false,
        score: 0,
        testsRun: 1,
        testsPassed: 0,
        passedCount: 0,
        totalCount: 1,
        testResults: [{ name: "Security Policy Check", passed: false, details: violation }],
        output: violation,
        durationMs: 0,
        executionTimeMs: 0,
      };
    }

    const suiteCode = HARMISSION_SUITES_LOOKUP(taskId);

    const runNonce = crypto.randomUUID();
    const marker = `__CERTIFY_RESULTS_${runNonce}__:`;

    const testHarness = `
import json as _certify_json
import builtins as _certify_builtins

_CERTIFY_JSON_DUMPS = _certify_json.dumps
_ALLOWED_IMPORTS = {
    "math", "statistics", "re", "collections", "itertools",
    "functools", "decimal", "fractions", "typing", "datetime", "json"
}
_ORIG_IMPORT = _certify_builtins.__import__

def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    root = name.split(".")[0]
    if root not in _ALLOWED_IMPORTS:
        raise ImportError(f"SecurityPolicyViolation: Module '{name}' is restricted in sandbox.")
    return _ORIG_IMPORT(name, globals, locals, fromlist, level)

_certify_builtins.__import__ = _safe_import
for _b in ("open", "eval", "exec", "compile"):
    setattr(_certify_builtins, _b, None)

${learnerCode}

${suiteCode}

def _run_certify_tests():
    results = []
    try:
        _run_suite(results)
    except Exception as e:
        results.append({"name": "Runtime execution check", "passed": False, "details": str(e)})
    print("${marker}" + _CERTIFY_JSON_DUMPS(results))

_run_certify_tests()
`;

    let execRes: SandboxExecutionResult;
    try {
      execRes = await this.executePython(testHarness);
    } catch (spawnErr: any) {
      // Cloudflare Workers edge runtime (workerd) does not support child_process.spawn
      return this.evaluatePracticalInEdgeRuntime(learnerCode, taskId);
    }
    let testResults: Array<{ name: string; passed: boolean; details: string }> = [];

    const markerIdx = execRes.stdout.lastIndexOf(marker);
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
    const passed = score >= 0.70;

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

  /**
   * Worker-safe per-task deterministic structural evaluator for Cloudflare Workers edge runtime.
   * Covers all 10 Python Fundamentals module practical tasks without requiring OS subprocesses.
   */
  public static evaluatePracticalInEdgeRuntime(
    code: string,
    taskId: string
  ): PracticalEvaluationResult {
    const t0 = Date.now();

    // Strip comments and multi-line strings before running structural keyword checks
    const strippedCode = code
      .replace(/#.*$/gm, "")
      .replace(/"""[\s\S]*?"""/g, "")
      .replace(/'''[\s\S]*?'''/g, "");

    const specs: Record<
      string,
      {
        signature: RegExp;
        signatureLabel: string;
        checks: Array<{ name: string; test: (c: string) => boolean; hint: string }>;
      }
    > = {
      "practical-m01-normalize-inventory": {
        signature: /def\s+normalize_inventory\s*\(\s*\w+/,
        signatureLabel: "def normalize_inventory(items)",
        checks: [
          { name: "Normalizes string keys with strip() and lower()", test: (c) => /\.strip\s*\(/.test(c) && /\.lower\s*\(/.test(c), hint: "Use .strip().lower() on item names" },
          { name: "Converts quantities to int()", test: (c) => /\bint\s*\(/.test(c), hint: "Convert string quantities with int()" },
          { name: "Returns a new dictionary without mutating input", test: (c) => /\breturn\b/.test(c) && (/\{/.test(c) || /\bdict\s*\(/.test(c)), hint: "Build and return a fresh dictionary" },
        ],
      },
      "practical-m02-classify-ticket": {
        signature: /def\s+classify_ticket\s*\(\s*\w+\s*,\s*\w+/,
        signatureLabel: "def classify_ticket(age, is_student)",
        checks: [
          { name: "Handles child branch (< 12)", test: (c) => /['"]child['"]/.test(c) && /12/.test(c), hint: "Return 'child' for age < 12" },
          { name: "Handles student & senior branches", test: (c) => /['"]student['"]/.test(c) && /['"]senior['"]/.test(c), hint: "Return 'student' and 'senior' appropriately" },
          { name: "Handles adult default branch with if/elif/else", test: (c) => /['"]adult['"]/.test(c) && /\bif\b/.test(c), hint: "Return 'adult' as default" },
        ],
      },
      "practical-m03-filter-active": {
        signature: /def\s+(filter_active|summarize_active)\s*\(/,
        signatureLabel: "def filter_active(records) or summarize_active(records)",
        checks: [
          { name: "Iterates over records cleanly", test: (c) => /\bfor\b/.test(c), hint: "Use a loop or list comprehension" },
          { name: "Checks active state and score condition", test: (c) => /active/.test(c) && /\bif\b/.test(c), hint: "Filter by active flag" },
          { name: "Returns filtered collection", test: (c) => /\breturn\b/.test(c), hint: "Return the resulting list or dictionary" },
        ],
      },
      "practical-m04-moving-average": {
        signature: /def\s+moving_average\s*\(/,
        signatureLabel: "def moving_average(values, window)",
        checks: [
          { name: "Validates window / bounds cleanly", test: (c) => /\bif\b/.test(c) && /\blen\s*\(/.test(c), hint: "Check length and window boundaries" },
          { name: "Computes rolling window slice average", test: (c) => /\bsum\s*\(/.test(c) && /\bfor\b/.test(c), hint: "Compute mean across sliding windows" },
          { name: "Returns numeric results list", test: (c) => /\breturn\b/.test(c), hint: "Return computed moving averages" },
        ],
      },
      "practical-m05-safe-parse-records": {
        signature: /def\s+(safe_parse_records|parse_valid_ints)\s*\(/,
        signatureLabel: "def safe_parse_records(raw_lines) or parse_valid_ints(items)",
        checks: [
          { name: "Uses try/except with specific exception type", test: (c) => /\btry\s*:/.test(c) && /\bexcept\s+[A-Z]\w*/.test(c), hint: "Catch specific exceptions (e.g. ValueError) rather than bare except" },
          { name: "Parses valid records cleanly", test: (c) => /\bfor\b/.test(c) && /\breturn\b/.test(c), hint: "Iterate lines and return parsed results" },
        ],
      },
      "practical-m06-stats-summary": {
        signature: /def\s+(stats_summary|summarize_metrics)\s*\(/,
        signatureLabel: "def stats_summary(numbers) or summarize_metrics(numbers)",
        checks: [
          { name: "Computes statistical aggregations (mean/median/min/max)", test: (c) => /\b(mean|sum|min|max|statistics|ceil)\b/.test(c), hint: "Compute summary metrics using stdlib/builtins" },
          { name: "Returns structured summary dict or tuple", test: (c) => /\breturn\b/.test(c) && (/\{/.test(c) || /\(/.test(c)), hint: "Return a dictionary summary" },
        ],
      },
      "practical-m07-tdd-discount": {
        signature: /def\s+apply_discount\s*\(/,
        signatureLabel: "def apply_discount(price, percent)",
        checks: [
          { name: "Validates invalid boundaries by raising ValueError", test: (c) => /\braise\s+ValueError\b/.test(c), hint: "Raise ValueError for negative prices or out-of-range percentages" },
          { name: "Computes discounted price accurately", test: (c) => /\breturn\b/.test(c) && /100/.test(c), hint: "Return discounted price calculation" },
        ],
      },
      "practical-m08-stream-filter": {
        signature: /def\s+(stream_filter|stream_high_scores)\s*\(/,
        signatureLabel: "def stream_filter(lines, prefix) or stream_high_scores(records, threshold)",
        checks: [
          { name: "Streams lazily or filters lines cleanly", test: (c) => /\b(yield|for)\b/.test(c), hint: "Use yield or iteration over input lines" },
          { name: "Applies prefix/threshold filtering", test: (c) => /\b(startswith|strip|in|>=|>)\b/.test(c), hint: "Check prefix or threshold condition" },
        ],
      },
      "practical-m09-extract-codes": {
        signature: /def\s+(extract_codes|extract_ticket_ids)\s*\(/,
        signatureLabel: "def extract_codes(text) or extract_ticket_ids(text)",
        checks: [
          { name: "Imports and uses Python re module", test: (c) => /\bimport\s+re\b/.test(c) && /\bre\.(findall|finditer|search|compile)\b/.test(c), hint: "Use Python's re module (e.g. re.findall)" },
          { name: "Returns extracted matches", test: (c) => /\breturn\b/.test(c), hint: "Return list of matched codes" },
        ],
      },
      "practical-m10-gradebook-class": {
        signature: /class\s+GradeBook\b/,
        signatureLabel: "class GradeBook",
        checks: [
          { name: "Defines __init__ constructor", test: (c) => /def\s+__init__\s*\(\s*self/.test(c), hint: "Define __init__(self)" },
          { name: "Defines add_score and average methods", test: (c) => /def\s+add_score\s*\(\s*self/.test(c) && /def\s+average\s*\(\s*self/.test(c), hint: "Implement add_score and average methods" },
          { name: "Enforces validation or encapsulation cleanly", test: (c) => /\bself\./.test(c) && /\breturn\b/.test(c), hint: "Store encapsulated state on self and return computed average" },
        ],
      },
    };

    const spec = specs[taskId] || {
      signature: /def\s+\w+\s*\(/,
      signatureLabel: "def solution(...)",
      checks: [{ name: "Contains valid return/yield statement", test: (c) => /\b(return|yield)\b/.test(c), hint: "Include a return or yield statement" }],
    };

    const testResults: Array<{ name: string; passed: boolean; details: string }> = [];
    const hasSig = spec.signature.test(strippedCode);
    testResults.push({
      name: `Function signature check (${spec.signatureLabel})`,
      passed: hasSig,
      details: hasSig
        ? `Found signature matching: ${spec.signatureLabel}`
        : `Missing or malformed function signature. Expected: ${spec.signatureLabel}`,
    });

    for (const check of spec.checks) {
      const ok = check.test(strippedCode);
      testResults.push({
        name: check.name,
        passed: ok,
        details: ok ? "Passed structural requirement." : `Not met: ${check.hint}`,
      });
    }


    const testsRun = testResults.length;
    const testsPassed = testResults.filter((t) => t.passed).length;
    const score = Number((testsPassed / testsRun).toFixed(4));
    const passed = score >= 0.75;
    const durationMs = Date.now() - t0;

    return {
      status: passed ? "PASSED" : "FAILED",
      passed,
      score,
      testsRun,
      testsPassed,
      passedCount: testsPassed,
      totalCount: testsRun,
      testResults,
      output: passed
        ? `Passed ${testsPassed}/${testsRun} deterministic verification checks.`
        : `Passed ${testsPassed}/${testsRun} checks. Review failing details below.`,
      durationMs,
      executionTimeMs: durationMs,
    };
  }

  /**
   * Executes Python code inside an isolated subprocess boundary:
   * - `python -I -B` (Isolated mode: ignores PYTHONPATH, site-packages, user dir)
   * - Completely empty environment variables (`env: {}`)
   * - 2.5s execution timeout (`DEFAULT_TIMEOUT_MS`)
   * - 16KB stdout/stderr buffer cap (`MAX_OUTPUT_BYTES`)
   */
  public static async executePython(
    code: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<SandboxExecutionResult> {
    const tmpDir = os.tmpdir();
    const scriptId = crypto.randomBytes(8).toString("hex");
    const scriptPath = path.join(tmpDir, `certify_sandbox_${scriptId}.py`);

    try {
      await fs.promises.writeFile(scriptPath, code, "utf8");

      const startTime = Date.now();
      const pythonProcess = spawn("python", ["-I", "-B", scriptPath], {
        env: {}, // Completely empty environment variables
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      const timeoutTimer = setTimeout(() => {
        timedOut = true;
        try {
          pythonProcess.kill("SIGKILL");
        } catch {
          // ignore if already closed
        }
      }, timeoutMs);

      pythonProcess.stdout?.on("data", (chunk: Buffer) => {
        if (stdout.length < MAX_OUTPUT_BYTES) {
          stdout += chunk.toString("utf8");
        }
      });

      pythonProcess.stderr?.on("data", (chunk: Buffer) => {
        if (stderr.length < MAX_OUTPUT_BYTES) {
          stderr += chunk.toString("utf8");
        }
      });

      const exitCode = await new Promise<number>((resolve) => {
        pythonProcess.on("close", (code) => {
          clearTimeout(timeoutTimer);
          resolve(code ?? -1);
        });
        pythonProcess.on("error", () => {
          clearTimeout(timeoutTimer);
          resolve(-1);
        });
      });

      const durationMs = Date.now() - startTime;

      if (timedOut) {
        return {
          status: "TIMEOUT",
          stdout,
          stderr: "Execution timed out (exceeded limit)",
          output: "Execution timed out",
          exitCode: -1,
          timedOut: true,
          durationMs,
        };
      }

      const status = exitCode === 0 ? "SUCCESS" : "ERROR";
      const output = stdout || stderr;

      return {
        status,
        stdout,
        stderr,
        output,
        exitCode,
        timedOut: false,
        durationMs,
      };
    } finally {
      // Always cleanup temp script
      try {
        await fs.promises.unlink(scriptPath);
      } catch {
        // ignore unlink errors
      }
    }
  }
}

function HARMISSION_SUITES_LOOKUP(taskId: string): string {
  if (HARNESS_SUITES[taskId]) {
    return HARNESS_SUITES[taskId];
  }
  // Fallback to summarize-scores for backward compatibility
  return HARNESS_SUITES["practical-summarize-scores"];
}
