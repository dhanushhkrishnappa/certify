# Syntax, Runtime & Logical Errors and Reading Tracebacks

## Lesson Metadata
- **Lesson ID:** `M05-L01`
- **Module ID:** `module-05`
- **Concept ID:** `error-taxonomy-and-tracebacks`
- **Lesson Title:** Syntax, Runtime & Logical Errors and Reading Tracebacks
- **Difficulty:** Beginner
- **Estimated Duration:** 40 mins
- **Prerequisites:** Module 04
- **Learning Objectives:**
  - Classify the 3 error types
  - Read tracebacks bottom-up

## 1. What is this concept?
Python errors fall into three categories: **SyntaxError** (invalid grammar before execution), **Runtime Exceptions** (crashes during execution), and **Logical Errors** (runs without crashing but produces wrong answers).

## 2. Why does it exist?
Knowing *which* kind of error you're facing tells you immediately how to fix it.

## 3. What problem does it solve?
Turns intimidating red traceback walls into clear diagnostic roadmaps.

## 4. Intuitive explanation
A SyntaxError is a typo in a recipe; a Runtime Exception is discovering the fridge is out of milk while cooking; a Logical Error is using salt instead of sugar.

## 5. Real-world analogy
Think of a traceback as a stack of receipts showing which function called which—always read the **bottom line first** to see what broke, then look up to see where it started.

## 6. Technical explanation
Python compiles source to bytecode first (`SyntaxError` happens here). During execution, invalid operations raise `Exception` subclasses (`ValueError`, `TypeError`, `KeyError`, `IndexError`, `ZeroDivisionError`).

## 7. Syntax and usage
`Traceback (most recent call last): ... ValueError: invalid literal for int() with base 10: 'abc'`

## 8. Simple example
```python
# Runtime exception example (guarded)
try:
    num = int("abc")
except ValueError as err:
    print("Caught runtime error:", err)
```

## 9. Detailed code walkthrough
`int("abc")` fails at runtime because `'abc'` is valid Python syntax, just not a valid base-10 integer.

## 10. Execution flow
1. Enter `try`. 2. Call `int('abc')`. 3. Raise `ValueError`. 4. Jump to `except ValueError`. 5. Print message.

## 11. Expected output
```
Caught runtime error: invalid literal for int() with base 10: 'abc'
```

## 12. More complex example
```python
def parse_age(raw: str) -> int:
    return int(raw.strip())

for sample in ["25", "twenty"]:
    try:
        print("Parsed:", parse_age(sample))
    except ValueError as exc:
        print(f"Invalid input {sample!r}: {exc}")
```

## 13. Common mistakes
Panicking at long tracebacks or ignoring the exception type name at the very bottom.

## 14. Incorrect versus correct code
**Incorrect debugging:** Guessing randomly at line 1.
**Correct debugging:** Read bottom line (`KeyError: 'email'`) -> check exact line in your file.

## 15. Debugging guidance
Inspect the last frame in *your* own file (above library frames) first.

## 16. When to use this concept
Use traceback reading on every crash before changing any code.

## 17. When not to use it
Don't suppress exceptions just to hide tracebacks during development.

## 18. Relationship with other Python concepts
Foundation for `try/except` (M05-L02) and `pytest.raises` (Module 07).

## 19. Practical application
Production log triage and bug reproduction.

## 20. Lesson summary
Read tracebacks bottom-up: error type + message first, then the call chain.
