# Module 01 – Common Mistakes & AI Tutor Guide

## Mistake 1: Treating Variables as Fixed Boxes (`b = a` copies data)
- **Incorrect Assumption:** Assigning `b = a` creates an independent copy of `a`.
- **Why Beginners Make It:** Physical-world analogies (putting items in labeled boxes) mislead learners about Python's reference model.
- **Incorrect Code:**
  ```python
  a = [1, 2]
  b = a
  b.append(3)
  print(a)  # Learner expects [1, 2]
  ```
- **Actual Behaviour:** Prints `[1, 2, 3]` because both `a` and `b` reference the same list object.
- **Correct Code:** `b = a.copy()` (or `copy.deepcopy(a)` for nested mutables).
- **Tutor Socratic Guidance:** Ask: *"If `id(a)` and `id(b)` print the exact same number, how many list objects exist in memory?"*

## Mistake 2: Empty Set Literal `{}`
- **Incorrect Assumption:** `{}` creates an empty `set`.
- **Why Beginners Make It:** Non-empty sets use `{1, 2}`, so `{}` looks symmetric.
- **Incorrect Code:** `s = {}; s.add(1)` → `AttributeError: 'dict' object has no attribute 'add'`.
- **Correct Code:** `s = set(); s.add(1)`.
- **Tutor Socratic Guidance:** Ask: *"What does `type({})` return in Python, and how does Python tell an empty dictionary apart from an empty set?"*

## Mistake 3: Forgetting `input()` Returns a String
- **Incorrect Assumption:** Typing `5` into `input()` gives the integer `5`.
- **Actual Behaviour:** `"5" + "5"` produces `"55"`, or `"5" + 1` raises `TypeError`.
- **Correct Code:** `num = int(input("Number: "))`.
- **Tutor Socratic Guidance:** Ask: *"Before adding `1`, what does `type(user_input)` show?"*
