# Module 09 – Common Mistakes & AI Tutor Guide
## Mistake 1: Using `re.search` Without Anchors for Validation
- **Incorrect Assumption:** `re.search(r"\d{3}", s)` checks that `s` is a 3-digit number.
- **Actual Behaviour:** Matches `"abc12345"` because `"123"` appears inside it.
- **Tutor Socratic Guidance:** Ask: *"If you run `re.search(r'\d{3}', 'order-12345')`, does `re.search` check the whole string or just look for a match anywhere inside?"*
