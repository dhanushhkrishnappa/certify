# Modules, import Mechanics & if __name__ == '__main__'

## Lesson Metadata
- **Lesson ID:** `M06-L01`
- **Module ID:** `module-06`
- **Concept ID:** `modules-imports-and-main-guard`
- **Lesson Title:** Modules, import Mechanics & if __name__ == '__main__'
- **Difficulty:** Beginner–Intermediate
- **Estimated Duration:** 40 mins
- **Prerequisites:** Module 04
- **Learning Objectives:**
  - Use import and from ... import
  - Guard entrypoints with __name__

## 1. What is this concept?
A module is any `.py` file containing reusable definitions. `import` loads a module so another file can use its functions and classes.

## 2. Why does it exist?
Real software spans many files; putting everything in one file becomes unmaintainable.

## 3. What problem does it solve?
Enables code reuse, clean namespaces, and modular testing.

## 4. Intuitive explanation
`import math` brings the whole toolbox (`math.sqrt(16)`); `from math import sqrt` puts just the screwdriver on your workbench (`sqrt(16)`).

## 5. Real-world analogy
`if __name__ == "__main__":` is like a front door: if you run the file directly, it opens; if another file imports it for tools, the front door stays closed.

## 6. Technical explanation
When Python imports a module, it executes top-level statements once and caches the module in `sys.modules`. `__name__` is `'__main__'` only when run directly.

## 7. Syntax and usage
`import statistics` | `from datetime import date` | `if __name__ == "__main__": main()`

## 8. Simple example
```python
import math

def circle_area(radius: float) -> float:
    return round(math.pi * radius ** 2, 2)

if __name__ == "__main__":
    print(circle_area(5))
```

## 9. Detailed code walkthrough
Imports `math`, defines `circle_area`, and runs `print` only when executed directly.

## 10. Execution flow
1. Load `math`. 2. Bind `circle_area`. 3. Check `__name__ == '__main__'`. 4. Print `78.54`.

## 11. Expected output
```
78.54
```

## 12. More complex example
```python
import random as rng

def pick_winner(names: list[str]) -> str:
    if not names:
        raise ValueError("No candidates")
    return rng.choice(names)

if __name__ == "__main__":
    print("Winner:", pick_winner(["Asha", "Ravi", "Maya"]))
```

## 13. Common mistakes
Naming your own file `random.py` or `math.py` (shadowing the standard library!) or using `from module import *`.

## 14. Incorrect versus correct code
**Incorrect:** Saving your script as `random.py` and writing `import random; random.randint(1, 6)` -> `AttributeError`.

## 15. Debugging guidance
Print `module.__file__` if an import behaves unexpectedly—it reveals whether Python loaded your local file instead of stdlib.

## 16. When to use this concept
Use `import module` or explicit `from module import name`; always add `if __name__ == '__main__':` to executable scripts.

## 17. When not to use it
Avoid `from x import *`—it hides where names come from.

## 18. Relationship with other Python concepts
Required for importing functions into `pytest` test files (Module 07).

## 19. Practical application
Multi-file Python packages and CLI tools.

## 20. Lesson summary
Never shadow stdlib filenames, avoid `import *`, and guard script execution with `if __name__ == '__main__':`.
