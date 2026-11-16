# Assertions, Unit Testing Fundamentals & pytest

## Lesson Metadata
- **Lesson ID:** `M07-L01`
- **Module ID:** `module-07`
- **Concept ID:** `assertions-and-unit-testing`
- **Lesson Title:** Assertions, Unit Testing Fundamentals & pytest
- **Difficulty:** Beginner–Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** Module 06
- **Learning Objectives:**
  - Use assert and pytest
  - Separate tests into test_*.py

## 1. What is this concept?
Unit testing verifies individual functions in isolation using automated checks (`assert` and `pytest`).

## 2. Why does it exist?
Manual `print()` testing is slow and forgets old edge cases whenever you refactor code.

## 3. What problem does it solve?
Catches regressions immediately and gives you confidence to improve code.

## 4. Intuitive explanation
`assert condition` says: 'I guarantee this is true—if not, sound the alarm (`AssertionError`).' `pytest` runs all `test_*` functions automatically and prints a clean report.

## 5. Real-world analogy
Like a pre-flight checklist: instead of flying and hoping, you test every gauge automatically before takeoff.

## 6. Technical explanation
`pytest` discovers files named `test_*.py` or `*_test.py` and runs functions prefixed with `test_`. Use `with pytest.raises(ValueError):` (or `try/except ValueError` in plain `assert` tests) to verify invalid inputs raise the right exception.

## 7. Syntax and usage
`def test_add(): assert add(2, 3) == 5`

## 8. Simple example
```python
def clamp(val: int, low: int, high: int) -> int:
    return max(low, min(val, high))

def test_clamp() -> None:
    assert clamp(5, 0, 10) == 5
    assert clamp(-3, 0, 10) == 0
    assert clamp(99, 0, 10) == 10

test_clamp()
print("All assertions passed!")
```

## 9. Detailed code walkthrough
`test_clamp` verifies normal, below-min, and above-max cases.

## 10. Execution flow
1. Define `clamp`. 2. Run 3 assertions. 3. Print success.

## 11. Expected output
```
All assertions passed!
```

## 12. More complex example
```python
def normalize_email(raw: str) -> str:
    cleaned = raw.strip().lower()
    if "@" not in cleaned:
        raise ValueError("Missing @")
    return cleaned

def test_normalize_email() -> None:
    assert normalize_email("  User@Example.COM ") == "user@example.com"
    try:
        normalize_email("invalid")
        assert False, "Expected ValueError"
    except ValueError:
        pass

test_normalize_email()
print("Email tests passed!")
```

## 13. Common mistakes
Using `assert` for runtime user-input validation in production (`python -O` strips `assert` statements! Use `if ...: raise ValueError` instead).

## 14. Incorrect versus correct code
**Incorrect:** `assert age >= 0  # Stripped with python -O!`
**Correct:** `if age < 0: raise ValueError('age must be >= 0')`

## 15. Debugging guidance
Give each test one clear responsibility (`test_empty_input`, `test_negative_input`) so failures pinpoint the exact broken case.

## 16. When to use this concept
Write unit tests for every pure function and bug fix.

## 17. When not to use it
Don't use `assert` for production input validation or security checks.

## 18. Relationship with other Python concepts
Directly mirrors CERTIFY's `SandboxService` unit-test evaluation.

## 19. Practical application
CI/CD pipelines, library maintenance, refactoring.

## 20. Lesson summary
Use `pytest` (`test_*.py`, `test_*()`), test normal + edge + exception cases, and never use `assert` for production validation.
