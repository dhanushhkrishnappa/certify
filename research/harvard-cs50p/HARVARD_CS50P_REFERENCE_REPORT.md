# Harvard CS50P Reference Report for CERTIFY

**Reference Course:** CS50's Introduction to Programming with Python (CS50P)  
**Institution:** Harvard University (David J. Malan)  
**Official URL:** [https://cs50.harvard.edu/python/](https://cs50.harvard.edu/python/)  
**License:** CC BY-NC-SA 4.0 ([https://cs50.harvard.edu/python/license/](https://cs50.harvard.edu/python/license/))  
**Access Date:** 2026-11-16  
**Purpose:** Curriculum architecture, pedagogical sequencing, and gap analysis for authoring CERTIFY's independent commercial *Python Fundamentals* course.

> **Attribution & Independence Notice:** CERTIFY is an independent commercial platform and is **not** affiliated with, endorsed by, or certified by Harvard University or CS50. No Harvard CS50P lecture transcripts, slides, notes, source code examples, graphics, or problem statements are reproduced in CERTIFY's production curriculum or RAG corpus.

---

## 1. Course Overview & Intended Audience

CS50P ([cs50.harvard.edu/python/](https://cs50.harvard.edu/python/)) is a 10-week (Weeks 0–9) introductory programming course focused exclusively on Python. Unlike CS50x (which surveys C, Python, SQL, and JavaScript), CS50P teaches programming from first principles using Python alone.

- **Intended Audience:** Complete beginners with or without prior programming experience who want to learn Python specifically, including students preparing for CS50x or standalone software development.
- **Format:** Weekly ~60–150 minute live-coded lectures, short focused concept videos ("Shorts"), browser-based VS Code (`cs50.dev`) or local setups, weekly Problem Sets (Weeks 0–8), and a capstone Final Project.

---

## 2. Overall Learning Progression & Weekly Topic Breakdown

| Week | Official Title | Core Concepts & Keywords Observed | Lecture Duration (Approx.) | Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **0** | [Functions, Variables](https://cs50.harvard.edu/python/weeks/0/) | CLI, Python interpreter, `print`, arguments, side effects, bugs, return values, variables, comments, pseudocode, `str`, string methods, `split`, `int`, `float`, numeric formatting, `def`, scope, `return` | ~1h 45m | Problem Set 0 (5 tasks) |
| **1** | [Conditionals](https://cs50.harvard.edu/python/weeks/1/) | `if`, `elif`, `else`, `or`, `and`, `!=`, indentation/colons, chained comparisons, modulo (`%`), `bool`, Pythonic boolean expressions, `match` | ~56m | Problem Set 1 (5 tasks) |
| **2** | [Loops](https://cs50.harvard.edu/python/weeks/2/) | `while`, `for`, `range`, `continue`, `break`, input validation, `list`, `len`, `dict`, lists of dicts, `None`, nested loops | ~1h 20m | Problem Set 2 (5 tasks) |
| **3** | [Exceptions](https://cs50.harvard.edu/python/weeks/3/) | `SyntaxError`, `ValueError`, `NameError`, `try`/`except`/`else`, reprompting with `break`, `get_int` helper pattern, `pass`, `raise` | ~44m | Problem Set 3 (4 tasks) |
| **4** | [Libraries](https://cs50.harvard.edu/python/weeks/4/) | Modules, `import`, `from`, `random`, `statistics`, `sys.argv`, `IndexError`, `sys.exit`, list slices, PyPI & `pip`, `requests`, JSON, custom modules & `__name__` | ~1h 10m | Problem Set 4 (6 tasks) |
| **5** | [Unit Tests](https://cs50.harvard.edu/python/weeks/5/) | `assert`, `AssertionError`, `pytest`, test categories, testing exceptions (`pytest.raises`), side effects vs return values, test packages (`__init__.py`) | ~50m | Problem Set 5 (4 tasks) |
| **6** | [File I/O](https://cs50.harvard.edu/python/weeks/6/) | `open`, `with` context manager, `sorted`, sort keys & `lambda`, CSV (`csv.reader`, `DictReader`, `writer`, `DictWriter`), binary/image files with `PIL` | ~1h 32m | Problem Set 6 (4 tasks) |
| **7** | [Regular Expressions](https://cs50.harvard.edu/python/weeks/7/) | Input validation without regex vs `re` library, patterns, `^`/`$`, character classes, flags, groups & capturing, `match`/`fullmatch`, `:=` walrus operator, `re.sub`, `re.search` | ~2h 04m | Problem Set 7 (5 tasks) |
| **8** | [Object-Oriented Programming](https://cs50.harvard.edu/python/weeks/8/) | `tuple`, `dict` vs `class`, objects, attributes, instance methods, `__init__`, validation (`raise`), `__str__`, `@property` getters/setters, `@classmethod`, `@staticmethod`, inheritance, operator overloading (`__add__`) | ~2h 32m | Problem Set 8 (3 tasks) |
| **9** | [Et Cetera](https://cs50.harvard.edu/python/weeks/9/) | `set`, `global`, constants, type hints & `mypy`, docstrings, `argparse`, unpacking (`*args`, `**kwargs`), `map`, `filter`, list/dict comprehensions, `enumerate`, generators, `yield`, iterators | ~2h 23m | [Final Project](https://cs50.harvard.edu/python/project/) |

---

## 3. Prerequisite Relationships

1. **Functions-First Entry (Week 0):** Introduces calling built-in functions (`print`, `input`) and defining custom functions (`def`) in the very first lecture, establishing decomposition early.
2. **Control Flow Before Data Structures (Weeks 1–2):** Conditionals (`if/elif/else`) precede loops (`while/for`), which then motivate `list` and `dict` collections.
3. **Defensive Programming Before External Code (Week 3 → 4):** Exceptions (`try/except`) are taught before libraries (`sys.argv`, `requests`), enabling safe CLI argument and API error handling.
4. **Testing Tied to Return Values (Week 0/3 → 5):** Unit testing (`pytest`) explicitly revisits earlier functions to demonstrate why returning values (rather than only printing side effects) makes code testable.
5. **Text & Persistence Before Modeling (Weeks 6–7 → 8):** File I/O and Regex precede OOP, so learners already appreciate structured data before encapsulating state and behavior in classes.
6. **Idiomatic Python Synthesis (Week 9):** Comprehensions, generators (`yield`), type hints, and `*args`/`**kwargs` synthesize all prior weeks.

---

## 4. Teaching, Practical & Assessment Approaches Observed

- **Live-Coded Iterative Refinement:** Lectures start with a minimal working script (e.g., 1–2 lines), deliberately encounter limitations or bugs, and refactor step-by-step into clean functions.
- **High-Level Assessment Model:** Weekly problem sets ([cs50.harvard.edu/python/psets/](https://cs50.harvard.edu/python/psets/)) focus on small, real-world-inspired CLI programs evaluated via automated black-box I/O checks (`check50`) and style checks (`style50`), culminating in an open-ended Final Project ([cs50.harvard.edu/python/project/](https://cs50.harvard.edu/python/project/)) requiring `main()` + 3 top-level functions + `pytest` tests + a 500-word `README.md` + a 3-minute demo video.
- **Shorts & Multi-Format Accessibility:** Each week pairs the main lecture with 5–15 minute focused "Shorts" (e.g., *List Methods*, *String Slicing*, *Recursion*), transcripts, slides, and downloadable source indexes.

---

## 5. Useful Curriculum Design Observations for CERTIFY

1. **Early Function Decomposition:** Teaching `def` and `return` early prevents students from writing monolithic scripts and directly supports automated unit testing later.
2. **Side Effects vs. Return Values:** Making this distinction explicit early pays huge dividends when learners write `pytest` tests and debug functions.
3. **Refactoring Earlier Solutions:** CS50P Week 5 re-tests earlier problem domains using `pytest`. CERTIFY can adopt this spiral reinforcement pattern (using original CERTIFY problems) to boost Bayesian Knowledge Tracing (BKT) retention.

---

## 6. Potential Gaps CERTIFY Should Address

1. **Memory Model, References & Mutability:** CS50P touches `list`, `tuple`, and `dict`, but does not deeply visualize Python's object-reference model (`id()`, aliasing, shallow vs. deep copy, mutable default argument trap). CERTIFY's `schema.prisma` and `seed.ts` explicitly prioritize this—our curriculum should teach it early and visually.
2. **Sets, Tuples, and Dictionaries Delayed:** CS50P introduces `tuple` in Week 8 and `set` in Week 9. Introducing `tuple` and `set` alongside `list` and `dict` in Module 01 (with deeper hash-table mechanics later) gives beginners a complete mental model of Python's four core collections from the start.
3. **Explicit `finally` and Exception Hierarchy:** CS50P Week 3 covers `try/except/else/raise` but omits `finally` and custom/built-in exception class hierarchies (`BaseException` -> `Exception` -> `ValueError`).
4. **JSON & Virtual Environments:** CS50P covers JSON briefly via `requests` in Week 4 and CSV in Week 6, but dedicated local `json.load`/`json.dump` file handling and `venv` virtual environment workflows are essential for modern Python developers.
5. **OOP Encapsulation & Composition:** CS50P Week 8 focuses heavily on `@property`, `@classmethod`, and inheritance; CERTIFY should equally emphasize composition over inheritance, `__repr__` vs `__str__`, and practical encapsulation.
6. **Logical Errors & Systematic Debugging:** Beyond syntax and runtime tracebacks, beginners need a structured debugging methodology (reading tracebacks bottom-up, binary-search print/logging, rubber-ducking, state inspection).

---

## 7. Recommendations for CERTIFY (AI-Powered Learning & BKT Platform)

1. **Atomic Concept Granularity for BKT:** Break each module into 3–6 atomic concepts with explicit `defaultP0` priors and 2–3 observable `RubricCriterion` items (`EASY`, `MEDIUM`, `HARD`) so the deterministic BKT engine (`backend/src/modules/mastery/bkt.ts`) can update `pMastery` accurately.
2. **Misconception-First Tutor Knowledge:** Store structured common mistakes (incorrect assumption -> why beginners think this -> broken code -> actual behavior -> fixed code -> Socratic tutor probe) so the AI tutor guides discovery instead of spoiling answers.
3. **Self-Contained RAG Corpus:** Author 100% original, cleanly chunked Markdown lessons (350–500 tokens per section with atomic code blocks) so CERTIFY's planned `pgvector` `course_embeddings` pipeline has zero licensing risk and high retrieval precision.
4. **Sandbox-Compatible Practical Tasks:** Remember CERTIFY's `sandbox.service.ts` blocks `open()`, `pathlib`, `socket`, `subprocess`, and `eval`. Design practical auto-graded tasks around pure functions (`in-memory` data structures, `io.StringIO` or string/dict inputs) for sandboxed execution, while providing local-runnable `.py` scripts for File I/O and CLI modules.
