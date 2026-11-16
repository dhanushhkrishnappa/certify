# Regex Patterns, Raw Strings, Character Classes, Quantifiers & Anchors

## Lesson Metadata
- **Lesson ID:** `M09-L01`
- **Module ID:** `module-09`
- **Concept ID:** `regex-syntax-and-raw-strings`
- **Lesson Title:** Regex Patterns, Raw Strings, Character Classes, Quantifiers & Anchors
- **Difficulty:** Intermediate
- **Estimated Duration:** 50 mins
- **Prerequisites:** Module 01
- **Learning Objectives:**
  - Use raw strings r'...'
  - Combine classes, quantifiers, and anchors

## 1. What is this concept?
A regular expression (regex) is a mini-language for describing text patterns—like '4 digits, a hyphen, then 2 letters'.

## 2. Why does it exist?
Checking formats like `YYYY-MM-DD` or extracting IDs from logs with nested `if` statements is tedious and fragile.

## 3. What problem does it solve?
Expresses complex string matching in one compact, declarative pattern.

## 4. Intuitive explanation
Think of regex as a stencil: you hold the stencil (`r"\d{4}-\d{2}-\d{2}"`) over text to see if it fits.

## 5. Real-world analogy
Always prefix regexes with `r"..."` (raw string) so Python doesn't eat backslashes like `\n` or `\d` before `re` sees them.

## 6. Technical explanation
Classes: `\d` (digit), `\w` (word char), `\s` (whitespace), `.` (any char except newline), `[a-z]` (set). Quantifiers: `+` (1+), `*` (0+), `?` (0 or 1), `{n,m}`. Anchors: `^` (start), `$` (end), `\b` (word boundary).

## 7. Syntax and usage
`re.fullmatch(r"\d{4}-\d{2}-\d{2}", text)`

## 8. Simple example
```python
import re

code = "PY-2026"
matched = bool(re.fullmatch(r"[A-Z]{2}-\d{4}", code))
print("Valid code:", matched)
```

## 9. Detailed code walkthrough
Matches exactly 2 uppercase letters, `-`, and 4 digits across the whole string.

## 10. Execution flow
1. Compile/run `fullmatch`. 2. Returns Match object (truthy). 3. Prints `True`.

## 11. Expected output
```
Valid code: True
```

## 12. More complex example
```python
import re

for s in ["id=42", "id=42!", "99"]:
    print(s, "->", bool(re.fullmatch(r"id=\d+", s)))
```

## 13. Common mistakes
Using `re.search(r"\d{4}", text)` for validation without `^`/`$` (so `"abc1234xyz"` wrongly passes!).

## 14. Incorrect versus correct code
**Incorrect:** `re.search(r"\d{4}", "12345")  # Matches '1234' inside '12345'!`
**Correct:** `re.fullmatch(r"\d{4}", "12345")  # None (False)`

## 15. Debugging guidance
Test patterns with both valid and near-miss invalid strings (prefix/suffix junk).

## 16. When to use this concept
Use `re.fullmatch()` for format validation; use `str.startswith()`/`in` for simple literal checks.

## 17. When not to use it
Never use regex to parse nested HTML/JSON—use `json` or a real parser.

## 18. Relationship with other Python concepts
Pairs with capturing groups (M09-L02) and OOP attribute validation (Module 10).

## 19. Practical application
Input validation, log parsing, data sanitization.

## 20. Lesson summary
Use `r"..."` raw strings, `re.fullmatch` for validation, and anchor patterns carefully.
