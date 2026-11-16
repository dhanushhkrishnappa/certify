# Module 08 – Common Mistakes & AI Tutor Guide
## Mistake 1: Exhausting a Generator and Re-Iterating
- **Incorrect Assumption:** A generator works like a `list` and can be looped over multiple times.
- **Actual Behaviour:** The second `for` loop yields zero items because the generator is exhausted.
- **Tutor Socratic Guidance:** Ask: *"Once a generator hits the end of its function body, where is its execution pointer?"*
