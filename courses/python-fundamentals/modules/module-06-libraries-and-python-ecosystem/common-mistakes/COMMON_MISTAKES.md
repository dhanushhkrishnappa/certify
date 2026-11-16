# Module 06 – Common Mistakes & AI Tutor Guide
## Mistake 1: Shadowing Standard Library Modules (`random.py`, `email.py`)
- **Incorrect Assumption:** Filename doesn't matter when importing a library.
- **Actual Behaviour:** Python searches the current directory before stdlib, importing your own script instead of the library.
- **Tutor Socratic Guidance:** Ask: *"When Python runs `import random`, where does it look first—your current folder or Python's installation directory?"*
