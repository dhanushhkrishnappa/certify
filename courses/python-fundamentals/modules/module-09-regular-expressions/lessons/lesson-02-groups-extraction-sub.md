# Capturing Groups, Data Extraction & re.sub

## Lesson Metadata
- **Lesson ID:** `M09-L02`
- **Module ID:** `module-09`
- **Concept ID:** `groups-extraction-and-substitution`
- **Lesson Title:** Capturing Groups, Data Extraction & re.sub
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M09-L01
- **Learning Objectives:**
  - Extract fields with groups
  - Replace patterns with re.sub

## 1. What is this concept?
Parentheses `(...)` create **capturing groups** that extract matched substrings, while `re.sub()` replaces pattern matches.

## 2. Why does it exist?
Often you don't just want to know *if* a string matches—you want to pull out the year, month, and day or mask sensitive tokens.

## 3. What problem does it solve?
Turns unstructured log lines into structured Python dicts/tuples.

## 4. Intuitive explanation
Capturing groups are like highlighters inside a stencil: they mark the exact pieces you want to lift out.

## 5. Real-world analogy
Named groups `(?P<year>\d{4})` let you read `m.group('year')` instead of guessing `m.group(1)`.

## 6. Technical explanation
`m = re.search(pattern, text)`: `m.group(0)` is the full match, `m.group(1)` is group 1, `m.groupdict()` returns named groups. `re.findall()` returns all matches. `re.sub(pat, repl, text)` replaces matches.

## 7. Syntax and usage
`m = re.search(r"(?P<user>\w+)@(?P<domain>[\w.]+)", email)`

## 8. Simple example
```python
import re

m = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})", "Date: 2026-11")
if m:
    print(m.groupdict())
```

## 9. Detailed code walkthrough
Extracts `year` and `month` into a dict.

## 10. Execution flow
1. Search string. 2. Match found. 3. Print `{'year': '2026', 'month': '11'}`.

## 11. Expected output
```
{'year': '2026', 'month': '11'}
```

## 12. More complex example
```python
import re

text = "Contact 987-654-3210 or 555-123-4567"
masked = re.sub(r"\b\d{3}-\d{3}-(\d{4})\b", r"XXX-XXX-\1", text)
print(masked)
```

## 13. Common mistakes
Calling `m.group(1)` without checking `if m:` first (`AttributeError: 'NoneType' object has no attribute 'group'`).

## 14. Incorrect versus correct code
**Incorrect:** `year = re.search(r"(\d{4})", s).group(1)` (crashes if no match!).
**Correct:** `m = re.search(...); if m: year = m.group(1)`

## 15. Debugging guidance
Check `if m is not None:` before accessing `.group(...)`.

## 16. When to use this concept
Use named groups for readability and `re.compile()` if reusing a pattern in a tight loop.

## 17. When not to use it
Don't write unreadable 100-character regexes when two simple `str.split()` calls are clearer.

## 18. Relationship with other Python concepts
Useful in OOP `__init__` validators (Module 10).

## 19. Practical application
PII redaction, log extraction, URL slug cleaning.

## 20. Lesson summary
Always guard `m = re.search(...)` against `None`, prefer named groups, and use `re.sub` for pattern-based cleanup.
