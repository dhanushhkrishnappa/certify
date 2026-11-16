"""Example M03-E02: Unpacking, zip(), and list/dict comprehensions."""
students = ["Maya", "Liam", "Zara"]
scores = [88, 95, 72]

passing = [f"{name} ({score})" for name, score in zip(students, scores) if score >= 80]
grade_map = {name: ("Pass" if score >= 80 else "Review") for name, score in zip(students, scores)}

print("Passing:", passing)
print("Grade map:", grade_map)
