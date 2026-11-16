# Module 02 – Common Mistakes & AI Tutor Guide

## Mistake 1: `if x == "a" or "b":`
- **Incorrect Assumption:** Python distributes `x ==` across `or`.
- **Actual Behaviour:** Parsed as `(x == "a") or ("b")`. Since `"b"` is a non-empty string (truthy), the condition is **always** `True`.
- **Correct Code:** `if x == "a" or x == "b":` or `if x in {"a", "b"}:`.
- **Tutor Socratic Guidance:** Ask: *"If you wrap parentheses around the two sides of `or`, what is on the right side, and is a non-empty string truthy or falsy?"*

## Mistake 2: Using `is` to Compare Strings or Numbers
- **Incorrect Assumption:** `is` is a cleaner synonym for `==`.
- **Actual Behaviour:** `is` checks memory identity (`id(a) == id(b)`), which can fail for distinct list/string/large-int objects with equal values.
- **Correct Code:** Use `==` for values; reserve `is` for `None`, `True`, `False`.
- **Tutor Socratic Guidance:** Ask: *"What is the difference between two identical twins (`==`) and the exact same person (`is`)?"*
