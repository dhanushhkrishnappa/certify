"""Example M02-E02: Truthiness, short-circuit return values, and None guards."""
print("Result 1:", "apple" and "" or "default")
print("Result 2:", 0 or 42)

user = None
if user is not None and user.get("active"):
    print("Active user")
else:
    print("Safely skipped None user")
