# Defining Functions, Parameters, Return Values, Type Hints & Docstrings

## Lesson Metadata
- **Lesson ID:** `M04-L01`
- **Module ID:** `module-04`
- **Concept ID:** `function-definition-and-return`
- **Lesson Title:** Defining Functions, Parameters, Return Values, Type Hints & Docstrings
- **Difficulty:** Beginner
- **Estimated Duration:** 45 mins
- **Prerequisites:** Module 03
- **Learning Objectives:**
  - Define functions with def
  - Contrast return vs print
  - Add type hints and docstrings

## 1. What is this concept?
A function is a named, reusable block of code defined with `def` that accepts inputs (parameters) and optionally sends back a result (`return`).

## 2. Why does it exist?
Repeating logic across a program causes maintenance nightmares; functions let you write, name, and test an operation once.

## 3. What problem does it solve?
Eliminates code duplication and separates *computing* a value from *displaying* it.

## 4. Intuitive explanation
Think of a function like a coffee machine: you pass in beans and water (arguments), it brews internally, and hands back a cup (`return`).

## 5. Real-world analogy
A vending machine doesn't shout the snack name—it drops the snack into the tray (`return`). `print()` only displays text on screen and returns `None`.

## 6. Technical explanation
When Python executes `def`, it creates a function object (it does *not* run the body yet). Calling `fn(arg)` creates a new stack frame, binds parameters to argument references, executes the body, and exits at `return` (defaulting to `None`). Type hints (`x: int -> int`) document expected types for humans and tools like `mypy`.

## 7. Syntax and usage
`def greet(name: str, formal: bool = False) -> str:`

## 8. Simple example
```python
def add(a: int, b: int) -> int:
    """Return the sum of two integers."""
    return a + b

result = add(3, 4)
print(result)
```

## 9. Detailed code walkthrough
`def` registers `add`. `add(3, 4)` binds `a=3, b=4`, computes `7`, returns `7` to `result`.

## 10. Execution flow
1. Define `add`. 2. Call `add(3, 4)`. 3. Return `7`. 4. Print `7`.

## 11. Expected output
```
7
```

## 12. More complex example
```python
def format_receipt(item: str, price: float, tax_rate: float = 0.08, *tags: str) -> str:
    """Format a line item with optional tax rate and extra tags."""
    total = price * (1 + tax_rate)
    tag_str = ", ".join(tags) if tags else "standard"
    return f"{item}: ${total:.2f} [{tag_str}]"

print(format_receipt("Notebook", 10.0, 0.05, "stationery", "sale"))
```

## 13. Common mistakes
Using `print()` inside a function instead of `return`, causing `x = fn()` to store `None`.

## 14. Incorrect versus correct code
**Incorrect:**
```python
def square(n):
    print(n * n)

x = square(5) + 1  # TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
```
**Correct:**
```python
def square(n: int) -> int:
    return n * n

x = square(5) + 1
```

## 15. Debugging guidance
If you see `NoneType` errors, check whether your helper function forgot `return`.

## 16. When to use this concept
Always `return` computed values from logic functions; keep `print()` at the outer UI/CLI boundary.

## 17. When not to use it
Don't create 1-line wrapper functions that add no clarity over built-in operators.

## 18. Relationship with other Python concepts
Returning values directly enables `pytest` unit testing (Module 07).

## 19. Practical application
API handlers, business calculations, validators, formatters.

## 20. Lesson summary
Functions return `None` unless `return` is executed; use type hints and docstrings to make contracts explicit.
