"""Example M01-E02: Explicit type conversion, arithmetic operators, and f-strings."""
raw_minutes = "145"
total_minutes = int(raw_minutes)
hours = total_minutes // 60
remaining = total_minutes % 60

unit_price = float("12.50")
quantity = 3
subtotal = unit_price * quantity

print(f"Duration: {hours} hr {remaining} min")
print(f"Subtotal: ${subtotal:.2f}")
