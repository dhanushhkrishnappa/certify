# Standard Library Essentials: random, statistics, math & datetime

## Lesson Metadata
- **Lesson ID:** `M06-L02`
- **Module ID:** `module-06`
- **Concept ID:** `standard-library-essentials`
- **Lesson Title:** Standard Library Essentials: random, statistics, math & datetime
- **Difficulty:** Beginner
- **Estimated Duration:** 45 mins
- **Prerequisites:** M06-L01
- **Learning Objectives:**
  - Use random, statistics, math, and datetime
  - Navigate Python documentation

## 1. What is this concept?
Python's Standard Library ships with hundreds of tested modules including `random`, `statistics`, `math`, and `datetime`.

## 2. Why does it exist?
Reimplementing averages, date math, or pseudo-random sampling wastes time and introduces edge-case bugs.

## 3. What problem does it solve?
Provides battle-tested, readable building blocks out of the box.

## 4. Intuitive explanation
Before writing a utility function, check if Python already built it for you.

## 5. Real-world analogy
Think of `docs.python.org/3/library/` as the hardware store catalog—know what aisles exist (`math`, `statistics`, `datetime`, `random`).

## 6. Technical explanation
`statistics.mean()` / `median()`, `math.ceil()` / `floor()` / `isclose()`, `random.choice()` / `randint()`, `datetime.date.today()` / `timedelta(days=7)`.

## 7. Syntax and usage
`from datetime import date, timedelta`

## 8. Simple example
```python
import statistics

scores = [80, 90, 95, 70]
print("Mean:", statistics.mean(scores), "Median:", statistics.median(scores))
```

## 9. Detailed code walkthrough
Computes arithmetic mean (`83.75`) and median (`85.0`) cleanly.

## 10. Execution flow
1. Import `statistics`. 2. Compute `mean` and `median`. 3. Print.

## 11. Expected output
```
Mean: 83.75 Median: 85.0
```

## 12. More complex example
```python
from datetime import date, timedelta
import math

start = date(2026, 11, 16)
deadline = start + timedelta(days=14)
print("Deadline:", deadline.isoformat())
print("Pages needed:", math.ceil(47 / 10))
```

## 13. Common mistakes
Using `random` for security tokens or passwords (use `secrets` instead), or comparing floats with `==` instead of `math.isclose()`.

## 14. Incorrect versus correct code
**Incorrect:** `0.1 + 0.2 == 0.3  # False due to binary float representation`
**Correct:** `math.isclose(0.1 + 0.2, 0.3)`

## 15. Debugging guidance
Use `help(math.isclose)` in the REPL to inspect docstrings without leaving your terminal.

## 16. When to use this concept
Always reach for stdlib modules before installing third-party packages for basic math, stats, or dates.

## 17. When not to use it
Don't use `random` for cryptography—use `secrets`.

## 18. Relationship with other Python concepts
Builds directly into `csv` and `json` stdlib modules in Module 08.

## 19. Practical application
Reporting dashboards, scheduling deadlines, simulations.

## 20. Lesson summary
Leverage `statistics`, `math`, `random`, and `datetime` from stdlib and verify signatures in `docs.python.org`.
