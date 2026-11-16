# Extension: Unpacking, enumerate(), zip() & Comprehensions

## Lesson Metadata
- **Lesson ID:** `M03-L03`
- **Module ID:** `module-03`
- **Concept ID:** `pythonic-iteration-and-comprehensions`
- **Lesson Title:** Extension: Unpacking, enumerate(), zip() & Comprehensions
- **Difficulty:** Intermediate
- **Estimated Duration:** 50 mins
- **Prerequisites:** M03-L02
- **Learning Objectives:**
  - Unpack tuples in loops
  - Use enumerate() and zip()
  - Write clean list and dict comprehensions

## 1. What is this concept?
Unpacking assigns multiple sequence items to variables at once. `enumerate()` pairs indices with items; `zip()` pairs multiple iterables; comprehensions build lists/dicts concisely.

## 2. Why does it exist?
Manual `for i in range(len(items)):` is noisy and error-prone.

## 3. What problem does it solve?
Makes iteration self-documenting and eliminates off-by-one indexing bugs.

## 4. Intuitive explanation
Instead of grabbing a numbered ticket and looking up two separate lists, `zip(names, scores)` staples each name directly to its score before you loop.

## 5. Real-world analogy
`enumerate(items, start=1)` is like numbering seats in a theater row as people walk in.

## 6. Technical explanation
Tuple unpacking: `a, b = (1, 2)`. `enumerate()` yields `(index, value)` tuples. `zip(a, b)` stops at the shortest iterable. List comprehension: `[expr for x in seq if cond]`. Dict comprehension: `{k: v for k, v in pairs}`.

## 7. Syntax and usage
`for idx, val in enumerate(items):` | `[x * 2 for x in nums if x > 0]`

## 8. Simple example
```python
names = ["Asha", "Ravi"]
scores = [92, 85]
board = {name: score for name, score in zip(names, scores)}
print(board)
```

## 9. Detailed code walkthrough
`zip` pairs `('Asha', 92)` and `('Ravi', 85)`; the dict comprehension unpacks each pair into key and value.

## 10. Execution flow
1. `zip` yields pairs. 2. Comprehension unpacks `name, score`. 3. Builds dict. 4. Prints.

## 11. Expected output
```
{'Asha': 92, 'Ravi': 85}
```

## 12. More complex example
```python
tasks = ["setup", "test", "deploy"]
for num, task in enumerate(tasks, start=1):
    print(f"{num}. {task.title()}")

even_squares = [n ** 2 for n in range(1, 7) if n % 2 == 0]
print(even_squares)
```

## 13. Common mistakes
Writing nested 3-clause comprehensions that are unreadable, or forgetting `zip()` stops at the shorter list.

## 14. Incorrect versus correct code
**Incorrect (noisy):**
```python
for i in range(len(tasks)):
    print(i + 1, tasks[i])
```
**Correct (Pythonic):**
```python
for i, task in enumerate(tasks, start=1):
    print(i, task)
```

## 15. Debugging guidance
Convert a tricky comprehension back into a normal `for` loop with `.append()` to inspect intermediate values.

## 16. When to use this concept
Use comprehensions for simple 1-loop transformations/filters; use `enumerate`/`zip` whenever you need indices or parallel sequences.

## 17. When not to use it
Do not use comprehensions solely for side effects like `print()`—use a regular `for` loop.

## 18. Relationship with other Python concepts
Prepares directly for generator expressions in Module 08.

## 19. Practical application
Transforming API payloads, building lookup dicts, ranking leaderboards.

## 20. Lesson summary
Prefer `enumerate()`, `zip()`, and readable 1-level comprehensions over manual `range(len(...))` loops.
