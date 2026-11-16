# File Paths, open(), Context Managers (with) & File Exceptions

## Lesson Metadata
- **Lesson ID:** `M08-L01`
- **Module ID:** `module-08`
- **Concept ID:** `file-paths-and-context-managers`
- **Lesson Title:** File Paths, open(), Context Managers (with) & File Exceptions
- **Difficulty:** Beginner–Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** Module 05
- **Learning Objectives:**
  - Use pathlib.Path
  - Use with open() safely
  - Handle FileNotFoundError

## 1. What is this concept?
File I/O reads from and writes to disk. Context managers (`with`) guarantee files are closed automatically when the block exits.

## 2. Why does it exist?
Leaving files unclosed leaks OS file handles and can lose buffered writes if an exception occurs.

## 3. What problem does it solve?
Provides safe, cross-platform persistence without manual `.close()` boilerplate.

## 4. Intuitive explanation
`with open(...) as f:` is like an automatic revolving door—even if you trip inside, the door still closes behind you.

## 5. Real-world analogy
`pathlib.Path("data") / "log.txt"` builds OS-independent paths (Windows `\` vs macOS/Linux `/`) cleanly.

## 6. Technical explanation
Modes: `'r'` (read), `'w'` (overwrite/create), `'a'` (append). Always specify `encoding='utf-8'`. Wrap I/O in `try/except FileNotFoundError`.

## 7. Syntax and usage
`with Path('notes.txt').open('r', encoding='utf-8') as f:`

## 8. Simple example
```python
import io

# Using StringIO to demonstrate file-like context manager in memory
buffer = io.StringIO()
with buffer as f:
    f.write("line 1\nline 2\n")
    print("Written length:", len(f.getvalue()))
```

## 9. Detailed code walkthrough
Writes two lines inside a `with` context manager.

## 10. Execution flow
1. Open buffer. 2. Write text. 3. Print length. 4. Exit `with` cleanly.

## 11. Expected output
```
Written length: 14
```

## 12. More complex example
```python
from pathlib import Path

def read_safe(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""

print(repr(read_safe(Path("nonexistent_demo.txt"))))
```

## 13. Common mistakes
Forgetting `encoding='utf-8'` (breaks on emojis/accents on Windows) or opening in `'w'` mode when you meant `'a'` (erases existing file!).

## 14. Incorrect versus correct code
**Incorrect:** `f = open('a.txt', 'w'); f.write('hi')` (never closed, no encoding).
**Correct:** `with open('a.txt', 'w', encoding='utf-8') as f: f.write('hi')`

## 15. Debugging guidance
Check `path.resolve()` when `FileNotFoundError` occurs—your working directory may differ from the script's directory.

## 16. When to use this concept
Always use `with` for files and `pathlib.Path` for path manipulation.

## 17. When not to use it
Don't call `.read()` on a 10 GB log file—iterate line by line (`for line in f:`) instead.

## 18. Relationship with other Python concepts
Prepares for CSV/JSON (M08-L02) and lazy generators (M08-L03).

## 19. Practical application
Config loaders, log analyzers, report exporters.

## 20. Lesson summary
Use `pathlib.Path`, `with open(..., encoding='utf-8')`, and handle `FileNotFoundError`.
