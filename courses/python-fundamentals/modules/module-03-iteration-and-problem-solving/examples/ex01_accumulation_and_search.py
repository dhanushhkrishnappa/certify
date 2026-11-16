"""Example M03-E01: Accumulation, filtering with continue, and early search exit."""
readings = [18, -5, 22, 31, 19]
valid_sum = 0
valid_count = 0

for val in readings:
    if val < 0:
        continue
    valid_sum += val
    valid_count += 1

print(f"Valid count={valid_count}, mean={valid_sum / valid_count:.2f}")

target = 22
found_at = None
for idx, val in enumerate(readings):
    if val == target:
        found_at = idx
        break
print(f"Target {target} found at index: {found_at}")
