# Truthiness, Short-Circuit Evaluation & Identity Checks

## Lesson Metadata
- **Lesson ID:** `M02-L03`
- **Module ID:** `module-02`
- **Concept ID:** `truthiness-and-short-circuiting`
- **Lesson Title:** Truthiness, Short-Circuit Evaluation & Identity Checks
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M02-L01
- **Learning Objectives:**
  - Classify truthy vs. falsy values
  - Predict short-circuit return values
  - Use 'is None' safely

## 1. What is this concept?
Truthiness is how Python converts any object to `True` or `False` in a boolean context. Short-circuiting stops evaluating `and`/`or` as soon as the outcome is certain.

## 2. Why does it exist?
Instead of writing `if len(items) > 0:`, Python lets you write `if items:`, and short-circuiting prevents crashes like dividing by zero.

## 3. What problem does it solve?
Makes guard checks concise and safe.

## 4. Intuitive explanation
Empty things (`0`, `""`, `[]`, `{}`, `set()`, `None`, `False`) are **falsy**; almost everything else is **truthy**. And `and`/`or` don't return `True`/`False`—they return the *deciding operand itself*!

## 5. Real-world analogy
Like a relay race where `or` hands the baton to the first runner who is awake (truthy), and `and` stops at the first runner who trips (falsy).

## 6. Technical explanation
`A and B`: if `A` is falsy, return `A` immediately without evaluating `B`; else return `B`. `A or B`: if `A` is truthy, return `A` immediately; else return `B`. Use `x is None` (identity) rather than `x == None`.

## 7. Syntax and usage
`name = raw_name or "Guest"` | `if count != 0 and total / count > 10:`

## 8. Simple example
```python
user_input = ""
display_name = user_input or "Anonymous"
print(display_name)
```

## 9. Detailed code walkthrough
`user_input` is `""` (falsy), so `or` evaluates and returns the right operand `"Anonymous"`.

## 10. Execution flow
1. Bind `user_input = ""`. 2. `or` checks truthiness of `""` (False). 3. Evaluates `"Anonymous"`. 4. Returns `"Anonymous"`.

## 11. Expected output
```
Anonymous
```

## 12. More complex example
```python
data = None
if data is not None and len(data) > 0:
    print("First:", data[0])
else:
    print("No data available")
```

## 13. Common mistakes
Using `val or 10` when `0` is a valid value (`0` is falsy, so `0 or 10` unexpectedly becomes `10`!), or using `==` for `None`.

## 14. Incorrect versus correct code
**Incorrect:**
```python
retries = 0
effective = retries or 3  # Bug: 0 is falsy, becomes 3!
```
**Correct:**
```python
retries = 0
effective = 3 if retries is None else retries
```

## 15. Debugging guidance
Check `bool(value)` in the REPL to verify whether a custom or empty value is truthy or falsy.

## 16. When to use this concept
Use `if items:` to check non-empty collections and `x is not None and ...` to guard attribute/index access.

## 17. When not to use it
Never use `x or default` when `0`, `0.0`, `False`, or `""` are valid inputs—check `is None` explicitly.

## 18. Relationship with other Python concepts
Essential for safe exception avoidance (Module 05) and default argument patterns (Module 04).

## 19. Practical application
Config fallbacks, null-safe API parsing, and division-by-zero guards.

## 20. Lesson summary
Empty/zero/`None` values are falsy; `and`/`or` short-circuit and return an operand; always check `None` with `is`.
