# Inheritance, Composition, Method Overriding & Special Methods

## Lesson Metadata
- **Lesson ID:** `M10-L03`
- **Module ID:** `module-10`
- **Concept ID:** `inheritance-composition-and-dunders`
- **Lesson Title:** Inheritance, Composition, Method Overriding & Special Methods
- **Difficulty:** Intermediate–Advanced
- **Estimated Duration:** 55 mins
- **Prerequisites:** M10-L02
- **Learning Objectives:**
  - Use inheritance and super()
  - Prefer composition when appropriate
  - Implement __str__, __repr__, __eq__

## 1. What is this concept?
**Inheritance** creates a specialized subclass from a parent class ('is-a'). **Composition** builds a class out of other objects ('has-a'). **Special (dunder) methods** (`__str__`, `__repr__`, `__eq__`) integrate classes with Python's built-ins.

## 2. Why does it exist?
Without `__str__` or `__repr__`, printing an object shows `<MyClass object at 0x...>`. And overusing inheritance creates rigid hierarchies.

## 3. What problem does it solve?
Makes objects debuggable, comparable, and modular.

## 4. Intuitive explanation
Inheritance is 'a SavingsAccount *is a* BankAccount'; composition is 'a Car *has an* Engine'.

## 5. Real-world analogy
`__str__` is the friendly badge for end users (`print(obj)`); `__repr__` is the unambiguous developer label (`repr(obj)`).

## 6. Technical explanation
Override a method by redefining it in the subclass and calling `super().method(...)` to reuse parent behavior. Implement `__eq__(self, other)` returning `NotImplemented` if `not isinstance(other, MyClass)`.

## 7. Syntax and usage
`class SavingsAccount(BankAccount):` | `def __repr__(self) -> str:`

## 8. Simple example
```python
class Point:
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Point(x={self.x}, y={self.y})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

p1, p2 = Point(2, 3), Point(2, 3)
print(p1, p1 == p2)
```

## 9. Detailed code walkthrough
`__repr__` gives clean output; `__eq__` compares coordinates rather than memory addresses.

## 10. Execution flow
1. Create `p1`, `p2`. 2. `print` calls `__repr__`. 3. `==` calls `__eq__` -> `True`.

## 11. Expected output
```
Point(x=2, y=3) True
```

## 12. More complex example
```python
class Logger:
    def format_msg(self, msg: str) -> str:
        return f"[LOG] {msg}"

class Service:
    def __init__(self, logger: Logger) -> None:
        self.logger = logger  # Composition ('has-a')

    def run(self) -> str:
        return self.logger.format_msg("Service ready")

svc = Service(Logger())
print(svc.run())
```

## 13. Common mistakes
Using inheritance just to share one helper method when composition is cleaner, or forgetting `super().__init__(...)` in a subclass.

## 14. Incorrect versus correct code
**Incorrect:** Inheriting `class Stack(list):` just to borrow `.append()`.
**Correct:** Wrap `self._items = []` inside `Stack` (composition) to control the public API.

## 15. Debugging guidance
Always implement `__repr__` on custom classes so test failures in `pytest` print readable objects.

## 16. When to use this concept
Use composition by default; use inheritance for true 'is-a' relationships; implement `__repr__`/`__str__`/`__eq__`.

## 17. When not to use it
Avoid deep multi-level inheritance trees (3+ levels).

## 18. Relationship with other Python concepts
Synthesizes everything in the course: exceptions, testing, type hints, and clean architecture.

## 19. Practical application
Backend services, data models, SDKs, testing frameworks.

## 20. Lesson summary
Prefer composition over deep inheritance, call `super()` when overriding, and define `__repr__` and `__eq__` on value objects.
