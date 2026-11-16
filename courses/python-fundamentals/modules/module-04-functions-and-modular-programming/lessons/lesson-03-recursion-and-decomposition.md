# Recursion Fundamentals & Modular Decomposition

## Lesson Metadata
- **Lesson ID:** `M04-L03`
- **Module ID:** `module-04`
- **Concept ID:** `recursion-and-decomposition`
- **Lesson Title:** Recursion Fundamentals & Modular Decomposition
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M04-L01
- **Learning Objectives:**
  - Write base and recursive cases
  - Decompose problems into small functions

## 1. What is this concept?
Recursion is a technique where a function solves a problem by calling itself on a smaller subproblem until reaching a base case. Modular decomposition splits big tasks into small, single-purpose functions.

## 2. Why does it exist?
Some problems (nested folders, tree structures, factorial/Fibonacci) are naturally self-similar, and large programs are unreadable without decomposition.

## 3. What problem does it solve?
Turns overwhelming problems into tiny, verifiable pieces.

## 4. Intuitive explanation
Recursion is like Russian nesting dolls: open one doll to find a smaller doll, until you reach the smallest solid doll (base case).

## 5. Real-world analogy
Every recursive function needs two rules: (1) when to stop (**base case**), and (2) how to shrink the problem (**recursive step**).

## 6. Technical explanation
Each recursive call pushes a new frame onto the call stack. Python limits stack depth (~1000 frames) and raises `RecursionError` if the base case is missing or unreachable.

## 7. Syntax and usage
`if n <= 1: return 1; return n * factorial(n - 1)`

## 8. Simple example
```python
def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))
```

## 9. Detailed code walkthrough
`factorial(4)` waits for `4 * factorial(3)` -> `3 * factorial(2)` -> `2 * factorial(1)` -> `1`, unwinding to `24`.

## 10. Execution flow
1. Push frames 4, 3, 2, 1. 2. Base case returns 1. 3. Unwind: 2*1=2, 3*2=6, 4*6=24.

## 11. Expected output
```
24
```

## 12. More complex example
```python
def sum_nested(items: list) -> int:
    total = 0
    for item in items:
        if isinstance(item, list):
            total += sum_nested(item)
        else:
            total += item
    return total

print(sum_nested([1, [2, [3, 4]], 5]))
```

## 13. Common mistakes
Omitting the base case (`RecursionError: maximum recursion depth exceeded`) or forgetting `return` before the recursive call.

## 14. Incorrect versus correct code
**Incorrect:**
```python
def countdown(n):
    print(n)
    countdown(n - 1)  # Never stops!
```
**Correct:**
```python
def countdown(n: int) -> None:
    if n <= 0:
        return
    print(n)
    countdown(n - 1)
```

## 15. Debugging guidance
Print `n` at entry to verify the argument is strictly moving toward the base case.

## 16. When to use this concept
Use recursion for arbitrarily nested trees/JSON; use `for`/`while` loops for flat sequences.

## 17. When not to use it
Don't use naive recursion for deep linear counts (>900 steps) where a `for` loop is faster and uses $O(1)$ stack.

## 18. Relationship with other Python concepts
Prepares for modular multi-file programs (Module 06) and unit testing (Module 07).

## 19. Practical application
Directory tree traversal, nested JSON parsing, divide-and-conquer algorithms.

## 20. Lesson summary
Break large tasks into small functions; every recursive function must have a reachable base case.
