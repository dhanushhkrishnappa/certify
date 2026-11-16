# Boolean Expressions, Comparison & Logical Operators

## Lesson Metadata
- **Lesson ID:** `M02-L01`
- **Module ID:** `module-02`
- **Concept ID:** `boolean-logic-and-comparisons`
- **Lesson Title:** Boolean Expressions, Comparison & Logical Operators
- **Difficulty:** Beginner
- **Estimated Duration:** 40 mins
- **Prerequisites:** Module 01
- **Learning Objectives:**
  - Write accurate comparison expressions
  - Combine conditions with and/or/not
  - Use chained comparisons

## 1. What is this concept?
A boolean expression evaluates to `True` or `False` (type `bool`), letting a program test relationships between values.

## 2. Why does it exist?
Decisions require yes/no questions: Is the password long enough? Is the temperature within safe bounds?

## 3. What problem does it solve?
Replaces guesswork with exact, testable rules.

## 4. Intuitive explanation
Comparisons ask a question (`age >= 18`); logical operators combine questions (`has_ticket and age >= 18`).

## 5. Real-world analogy
Like a security checkpoint: `and` means *both* badges are required; `or` means *either* badge works; `not` flips the sign.

## 6. Technical explanation
Python supports `==`, `!=`, `<`, `<=`, `>`, `>=`, and chained comparisons (`10 <= x <= 20`, equivalent to `10 <= x and x <= 20`). Precedence order is comparisons first, then `not`, then `and`, then `or`.

## 7. Syntax and usage
`cond = (score >= 70) and not is_suspended`

## 8. Simple example
```python
temp = 22
is_comfortable = 18 <= temp <= 26
print(is_comfortable)
```

## 9. Detailed code walkthrough
Python checks `18 <= 22` (`True`) and `22 <= 26` (`True`), returning `True`.

## 10. Execution flow
1. Bind `temp = 22`. 2. Evaluate left comparison. 3. Evaluate right comparison. 4. Print `True`.

## 11. Expected output
```
True
```

## 12. More complex example
```python
age = 20
has_id = True
vip = False
can_enter = (age >= 21 and has_id) or vip
print("Can enter:", can_enter)
```

## 13. Common mistakes
Writing `age == 18 or 19` (always truthy because `19` is non-zero) or confusing `=` (assignment) with `==` (comparison).

## 14. Incorrect versus correct code
**Incorrect:**
```python
day = "Sat"
if day == "Sat" or "Sun":
    print("Weekend")
```
**Correct:**
```python
day = "Sat"
if day == "Sat" or day == "Sun":
    print("Weekend")
```

## 15. Debugging guidance
Break complex conditions into named boolean variables (`is_weekend = day in {"Sat", "Sun"}`) to inspect each part.

## 16. When to use this concept
Use chained comparisons for range checks and parentheses whenever mixing `and` with `or`.

## 17. When not to use it
Avoid overly dense single-line boolean formulas with 4+ negations; simplify or extract a helper.

## 18. Relationship with other Python concepts
Directly drives `if`/`elif` branching (M02-L02) and `while` loop conditions (Module 03).

## 19. Practical application
Used in access control, form validation, pricing tiers, and feature flags.

## 20. Lesson summary
Comparisons produce `bool` values; `not` > `and` > `or` defines precedence; never omit the left-hand variable after `or`.
