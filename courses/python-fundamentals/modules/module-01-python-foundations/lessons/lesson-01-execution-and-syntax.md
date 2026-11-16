# Python Execution, Interactive Mode, Scripts & Indentation

## Lesson Metadata
- **Lesson ID:** `M01-L01`
- **Module ID:** `module-01`
- **Concept ID:** `execution-model-and-syntax`
- **Lesson Title:** Python Execution, Interactive Mode, Scripts & Indentation
- **Difficulty:** Beginner
- **Estimated Duration:** 35 mins
- **Prerequisites:** None
- **Learning Objectives:**
  - Run Python interactively and as a script
  - Understand how indentation defines code blocks
  - Use comments to document intent

## 1. What is this concept?
The Python execution model describes how the Python interpreter reads your source code, checks its grammar, and executes instructions step by step.

## 2. Why does it exist?
Computers only execute machine instructions. Python provides a high-level, human-readable language plus an interpreter (`python3`) that translates and runs your code.

## 3. What problem does it solve?
It solves the gap between human problem-solving and machine execution without requiring manual memory management or separate compilation steps.

## 4. Intuitive explanation
Think of the interpreter as a chef reading a recipe line by line: in interactive mode (REPL), you hand over one instruction at a time; in script mode, you hand over the entire recipe card (`.py` file).

## 5. Real-world analogy
Interactive mode is like asking a calculator one question at a time. Script mode is like writing a full checklist so someone can repeat the exact workflow anytime.

## 6. Technical explanation
When you run `python3 app.py`, CPython parses the file into an Abstract Syntax Tree (AST), compiles it to bytecode, and executes that bytecode on the Python Virtual Machine (PVM). Indentation (4 spaces per level) is syntactically significant—it tells the parser where blocks begin and end.

## 7. Syntax and usage
Start the REPL with `python3` in a terminal (`>>>` prompt). Run a file with `python3 filename.py`. Write single-line comments with `#`.

## 8. Simple example
```python
# Greet the user
print("Welcome to CERTIFY Python!")
```

## 9. Detailed code walkthrough
Line 1 starts with `#`, so the parser ignores it. Line 2 calls the built-in `print` function, passing the string literal `"Welcome to CERTIFY Python!"`.

## 10. Execution flow
1. Interpreter reads `hello.py`. 2. Skips comment. 3. Evaluates string literal. 4. Calls `print()` which writes bytes to standard output followed by a newline.

## 11. Expected output
```
Welcome to CERTIFY Python!
```

## 12. More complex example
```python
# Demonstrating top-to-bottom execution and block indentation
print("Step 1: Starting setup")
if True:
    print("Step 2: Inside an indented block (4 spaces)")
print("Step 3: Back at top level")
```

## 13. Common mistakes
Mixing tabs and spaces, indenting a line unexpectedly at top level (`IndentationError`), or forgetting quotes around text (`SyntaxError`).

## 14. Incorrect versus correct code
**Incorrect:**
```python
print("Line 1")
  print("Line 2")  # IndentationError: unexpected indent
```
**Correct:**
```python
print("Line 1")
print("Line 2")
```

## 15. Debugging guidance
Read the caret (`^`) and line number in `SyntaxError` or `IndentationError`. Check the line *above* the reported line too, as an unclosed parenthesis often triggers an error on the next line.

## 16. When to use this concept
Use REPL for quick 1–3 line experiments and `id()`/`type()` checks. Use `.py` scripts for anything you want to save, test, and reuse.

## 17. When not to use it
Avoid writing long multi-line programs directly in the REPL—they are lost when you close the terminal.

## 18. Relationship with other Python concepts
Clean indentation is mandatory for conditionals (Module 02), loops (Module 03), and functions (Module 04).

## 19. Practical application
Every backend service, data pipeline, and CLI tool you build starts as a `.py` script executed by the interpreter.

## 20. Lesson summary
Python executes top-to-bottom, uses 4-space indentation to group blocks, and supports both quick REPL experiments and reusable `.py` scripts.
