# Module 03 – Common Mistakes & AI Tutor Guide

## Mistake 1: Modifying a List While Iterating Over It
- **Incorrect Code:**
  ```python
  nums = [1, 2, 3, 4]
  for n in nums:
      if n % 2 == 0:
          nums.remove(n)
  ```
- **Actual Behaviour:** Removing shifts indices left, causing Python's internal iterator to skip elements on larger lists.
- **Correct Code:** `nums = [n for n in nums if n % 2 != 0]`.
- **Tutor Socratic Guidance:** Ask: *"If you remove item at index 1 while the loop moves to index 2, which element just shifted into index 1?"*
