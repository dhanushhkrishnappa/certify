"""Example M09-E01: Validating IDs and extracting named groups."""
import re

PATTERN = re.compile(r"^(?P<dept>[A-Z]{2,4})-(?P<num>\d{3})$")

for candidate in ["ENG-104", "CS-007", "eng-104", "ENG-1234"]:
    m = PATTERN.fullmatch(candidate)
    if m:
        print(f"Valid: {candidate} -> {m.groupdict()}")
    else:
        print(f"Invalid: {candidate}")
