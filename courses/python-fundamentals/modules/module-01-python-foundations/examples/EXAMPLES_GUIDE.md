# Module 01 – Worked Examples Guide

## `ex01_references_and_copying.py` (`M01-E01`)
- **Purpose:** Demonstrate immutable rebinding vs. mutable aliasing and shallow/deep copying.
- **Difficulty:** Beginner–Intermediate
- **Expected Output:**
  ```
  Integers -> a=50, b=42
  Alias shares mutation -> one=[10, 20, 30], alias=[10, 20, 30], copy=[10, 20]
  Nested -> original=[[999, 2], [3, 4]], shallow=[[999, 2], [3, 4]], deep=[[1, 2], [3, 4]]
  ```
- **Walkthrough:** `b = a` binds `b` to `42`; `a = a + 8` creates `50`. For `list_one`, `.append(30)` mutates the heap list in place, visible through `list_alias` but not `list_copy`. Nested mutation at `matrix[0][0]` leaks into `shallow` because only the outer list was copied, whereas `copy.deepcopy` clones inner lists too.
- **Common Mistake:** Using `=` thinking it duplicates a list.
- **Related Concepts:** `variables-and-object-references`, `core-collections-overview`.

## `ex02_types_and_formatting.py` (`M01-E02`)
- **Purpose:** Convert string inputs to `int`/`float` and format outputs with `//`, `%`, and f-strings.
- **Difficulty:** Beginner
- **Expected Output:** `Duration: 2 hr 25 min` and `Subtotal: $37.50`.
- **Common Mistake:** Using `/` instead of `//` for integer hours.

## `ex03_collections_comparison.py` (`M01-E03`)
- **Purpose:** Show `tuple`, `list`, `set`, and `dict` working together cleanly.
- **Difficulty:** Beginner–Intermediate
- **Expected Output:** `{'station_id': 'BLR-01', 'reading_count': 4, 'unique_readings': [24.5, 25.0, 26.1], 'alerts': ['HUMID_OK', 'TEMP_OK']}`
