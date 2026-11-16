"""Example M05-E02: Defensive validation with raise ValueError."""
def compute_bmi(weight_kg: float, height_m: float) -> float:
    if weight_kg <= 0 or height_m <= 0:
        raise ValueError("Weight and height must be positive numbers.")
    return round(weight_kg / (height_m ** 2), 2)

print("BMI:", compute_bmi(70, 1.75))
