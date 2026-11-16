# Module 10 – Common Mistakes & AI Tutor Guide
## Mistake 1: Mutable Class Variable Shared Across Instances
- **Incorrect Assumption:** Defining `items = []` directly under `class Cart:` gives each `Cart()` its own empty list.
- **Actual Behaviour:** All `Cart` instances share the exact same `Cart.items` list object.
- **Correct Code:** Initialize `self.items = []` inside `__init__(self)`.
- **Tutor Socratic Guidance:** Ask: *"When is `items = []` at the class level evaluated—once when the class is defined, or each time you call `Cart()`?"*
