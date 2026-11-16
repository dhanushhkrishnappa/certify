# Handling Exceptions with try, except, else & finally

## Lesson Metadata
- **Lesson ID:** `M05-L02`
- **Module ID:** `module-05`
- **Concept ID:** `try-except-else-finally`
- **Lesson Title:** Handling Exceptions with try, except, else & finally
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M05-L01
- **Learning Objectives:**
  - Catch specific exceptions
  - Use else and finally correctly

## 1. What is this concept?
`try`/`except`/`else`/`finally` lets a program catch expected runtime errors, run success-only code in `else`, and run guaranteed cleanup in `finally`.

## 2. Why does it exist?
Programs shouldn't crash just because a user typed `'abc'` instead of `'10'`.

## 3. What problem does it solve?
Keeps programs resilient while ensuring errors are handled explicitly rather than silently swallowed.

## 4. Intuitive explanation
`try` is the risky step; `except` is the backup plan; `else` is the celebration when nothing went wrong; `finally` is turning off the lights whether things succeeded or failed.

## 5. Real-world analogy
Like crossing a bridge: `try` crossing; `except` detour if closed; `else` continue trip; `finally` log your mileage.

## 6. Technical explanation
Keep `try` blocks tiny—only wrap the specific line(s) that can raise the targeted exception. Never use bare `except:` (which catches `KeyboardInterrupt` and `SystemExit` too!).

## 7. Syntax and usage
`try: ... except ValueError: ... else: ... finally: ...`

## 8. Simple example
```python
def safe_divide(a: float, b: float) -> float | None:
    try:
        result = a / b
    except ZeroDivisionError:
        print("Cannot divide by zero.")
        return None
    else:
        return result

print(safe_divide(10, 2))
print(safe_divide(10, 0))
```

## 9. Detailed code walkthrough
`10 / 2` succeeds and returns via `else`; `10 / 0` jumps to `except ZeroDivisionError` and returns `None`.

## 10. Execution flow
1. Call `safe_divide(10, 2)` -> `5.0`. 2. Call `safe_divide(10, 0)` -> prints error, returns `None`.

## 11. Expected output
```
5.0
Cannot divide by zero.
None
```

## 12. More complex example
```python
def parse_positive(raw: str) -> int | None:
    try:
        val = int(raw)
    except ValueError:
        print(f"{raw!r} is not an integer.")
        return None
    else:
        print("Conversion succeeded.")
        return val
    finally:
        print("Attempt finished.")

print(parse_positive("42"))
```

## 13. Common mistakes
Writing `except:` or `except Exception: pass` which hides real bugs like `NameError` or `TypeError`.

## 14. Incorrect versus correct code
**Incorrect:**
```python
try:
    val = int(raw)
except:
    val = 0  # Hides KeyboardInterrupt and typos!
```
**Correct:**
```python
try:
    val = int(raw)
except ValueError:
    val = 0
```

## 15. Debugging guidance
Always name the exact exception class (`ValueError`, `KeyError`, `ZeroDivisionError`).

## 16. When to use this concept
Use `try/except` for expected external/input failures; use `finally` for cleanup when not using `with`.

## 17. When not to use it
Don't use `try/except` to mask bugs in your own logic (like `IndexError` from off-by-one loops).

## 18. Relationship with other Python concepts
Essential for File I/O (`FileNotFoundError`, Module 08) and network requests.

## 19. Practical application
CLI input loops, API clients, database transactions.

## 20. Lesson summary
Keep `try` blocks narrow, catch specific exceptions, use `else` for success paths and `finally` for guaranteed cleanup.
