# Module 04 – Common Mistakes & AI Tutor Guide
## Mistake 1: Mutable Default Argument (`def f(x=[])`)
- **Incorrect Assumption:** `x=[]` creates a fresh empty list on every call.
- **Actual Behaviour:** The single list created at `def` time is reused across all calls where `x` is omitted.
- **Correct Code:** Use `x: list | None = None` and `if x is None: x = []`.
- **Tutor Socratic Guidance:** Ask: *"When does Python evaluate the `= []` expression in `def f(x=[])`—when you define the function, or each time you call it?"*
