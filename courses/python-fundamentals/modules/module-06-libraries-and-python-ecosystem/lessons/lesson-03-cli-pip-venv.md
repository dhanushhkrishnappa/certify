# Extension: CLI Arguments (sys.argv, argparse), pip & Virtual Environments

## Lesson Metadata
- **Lesson ID:** `M06-L03`
- **Module ID:** `module-06`
- **Concept ID:** `cli-arguments-pip-and-venv`
- **Lesson Title:** Extension: CLI Arguments (sys.argv, argparse), pip & Virtual Environments
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M06-L01
- **Learning Objectives:**
  - Parse CLI args with sys.argv and argparse
  - Create and activate a venv

## 1. What is this concept?
CLI arguments let users pass inputs when launching a script (`python3 app.py --count 3`). Virtual environments (`venv`) isolate third-party `pip` packages per project.

## 2. Why does it exist?
Interactive `input()` blocks automation; CLI flags make scripts scriptable. And global `pip install` causes version conflicts between projects.

## 3. What problem does it solve?
Makes tools automatable and keeps project dependencies reproducible.

## 4. Intuitive explanation
`sys.argv` is the raw list of command-line words; `argparse` is a smart receptionist that validates flags, types, and generates `--help`.

## 5. Real-world analogy
A `venv` is a separate kitchen for each recipe so spice jars (`requests 2.x` vs `1.x`) never collide.

## 6. Technical explanation
`sys.argv[0]` is the script name; `sys.argv[1:]` are user arguments. `argparse.ArgumentParser()` parses typed flags. Create a venv with `python3 -m venv .venv`, install via `pip install <pkg>`, and freeze with `pip freeze > requirements.txt`.

## 7. Syntax and usage
`parser = argparse.ArgumentParser(); parser.add_argument('--limit', type=int, default=5)`

## 8. Simple example
```python
import argparse

parser = argparse.ArgumentParser(description="Greet user")
parser.add_argument("--name", default="Learner")
args = parser.parse_args([])  # empty list simulates no CLI flags
print(f"Hello, {args.name}!")
```

## 9. Detailed code walkthrough
Defines `--name` with default `"Learner"` and parses safely.

## 10. Execution flow
1. Build parser. 2. Register `--name`. 3. Parse args. 4. Print greeting.

## 11. Expected output
```
Hello, Learner!
```

## 12. More complex example
```python
import sys

def parse_cli(argv: list[str]) -> str:
    if len(argv) < 2:
        return "Usage: script.py <target>"
    return f"Running target: {argv[1]}"

print(parse_cli(["tool.py", "build"]))
```

## 13. Common mistakes
Indexing `sys.argv[1]` without checking `len(sys.argv)` (`IndexError`), or committing `.venv/` to Git.

## 14. Incorrect versus correct code
**Incorrect:** `name = sys.argv[1]  # Crashes with IndexError if omitted`
**Correct:** Check `len(sys.argv) >= 2` or use `argparse`.

## 15. Debugging guidance
Run `which python` / `python -m pip list` to verify your virtual environment is active.

## 16. When to use this concept
Use `argparse` for any CLI with optional flags; always create a `venv` for third-party libraries.

## 17. When not to use it
Don't install packages globally with `sudo pip`.

## 18. Relationship with other Python concepts
Prepares for running `pytest` inside a `venv` in Module 07.

## 19. Practical application
Automation CLIs, data pipelines, reproducible deployments.

## 20. Lesson summary
Use `argparse` for clean CLIs and `venv` + `requirements.txt` to isolate dependencies.
