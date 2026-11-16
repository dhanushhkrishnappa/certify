# break, continue, Nested Loops, Accumulation & Searching

## Lesson Metadata
- **Lesson ID:** `M03-L02`
- **Module ID:** `module-03`
- **Concept ID:** `loop-control-and-nesting`
- **Lesson Title:** break, continue, Nested Loops, Accumulation & Searching
- **Difficulty:** Beginner–Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M03-L01
- **Learning Objectives:**
  - Use break and continue accurately
  - Implement accumulator and search patterns

## 1. What is this concept?
`break` exits the innermost loop immediately; `continue` skips the rest of the current iteration and jumps to the next item.

## 2. Why does it exist?
Real loops often need to skip invalid items (`continue`) or stop early once a target is found (`break`).

## 3. What problem does it solve?
Prevents wasted work and deeply nested `if` blocks inside loops.

## 4. Intuitive explanation
`break` is an emergency exit door; `continue` is skipping a song on a playlist.

## 5. Real-world analogy
An accumulator is like a shopping basket: start empty (`total = 0`), then add each valid item as you walk the aisle.

## 6. Technical explanation
Initialize accumulators *before* the loop (`total = 0`, `results = []`). For search, initialize `found = False`, set `True` and `break` on match. Modifying a list *while* iterating over it skips elements—iterate over a copy or build a new list instead.

## 7. Syntax and usage
`for x in items: if x < 0: continue`

## 8. Simple example
```python
nums = [4, -1, 7, 0, 9]
total = 0
for n in nums:
    if n <= 0:
        continue
    total += n
print(total)
```

## 9. Detailed code walkthrough
Skips `-1` and `0`, accumulating `4 + 7 + 9 = 20`.

## 10. Execution flow
1. `total=0`. 2. `4` added. 3. `-1` skipped. 4. `7` added. 5. `0` skipped. 6. `9` added. 7. Print `20`.

## 11. Expected output
```
20
```

## 12. More complex example
```python
matrix = [[1, 2], [3, 4]]
target = 3
found = False
for row in matrix:
    for val in row:
        if val == target:
            found = True
            break
    if found:
        break
print("Found:", found)
```

## 13. Common mistakes
Initializing `total = 0` *inside* the loop (resets every iteration!) or mutating a list while looping over it.

## 14. Incorrect versus correct code
**Incorrect:**
```python
for n in [1, 2, 3]:
    total = 0
    total += n
```
**Correct:**
```python
total = 0
for n in [1, 2, 3]:
    total += n
```

## 15. Debugging guidance
Trace accumulator values before, during, and after the loop on a 3-element test list.

## 16. When to use this concept
Use `break` for early search exit and `continue` to keep loop bodies flat.

## 17. When not to use it
Avoid 3+ levels of nested loops; extract inner logic into a helper function (Module 04).

## 18. Relationship with other Python concepts
Directly motivates `enumerate`/`zip`/comprehensions (M03-L03) and file line-streaming (Module 08).

## 19. Practical application
Log filtering, subtotal calculation, grid traversal.

## 20. Lesson summary
Initialize accumulators outside the loop, use `continue` to skip, `break` to exit early, and never mutate a list you are iterating over.
