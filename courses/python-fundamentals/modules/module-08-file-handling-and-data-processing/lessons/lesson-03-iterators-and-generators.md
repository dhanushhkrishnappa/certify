# Extension: Iterators, Generators & yield for Stream Processing

## Lesson Metadata
- **Lesson ID:** `M08-L03`
- **Module ID:** `module-08`
- **Concept ID:** `iterators-and-lazy-generators`
- **Lesson Title:** Extension: Iterators, Generators & yield for Stream Processing
- **Difficulty:** Intermediate–Advanced
- **Estimated Duration:** 50 mins
- **Prerequisites:** M08-L01, Module 04
- **Learning Objectives:**
  - Contrast yield vs return
  - Build lazy generator pipelines

## 1. What is this concept?
An **iterator** produces items one at a time via `next()`. A **generator** is a function using `yield` that pauses its execution frame between items.

## 2. Why does it exist?
Loading a 5-million-line file into a `list` can crash your program with `MemoryError`.

## 3. What problem does it solve?
Generators process arbitrarily large streams using $O(1)$ constant memory.

## 4. Intuitive explanation
`return` hands you the whole pizza box and closes the kitchen; `yield` hands you one hot slice whenever you ask, pausing the chef until you're ready for the next.

## 5. Real-world analogy
Like a ticket dispenser: it doesn't print 1,000,000 tickets upfront—it prints the next number only when someone pulls one.

## 6. Technical explanation
Calling a generator function returns a generator object without running the body yet. Each `next(gen)` resumes from the last `yield` until `StopIteration`.

## 7. Syntax and usage
`def stream_lines(lines): for line in lines: if line.strip(): yield line`

## 8. Simple example
```python
def count_up(limit: int):
    n = 1
    while n <= limit:
        yield n
        n += 1

print(list(count_up(4)))
```

## 9. Detailed code walkthrough
`count_up(4)` yields `1`, pauses, resumes on next request, and stops after `4`.

## 10. Execution flow
1. Create generator. 2. `list()` pulls `1, 2, 3, 4` one by one. 3. Prints `[1, 2, 3, 4]`.

## 11. Expected output
```
[1, 2, 3, 4]
```

## 12. More complex example
```python
def parse_non_empty(lines):
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            yield stripped

raw_logs = ["# header", "", "INFO ok", "WARN low_disk"]
for entry in parse_non_empty(raw_logs):
    print(entry)
```

## 13. Common mistakes
Trying to iterate over the *same* generator twice (generators are exhausted after one pass!) or indexing `gen[0]`.

## 14. Incorrect versus correct code
**Incorrect:**
```python
g = (x * 2 for x in range(3))
print(len(g))  # TypeError: object of type 'generator' has no len()
```
**Correct:** Iterate once with `for` or convert with `list(g)` only when small.

## 15. Debugging guidance
Use `next(gen, default)` to safely peek at one item without crashing on `StopIteration`.

## 16. When to use this concept
Use generators for large files, streaming pipelines, and infinite sequences.

## 17. When not to use it
Don't use a generator if you need random indexing (`items[5]`), `len()`, or multiple passes.

## 18. Relationship with other Python concepts
Directly aligns with CERTIFY's `lazy-evaluation` BKT concept.

## 19. Practical application
Log streaming, ETL pipelines, paginated API consumers.

## 20. Lesson summary
`yield` suspends function state to produce items lazily in $O(1)$ memory; generators are single-pass.
