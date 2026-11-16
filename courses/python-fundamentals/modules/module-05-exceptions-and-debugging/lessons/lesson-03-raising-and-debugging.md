# Raising Exceptions, Defensive Validation & Systematic Debugging

## Lesson Metadata
- **Lesson ID:** `M05-L03`
- **Module ID:** `module-05`
- **Concept ID:** `raising-and-defensive-debugging`
- **Lesson Title:** Raising Exceptions, Defensive Validation & Systematic Debugging
- **Difficulty:** Intermediate
- **Estimated Duration:** 40 mins
- **Prerequisites:** M05-L02
- **Learning Objectives:**
  - Raise ValueError on invalid arguments
  - Follow a 4-step debugging method

## 1. What is this concept?
`raise` intentionally signals an error when a function receives invalid data. Systematic debugging is a repeatable method to isolate and fix bugs.

## 2. Why does it exist?
Failing loudly at the boundary prevents silent data corruption deeper in the system.

## 3. What problem does it solve?
Enforces clear contracts between functions and turns guesswork into scientific troubleshooting.

## 4. Intuitive explanation
If someone hands a bank function a negative deposit, `raise ValueError("Amount must be positive")` stops the transaction immediately instead of corrupting the balance.

## 5. Real-world analogy
Like a smoke detector: failing early is noisy, but it prevents a much bigger disaster later.

## 6. Technical explanation
`raise ValueError("message")` constructs an exception object and unwinds the call stack until caught. Debugging workflow: (1) Reproduce consistently, (2) Isolate minimal failing input, (3) Inspect variables/state (`print(repr(x))`), (4) Fix root cause and add a test.

## 7. Syntax and usage
`if amount <= 0: raise ValueError("amount must be positive")`

## 8. Simple example
```python
def set_discount(percent: float) -> float:
    if not (0 <= percent <= 100):
        raise ValueError(f"Discount must be 0-100, got {percent}")
    return percent / 100

print(set_discount(20))
```

## 9. Detailed code walkthrough
Validates precondition before computing `percent / 100`.

## 10. Execution flow
1. Check `0 <= 20 <= 100` (True). 2. Return `0.2`.

## 11. Expected output
```
0.2
```

## 12. More complex example
```python
def withdraw(balance: float, amount: float) -> float:
    if amount <= 0:
        raise ValueError("Withdrawal must be positive")
    if amount > balance:
        raise ValueError("Insufficient funds")
    return balance - amount

try:
    print(withdraw(100.0, 150.0))
except ValueError as err:
    print("Blocked:", err)
```

## 13. Common mistakes
Returning `-1` or `"error"` silently instead of raising an exception, which callers forget to check.

## 14. Incorrect versus correct code
**Incorrect:**
```python
def divide(a, b):
    if b == 0:
        return -1  # Ambiguous: what if result really is -1?
```
**Correct:**
```python
def divide(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("Divisor cannot be zero")
    return a / b
```

## 15. Debugging guidance
When debugging a wrong result, print inputs and intermediate values on a 2-element test case.

## 16. When to use this concept
Use `raise ValueError` or `TypeError` for invalid function inputs.

## 17. When not to use it
Don't raise generic `Exception("error")`—pick the specific built-in type.

## 18. Relationship with other Python concepts
Directly tested via `pytest.raises(ValueError)` in Module 07 and class validation in Module 10.

## 19. Practical application
Input validators, financial APIs, domain models.

## 20. Lesson summary
Fail fast with `raise ValueError(...)` on bad inputs, and debug by reproducing, isolating, inspecting, and testing.
