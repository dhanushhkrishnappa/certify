# Core Collections: Lists, Tuples, Dictionaries & Sets

## Lesson Metadata
- **Lesson ID:** `M01-L04`
- **Module ID:** `module-01`
- **Concept ID:** `core-collections-overview`
- **Lesson Title:** Core Collections: Lists, Tuples, Dictionaries & Sets
- **Difficulty:** Beginner–Intermediate
- **Estimated Duration:** 50 mins
- **Prerequisites:** M01-L02, M01-L03
- **Learning Objectives:**
  - Create and manipulate lists, tuples, dicts, and sets
  - Choose the right collection for ordering, mutability, and lookup speed

## 1. What is this concept?
Collections group multiple values into a single container: `list` (ordered, mutable), `tuple` (ordered, immutable), `dict` (key-value mapping), and `set` (unique, unordered).

## 2. Why does it exist?
Real programs manage sequences of items, fixed records, lookup tables, and unique memberships—not just isolated variables.

## 3. What problem does it solve?
Choosing the right collection makes code simpler, safer against accidental edits, and dramatically faster for lookups.

## 4. Intuitive explanation
- **List `[]`:** A numbered to-do list you can add to or reorder.
- **Tuple `()`:** GPS coordinates `(lat, lon)` locked in place.
- **Dict `{k: v}`:** A real dictionary mapping words (keys) to definitions (values).
- **Set `{}`:** A guest list where duplicates are automatically ignored.

## 5. Real-world analogy
Think of a backpack (`list`), a sealed envelope (`tuple`), a labeled filing cabinet (`dict`), and a unique stamp collection (`set`).

## 6. Technical explanation
`list` supports indexing (`items[0]`), `.append()`, and slicing. `tuple` supports indexing but not item assignment. `dict` and `set` use hash tables for average $O(1)$ lookup, which requires keys/elements to be **hashable** (immutable).

## 7. Syntax and usage
`nums = [1, 2]`, `coords = (12.9, 77.5)`, `user = {"name": "Asha"}`, `tags = {"py", "ai"}` (empty set must be `set()`, not `{}`!).

## 8. Simple example
```python
scores = [88, 92, 88]
unique_scores = set(scores)
print(unique_scores)
```

## 9. Detailed code walkthrough
`scores` keeps order and duplicates. `set(scores)` hashes each integer and keeps only unique values.

## 10. Execution flow
1. List created. 2. Set iterates over list, hashes `88` and `92`, ignores second `88`. 3. Prints `{88, 92}`.

## 11. Expected output
```
{88, 92}
```

## 12. More complex example
```python
course = ("PY101", "Python Foundations")
enrolled = {"asha", "ravi"}
enrolled.add("asha")  # duplicate ignored
grades = {"asha": 95, "ravi": 88}
print(f"{course[0]}: {len(enrolled)} students, Asha={grades.get('asha')}")
```

## 13. Common mistakes
Writing `{}` expecting an empty set (it creates an empty `dict`!), or using a `list` as a `dict` key (`TypeError: unhashable type: 'list'`).

## 14. Incorrect versus correct code
**Incorrect:**
```python
seen = {}
seen.add("a")  # AttributeError: 'dict' object has no attribute 'add'
```
**Correct:**
```python
seen = set()
seen.add("a")
```

## 15. Debugging guidance
Use `dict.get(key, default)` instead of `dict[key]` when a key might be missing to avoid `KeyError`.

## 16. When to use this concept
Use `list` for ordered changing sequences, `tuple` for fixed records, `dict` for key-value lookups, and `set` for deduplication/membership.

## 17. When not to use it
Don't rely on `set` ordering, and don't use a `list` for membership checks across thousands of items when a `set` is $O(1)$.

## 18. Relationship with other Python concepts
Forms the foundation for loops (Module 03), comprehensions, and JSON/CSV processing (Module 08).

## 19. Practical application
Every web API payload, database record, and analytics pipeline relies on these four containers.

## 20. Lesson summary
Lists are ordered & mutable; tuples are ordered & immutable; dicts map keys to values; sets store unique hashable items.
