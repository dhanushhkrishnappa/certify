# Variables, Object References, Mutability & Copying

## Lesson Metadata
- **Lesson ID:** `M01-L02`
- **Module ID:** `module-01`
- **Concept ID:** `variables-and-object-references`
- **Lesson Title:** Variables, Object References, Mutability & Copying
- **Difficulty:** Beginner–Intermediate
- **Estimated Duration:** 50 mins
- **Prerequisites:** M01-L01
- **Learning Objectives:**
  - Explain variable binding as object references
  - Distinguish mutable from immutable objects
  - Use shallow vs. deep copies safely

## 1. What is this concept?
A variable in Python is a name bound to an object in memory. Mutability determines whether that object's internal contents can change after creation.

## 2. Why does it exist?
Programs need to name data, share it across operations, and know when changing one variable affects another.

## 3. What problem does it solve?
Understanding references prevents mysterious 'spooky action at a distance' bugs where modifying one list unexpectedly mutates another.

## 4. Intuitive explanation
In Python, variables are **name tags**, not boxes. Assigning `b = a` ties a second name tag `b` onto the *exact same object* in memory.

## 5. Real-world analogy
Think of a shared Google Doc link: `b = a` shares the link to the same document. Editing the doc via `b` changes what `a` sees. `b = a.copy()` makes a separate photocopy.

## 6. Technical explanation
Every Python value is a heap-allocated object with a type, a value, and a unique identity (`id(obj)`). `x = 10` creates an `int` object `10` and binds name `x` to it. `int`, `float`, `str`, and `tuple` are **immutable**; `list`, `dict`, and `set` are **mutable**.

## 7. Syntax and usage
`name = value` binds a name. `id(name)` inspects memory identity. `copy.copy()` creates a shallow copy; `copy.deepcopy()` recursively copies nested mutable objects.

## 8. Simple example
```python
score = 10
backup = score
score = score + 5
print(score, backup)
```

## 9. Detailed code walkthrough
`score` binds to `10`. `backup` binds to the same `10`. `score + 5` creates a *new* `int` object `15` and rebinds `score`, leaving `backup` bound to `10`.

## 10. Execution flow
1. `10` created. 2. `score -> 10`, `backup -> 10`. 3. `15` created. 4. `score -> 15`, `backup -> 10`.

## 11. Expected output
```
15 10
```

## 12. More complex example
```python
import copy

team_a = [["Alice", 90], ["Bob", 85]]
shallow = team_a.copy()
deep = copy.deepcopy(team_a)

team_a[0][1] = 99
print("Original:", team_a)
print("Shallow: ", shallow)
print("Deep:    ", deep)
```

## 13. Common mistakes
Assuming `b = a` copies a list, or assuming `.copy()` protects nested lists inside a list.

## 14. Incorrect versus correct code
**Incorrect:**
```python
default_tags = ["python"]
user_tags = default_tags
user_tags.append("web")  # Mutates default_tags too!
```
**Correct:**
```python
default_tags = ["python"]
user_tags = default_tags.copy()
user_tags.append("web")
```

## 15. Debugging guidance
Print `id(a) == id(b)` or `a is b` when debugging unexpected mutations. If `True`, both names point to the exact same object.

## 16. When to use this concept
Use `.copy()` when you want an independent top-level list/dict; use `copy.deepcopy()` when your structure contains nested lists or dicts.

## 17. When not to use it
Don't `deepcopy` huge read-only structures unnecessarily—it consumes extra time and memory.

## 18. Relationship with other Python concepts
Directly underpins function parameter passing (Module 04) and dictionary key hashability (Lesson M01-L04).

## 19. Practical application
Prevents state corruption in web APIs, shopping carts, and configuration templates.

## 20. Lesson summary
Variables are references to objects. Immutable objects are rebound on change; mutable objects can change in place, so copy intentionally.
