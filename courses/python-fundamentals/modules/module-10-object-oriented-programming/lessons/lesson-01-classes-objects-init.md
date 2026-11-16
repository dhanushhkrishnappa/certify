# Procedural vs. OOP, Classes, Objects, __init__ & Instance Methods

## Lesson Metadata
- **Lesson ID:** `M10-L01`
- **Module ID:** `module-10`
- **Concept ID:** `classes-objects-and-init`
- **Lesson Title:** Procedural vs. OOP, Classes, Objects, __init__ & Instance Methods
- **Difficulty:** Intermediate
- **Estimated Duration:** 50 mins
- **Prerequisites:** Module 04, Module 05
- **Learning Objectives:**
  - Define classes and instantiate objects
  - Explain self and __init__

## 1. What is this concept?
A `class` is a blueprint for creating objects that bundle state (attributes) and behavior (methods) together.

## 2. Why does it exist?
Passing loose dicts and parallel lists between 10 procedural functions leads to scattered validation and fragile code.

## 3. What problem does it solve?
Keeps an entity's data and the rules that govern it in one self-contained place.

## 4. Intuitive explanation
A class is an architectural blueprint for a house; each object (`Account(...)`) is an actual house built from that blueprint, with its own address and furniture.

## 5. Real-world analogy
`self` is simply Python's way of handing the specific object ('this house right here') to its own methods.

## 6. Technical explanation
Calling `BankAccount("Asha", 100)` allocates a new instance and automatically invokes `__init__(self, owner, balance)`. Instance methods take `self` as their first parameter.

## 7. Syntax and usage
`class BankAccount: def __init__(self, owner: str, balance: float = 0.0): ...`

## 8. Simple example
```python
class Counter:
    def __init__(self, start: int = 0) -> None:
        self.value = start

    def increment(self) -> None:
        self.value += 1

c = Counter(5)
c.increment()
print(c.value)
```

## 9. Detailed code walkthrough
`Counter(5)` creates an instance with `value = 5`; `c.increment()` passes `c` as `self` and increments `c.value` to `6`.

## 10. Execution flow
1. Instantiate `c`. 2. `__init__` sets `c.value = 5`. 3. `c.increment()` updates `c.value = 6`. 4. Print `6`.

## 11. Expected output
```
6
```

## 12. More complex example
```python
class Wallet:
    def __init__(self, owner: str, balance: float = 0.0) -> None:
        if balance < 0:
            raise ValueError("Initial balance cannot be negative")
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        return self.balance

w = Wallet("Asha", 50.0)
print(w.deposit(25.0))
```

## 13. Common mistakes
Forgetting `self` in a method signature (`TypeError: takes 0 positional arguments but 1 was given`) or forgetting `self.` when reading/setting an attribute.

## 14. Incorrect versus correct code
**Incorrect:**
```python
class Dog:
    def bark():  # Missing self!
        print("Woof")
```
**Correct:**
```python
class Dog:
    def bark(self) -> None:
        print("Woof")
```

## 15. Debugging guidance
Remember: `obj.method(x)` is translated by Python into `ClassName.method(obj, x)`.

## 16. When to use this concept
Use classes when data has invariants and lifecycle methods; keep simple stateless helpers as plain functions.

## 17. When not to use it
Don't create a class with only `__init__` and one method if a plain function or `dict`/`tuple` suffices.

## 18. Relationship with other Python concepts
Builds directly into `@property`, inheritance, and dunder methods (M10-L02, M10-L03).

## 19. Practical application
User models, shopping carts, API clients, game entities.

## 20. Lesson summary
Classes bundle state and behavior; `__init__` initializes each instance; `self` refers to the current object.
