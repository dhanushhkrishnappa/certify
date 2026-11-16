# Instance vs. Class Variables, @property & Encapsulation

## Lesson Metadata
- **Lesson ID:** `M10-L02`
- **Module ID:** `module-10`
- **Concept ID:** `state-properties-and-encapsulation`
- **Lesson Title:** Instance vs. Class Variables, @property & Encapsulation
- **Difficulty:** Intermediate–Advanced
- **Estimated Duration:** 50 mins
- **Prerequisites:** M10-L01
- **Learning Objectives:**
  - Distinguish class vs instance attributes
  - Enforce validation with @property

## 1. What is this concept?
Instance variables (`self.x`) belong to one object; class variables (defined directly in `class`) are shared by all instances. `@property` lets you validate attribute reads/writes cleanly.

## 2. Why does it exist?
If someone writes `account.balance = -500` directly, validation in `__init__` is bypassed!

## 3. What problem does it solve?
Encapsulation + `@property` protects invariants while keeping clean `obj.balance` syntax.

## 4. Intuitive explanation
A class variable is the building's shared lobby noticeboard; an instance variable is each apartment's private mailbox.

## 5. Real-world analogy
`@property` is a security guard at the mailbox: from the outside it looks like `user.age = 25`, but behind the scenes the setter checks `age >= 0`.

## 6. Technical explanation
Never put a mutable list/dict as a class variable unless you *intend* all instances to share it. Conventionally, `_attr` signals internal storage managed by `@property`.

## 7. Syntax and usage
`@property def balance(self): return self._balance`

## 8. Simple example
```python
class Product:
    tax_rate = 0.08  # Class variable

    def __init__(self, name: str, price: float) -> None:
        self.name = name
        self.price = price  # Calls @price.setter!

    @property
    def price(self) -> float:
        return self._price

    @price.setter
    def price(self, value: float) -> None:
        if value < 0:
            raise ValueError("Price cannot be negative")
        self._price = value

p = Product("Book", 15.0)
print(p.price, Product.tax_rate)
```

## 9. Detailed code walkthrough
`self.price = price` routes through the `@price.setter`, storing validated data in `self._price`.

## 10. Execution flow
1. Instantiate `Product`. 2. Setter validates `15.0 >= 0`. 3. Sets `_price`. 4. Prints `15.0 0.08`.

## 11. Expected output
```
15.0 0.08
```

## 12. More complex example
```python
class Student:
    school = "CERTIFY Academy"
    def __init__(self, name: str) -> None:
        self.name = name
        self.courses: list[str] = []  # Per-instance list!

s1 = Student("Asha")
s2 = Student("Ravi")
s1.courses.append("Python")
print(s1.courses, s2.courses)
```

## 13. Common mistakes
Writing `self.price = value` *inside* `@price.setter` (causes infinite recursion `RecursionError`! Must write `self._price = value`).

## 14. Incorrect versus correct code
**Incorrect:** `def price(self, val): self.price = val  # Infinite recursion!`
**Correct:** `def price(self, val): self._price = val`

## 15. Debugging guidance
If setting an attribute triggers `RecursionError`, check your `@property` setter for missing underscore `_`.

## 16. When to use this concept
Use `@property` whenever an attribute needs validation or lazy computation.

## 17. When not to use it
Don't write trivial Java-style `get_x()`/`set_x()` methods when plain attributes or `@property` work.

## 18. Relationship with other Python concepts
Combines with `raise ValueError` (Module 05) and inheritance (M10-L03).

## 19. Practical application
Domain models, ORMs, configuration objects.

## 20. Lesson summary
Keep per-object data on `self`, store validated backing fields in `_name`, and use `@property` for invariants.
