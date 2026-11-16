# while Loops, for Loops & range()

## Lesson Metadata
- **Lesson ID:** `M03-L01`
- **Module ID:** `module-03`
- **Concept ID:** `while-and-sentinel-loops`
- **Lesson Title:** while Loops, for Loops & range()
- **Difficulty:** Beginner
- **Estimated Duration:** 45 mins
- **Prerequisites:** Module 02
- **Learning Objectives:**
  - Write terminating while loops
  - Iterate with for and range()

## 1. What is this concept?
Loops repeat a block of code: `while` repeats as long as a condition is truthy; `for` repeats once per item in an iterable.

## 2. Why does it exist?
Processing 10 or 10,000 items should not require copying and pasting code 10,000 times.

## 3. What problem does it solve?
Automates repetition and lets programs handle arbitrary-sized data.

## 4. Intuitive explanation
`while` is *'keep going until...'*; `for` is *'do this for every item in...'*.

## 5. Real-world analogy
`while` is like washing dishes until the sink is empty; `for` is like handing a flyer to every person in a line.

## 6. Technical explanation
`range(start, stop, step)` generates integers lazily from `start` up to `stop - 1`. In `for x in seq:`, Python requests an iterator from `seq` and binds `x` to each item.

## 7. Syntax and usage
`while attempts > 0:` | `for i in range(1, 6):` | `for ch in word:`

## 8. Simple example
```python
for step in range(1, 4):
    print(f"Step {step}")
```

## 9. Detailed code walkthrough
`range(1, 4)` yields `1`, `2`, `3` (stopping before `4`).

## 10. Execution flow
1. `step=1` -> print. 2. `step=2` -> print. 3. `step=3` -> print. 4. Loop ends.

## 11. Expected output
```
Step 1
Step 2
Step 3
```

## 12. More complex example
```python
countdown = 3
while countdown > 0:
    print(countdown)
    countdown -= 1
print("Go!")
```

## 13. Common mistakes
Forgetting `countdown -= 1` (infinite loop), or assuming `range(1, 5)` includes `5`.

## 14. Incorrect versus correct code
**Incorrect:**
```python
i = 0
while i < 3:
    print(i)  # Infinite loop: i never changes!
```
**Correct:**
```python
i = 0
while i < 3:
    print(i)
    i += 1
```

## 15. Debugging guidance
Print the loop variable on each iteration if a loop hangs or runs one time too few/many.

## 16. When to use this concept
Use `for` when iterating over a collection or fixed count; use `while` when waiting for a condition or sentinel.

## 17. When not to use it
Don't use `while` with a manual index `i += 1` when `for item in items:` works directly.

## 18. Relationship with other Python concepts
Sets up loop control (`break`/`continue`) and comprehensions (M03-L03).

## 19. Practical application
Retrying network requests, processing records, pagination.

## 20. Lesson summary
`for` iterates over items; `while` repeats while a condition holds; always ensure `while` makes progress toward termination.
