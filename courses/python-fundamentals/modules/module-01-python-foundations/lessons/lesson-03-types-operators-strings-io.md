# Data Types, Type Conversion, Operators, Strings & I/O

## Lesson Metadata
- **Lesson ID:** `M01-L03`
- **Module ID:** `module-01`
- **Concept ID:** `primitive-types-operators-strings-io`
- **Lesson Title:** Data Types, Type Conversion, Operators, Strings & I/O
- **Difficulty:** Beginner
- **Estimated Duration:** 45 mins
- **Prerequisites:** M01-L01
- **Learning Objectives:**
  - Use int, float, str, and bool accurately
  - Convert types explicitly
  - Format strings and handle CLI input/output

## 1. What is this concept?
Primitive types represent numbers (`int`, `float`), text (`str`), and truth values (`bool`). Operators combine them, while `input()` and `print()` handle user I/O.

## 2. Why does it exist?
Python needs to know whether `"5" + "3"` means text concatenation (`"53"`) or numeric addition (`8`).

## 3. What problem does it solve?
Prevents silent type mismatches and makes interactive text/number processing predictable.

## 4. Intuitive explanation
Data types are like units of measurement: you can't add a string `'5'` to an integer `3` without converting one to match the other.

## 5. Real-world analogy
Think of `int("42")` as exchanging foreign currency at a counter before spending it in a local shop.

## 6. Technical explanation
`input()` *always* returns a `str`. `/` always produces a `float` (`6 / 2 == 3.0`), whereas `//` performs floor division (`7 // 2 == 3`) and `%` returns the remainder (`7 % 2 == 1`). Strings are immutable sequences supporting slicing (`s[0:3]`) and methods like `.strip()` and `.lower()`.

## 7. Syntax and usage
`int(x)`, `float(x)`, `str(x)`, `type(x)`, and `f"Hello, {name}!"`.

## 8. Simple example
```python
price = float("19.99")
qty = 3
total = price * qty
print(f"Total: ${total:.2f}")
```

## 9. Detailed code walkthrough
`float("19.99")` converts text to a floating-point number. `price * qty` multiplies them. `:.2f` formats to 2 decimal places.

## 10. Execution flow
1. Convert string to float. 2. Multiply by int (promoted to float). 3. Format into f-string. 4. Print.

## 11. Expected output
```
Total: $59.97
```

## 12. More complex example
```python
raw_name = "  dhanush k  "
clean_name = raw_name.strip().title()
minutes = 135
hours = minutes // 60
rem = minutes % 60
print(f"{clean_name}: {hours}h {rem}m")
```

## 13. Common mistakes
Forgetting that `input()` returns `str`, causing `TypeError` or string repetition (`"5" * 3 == "555"`).

## 14. Incorrect versus correct code
**Incorrect:**
```python
age = input("Age: ")
print(age + 1)  # TypeError: can only concatenate str to str
```
**Correct:**
```python
age = int(input("Age: "))
print(age + 1)
```

## 15. Debugging guidance
Use `print(repr(val), type(val))` to reveal hidden whitespace or unexpected string types.

## 16. When to use this concept
Use f-strings for readable formatting and `//`/`%` for integer division tasks like time or pagination.

## 17. When not to use it
Avoid `float` for exact financial cents when integer cents (`int`) or `decimal.Decimal` is required.

## 18. Relationship with other Python concepts
Builds directly into boolean comparisons (Module 02) and exception-safe `int()` conversion (Module 05).

## 19. Practical application
Used in calculators, CLI prompts, log formatting, and data cleaning.

## 20. Lesson summary
Always know your value's `type()`, convert `input()` explicitly, and use f-strings for clean output.
