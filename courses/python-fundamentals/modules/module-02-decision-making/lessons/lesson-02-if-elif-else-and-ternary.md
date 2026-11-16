# Conditional Statements: if, elif, else, Nesting & Expressions

## Lesson Metadata
- **Lesson ID:** `M02-L02`
- **Module ID:** `module-02`
- **Concept ID:** `branching-if-elif-else`
- **Lesson Title:** Conditional Statements: if, elif, else, Nesting & Expressions
- **Difficulty:** Beginner
- **Estimated Duration:** 45 mins
- **Prerequisites:** M02-L01
- **Learning Objectives:**
  - Write clean if/elif/else chains
  - Order conditions properly
  - Use ternary conditional expressions appropriately

## 1. What is this concept?
Conditional statements (`if`, `elif`, `else`) execute different indented blocks depending on which boolean condition is true first.

## 2. Why does it exist?
Programs must respond differently to different inputs (e.g., pass vs. fail, admin vs. guest).

## 3. What problem does it solve?
Allows mutually exclusive paths without running every block.

## 4. Intuitive explanation
Python checks conditions from top to bottom and enters *at most one* branch in an `if`/`elif`/`else` chain—then skips the rest.

## 5. Real-world analogy
Like a coin sorter: a coin falls into the first slot that fits it and never reaches the slots below.

## 6. Technical explanation
Each `if`/`elif` header ends with `:`, and its body is indented 4 spaces. A conditional expression (`x if cond else y`) evaluates to one of two values inline.

## 7. Syntax and usage
`if cond1: ... elif cond2: ... else: ...`

## 8. Simple example
```python
score = 84
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
print(grade)
```

## 9. Detailed code walkthrough
`score >= 90` is `False`, so Python checks `score >= 80` (`True`), sets `grade = "B"`, and skips `else`.

## 10. Execution flow
1. Bind `score = 84`. 2. Test `84 >= 90` (False). 3. Test `84 >= 80` (True). 4. Assign `"B"`. 5. Print.

## 11. Expected output
```
B
```

## 12. More complex example
```python
items = 3
label = "item" if items == 1 else "items"
print(f"{items} {label}")
```

## 13. Common mistakes
Putting a broader condition before a narrower one (e.g., `score >= 60` before `score >= 90`), making `>= 90` unreachable.

## 14. Incorrect versus correct code
**Incorrect:**
```python
if score >= 60:
    grade = "Pass"
elif score >= 90:
    grade = "Honors"  # Never reached!
```
**Correct:**
```python
if score >= 90:
    grade = "Honors"
elif score >= 60:
    grade = "Pass"
```

## 15. Debugging guidance
Test boundary values (`59`, `60`, `89`, `90`) to verify every branch is reachable.

## 16. When to use this concept
Use `if`/`elif`/`else` for mutually exclusive cases; use separate `if` statements when multiple conditions can be true simultaneously.

## 17. When not to use it
Avoid nesting `if` statements 4+ levels deep; use `elif` or early returns (Module 04) instead.

## 18. Relationship with other Python concepts
Pairs with `match`/`case` for structural matching and feeds directly into `while`/`for` loop filtering (Module 03).

## 19. Practical application
Grading engines, discount rules, HTTP status routing, and CLI menus.

## 20. Lesson summary
`if`/`elif`/`else` picks the *first* matching branch top-to-bottom; order from most specific to most general.
