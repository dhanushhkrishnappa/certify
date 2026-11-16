# TDD Basics, Edge Cases, PEP 8 Naming & Documentation

## Lesson Metadata
- **Lesson ID:** `M07-L02`
- **Module ID:** `module-07`
- **Concept ID:** `tdd-and-code-quality`
- **Lesson Title:** TDD Basics, Edge Cases, PEP 8 Naming & Documentation
- **Difficulty:** Intermediate
- **Estimated Duration:** 40 mins
- **Prerequisites:** M07-L01
- **Learning Objectives:**
  - Practice Red-Green-Refactor
  - Apply PEP 8 naming and docstrings

## 1. What is this concept?
Test-Driven Development (TDD) writes a failing test *first* (Red), writes minimal code to pass it (Green), and cleans up the design (Refactor). PEP 8 defines Python's standard style.

## 2. Why does it exist?
Writing tests first clarifies what a function should do—including edge cases—before you write a single line of implementation.

## 3. What problem does it solve?
Prevents over-engineering and keeps codebases readable for teams.

## 4. Intuitive explanation
Red-Green-Refactor is like drawing the target before shooting the arrow.

## 5. Real-world analogy
PEP 8 naming is road signage: `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.

## 6. Technical explanation
Edge cases include empty collections (`[]`, `""`), `0`, negative numbers, duplicates, and boundary values. Docstrings (`"""..."""`) explain *what* a function does and its return value; `#` comments explain *why* non-obvious decisions were made.

## 7. Syntax and usage
`MAX_RETRIES = 3` | `def compute_tax(amount: float) -> float:` | `class InvoiceItem:`

## 8. Simple example
```python
MAX_SCORE = 100

def is_passing(score: int) -> bool:
    """Return True if score is within [70, MAX_SCORE]."""
    return 70 <= score <= MAX_SCORE

assert is_passing(70) is True
assert is_passing(69) is False
assert is_passing(101) is False
print("TDD boundary checks passed!")
```

## 9. Detailed code walkthrough
Tests exact boundary (`69`, `70`) and out-of-range (`101`).

## 10. Execution flow
1. Define constant and function. 2. Run 3 boundary assertions. 3. Print.

## 11. Expected output
```
TDD boundary checks passed!
```

## 12. More complex example
```python
def safe_average(values: list[float]) -> float:
    """Return arithmetic mean, or 0.0 when values is empty."""
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)

assert safe_average([]) == 0.0
assert safe_average([10, 10, 11]) == 10.33
print("Edge cases passed!")
```

## 13. Common mistakes
Testing only the happy path (`[80, 90]`) and forgetting empty lists (`[]` -> `ZeroDivisionError`).

## 14. Incorrect versus correct code
**Incorrect:** `return sum(values) / len(values)` (crashes on `[]`).
**Correct:** Handle `if not values: return 0.0`.

## 15. Debugging guidance
Ask: 'What happens if the input is empty, zero, negative, or huge?'

## 16. When to use this concept
Use TDD for business rules and tricky parsers; follow PEP 8 everywhere.

## 17. When not to use it
Don't write comments that merely restate obvious code (`x += 1  # increment x`).

## 18. Relationship with other Python concepts
Prepares for testing file parsers (Module 08) and classes (Module 10).

## 19. Practical application
Team code reviews, open-source contributions, production APIs.

## 20. Lesson summary
Follow Red-Green-Refactor, test empty/boundary cases, and adhere to PEP 8 naming and docstrings.
