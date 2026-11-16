"""Example M02-E01: Ordered if/elif/else ladder with boundary validation."""
score = 91
if not (0 <= score <= 100):
    result = "Invalid score"
elif score >= 90:
    result = "Distinction"
elif score >= 70:
    result = "Pass"
else:
    result = "Needs Review"

print(f"Score {score}: {result}")
