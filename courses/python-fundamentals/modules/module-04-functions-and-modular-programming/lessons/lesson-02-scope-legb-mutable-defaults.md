# LEGB Scope, Global vs. Local & The Mutable Default Trap

## Lesson Metadata
- **Lesson ID:** `M04-L02`
- **Module ID:** `module-04`
- **Concept ID:** `scope-legb-and-mutable-defaults`
- **Lesson Title:** LEGB Scope, Global vs. Local & The Mutable Default Trap
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M04-L01
- **Learning Objectives:**
  - Trace LEGB scope lookup
  - Avoid global state mutations
  - Fix mutable default arguments

## 1. What is this concept?
Scope determines where a variable name is visible. Python resolves names using **LEGB**: Local → Enclosing → Global → Built-in.

## 2. Why does it exist?
Without local scope, every function could accidentally overwrite variables in every other function.

## 3. What problem does it solve?
Isolates temporary variables inside each function call.

## 4. Intuitive explanation
Local variables live inside the function's temporary room and vanish when the function returns. Default arguments, however, are created *once* when `def` runs!

## 5. Real-world analogy
Think of a hotel room (local scope) vs. the hotel lobby (global scope). If you leave a shared notepad (`[]`) in the `def` lobby as a default argument, every guest writes on the *same* notepad!

## 6. Technical explanation
Assigning `x = 5` inside a function creates a local `x` unless `global x` or `nonlocal x` is declared. Default values (`def add(item, bucket=[])`) are evaluated once at function definition time, not per call.

## 7. Syntax and usage
`def add_item(item: str, bucket: list[str] | None = None) -> list[str]:`

## 8. Simple example
```python
rate = 10  # Global

def calc(hours: int) -> int:
    bonus = 5  # Local
    return hours * rate + bonus

print(calc(3))
```

## 9. Detailed code walkthrough
`calc` finds `hours` and `bonus` in Local scope, and `rate` in Global scope.

## 10. Execution flow
1. Bind `rate=10`. 2. Call `calc(3)`. 3. Resolve `rate` via LEGB. 4. Return `35`.

## 11. Expected output
```
35
```

## 12. More complex example
```python
def append_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    if tags is None:
        tags = []
    tags.append(tag)
    return tags

print(append_tag("py"))
print(append_tag("ai"))
```

## 13. Common mistakes
Using `tags=[]` as a default parameter, causing calls to share and accumulate items across unrelated invocations.

## 14. Incorrect versus correct code
**Incorrect:**
```python
def append_tag(tag, tags=[]):
    tags.append(tag)
    return tags
# Second call returns ['py', 'ai']!
```
**Correct:**
```python
def append_tag(tag, tags=None):
    if tags is None:
        tags = []
    tags.append(tag)
    return tags
```

## 15. Debugging guidance
If a function behaves differently the second time you call it with the same arguments, check for `global` mutations or mutable default arguments.

## 16. When to use this concept
Pass inputs as parameters and return new values; use `None` as the default for mutable collections.

## 17. When not to use it
Avoid `global` for mutable application state—pass state explicitly or encapsulate it in a class (Module 10).

## 18. Relationship with other Python concepts
Directly connects to object references (Module 01) and closures.

## 19. Practical application
Clean, stateless backend services and bug-free helper functions.

## 20. Lesson summary
Python looks up names via LEGB; never use a mutable object (`[]`, `{}`) as a default parameter.
