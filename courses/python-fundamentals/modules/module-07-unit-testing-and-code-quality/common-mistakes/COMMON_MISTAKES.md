# Module 07 – Common Mistakes & AI Tutor Guide
## Mistake 1: Using `assert` for Production Input Validation
- **Incorrect Assumption:** `assert` is a shorthand for `if ...: raise ValueError`.
- **Actual Behaviour:** Running Python with `-O` (optimized mode) completely disables `assert` statements.
- **Tutor Socratic Guidance:** Ask: *"What happens to `assert` statements if someone runs your script with `python3 -O app.py`?"*
