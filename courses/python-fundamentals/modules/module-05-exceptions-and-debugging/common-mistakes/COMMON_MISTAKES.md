# Module 05 – Common Mistakes & AI Tutor Guide
## Mistake 1: Bare `except:` or Swallowing `Exception`
- **Incorrect Assumption:** `except: pass` makes code "crash-proof".
- **Actual Behaviour:** Hides typos (`NameError`), logic bugs, and even `Ctrl+C` (`KeyboardInterrupt`).
- **Tutor Socratic Guidance:** Ask: *"If you misspell a variable name inside that `try` block, what will your bare `except:` do?"*
