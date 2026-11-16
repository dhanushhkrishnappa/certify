# Module 02 – Worked Examples Guide

## `ex01_grade_classifier.py` (`M02-E01`)
- **Purpose:** Show boundary guarding (`0 <= score <= 100`) and descending `elif` order.
- **Expected Output:** `Score 91: Distinction`

## `ex02_short_circuit_and_truthiness.py` (`M02-E02`)
- **Purpose:** Demonstrate that `and`/`or` return actual operands and guard against `None` attribute errors.
- **Expected Output:**
  ```
  Result 1: default
  Result 2: 42
  Safely skipped None user
  ```

## `ex03_identity_vs_equality.py` (`M02-E03`)
- **Purpose:** Contrast `==` (contents) with `is` (same memory object).
- **Expected Output:** `a == b: True`, `a is b: False`, `a is c: True`.
