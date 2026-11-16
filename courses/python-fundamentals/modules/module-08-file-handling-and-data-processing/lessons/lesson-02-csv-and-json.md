# Processing CSV and JSON Data Safely

## Lesson Metadata
- **Lesson ID:** `M08-L02`
- **Module ID:** `module-08`
- **Concept ID:** `csv-and-json-processing`
- **Lesson Title:** Processing CSV and JSON Data Safely
- **Difficulty:** Intermediate
- **Estimated Duration:** 45 mins
- **Prerequisites:** M08-L01
- **Learning Objectives:**
  - Parse CSV with DictReader
  - Serialize/deserialize JSON cleanly

## 1. What is this concept?
CSV stores flat tabular rows; JSON stores hierarchical key-value objects and arrays.

## 2. Why does it exist?
Splitting CSV lines manually with `.split(',')` breaks whenever a value contains a comma inside quotes (e.g., `"Bengaluru, IN"`).

## 3. What problem does it solve?
Standard `csv` and `json` modules handle quoting, escaping, and types reliably.

## 4. Intuitive explanation
CSV is a spreadsheet table; JSON is a nested Python dictionary saved as text.

## 5. Real-world analogy
Think of `csv.DictReader` as turning each spreadsheet row into a Python `dict` keyed by the header column names.

## 6. Technical explanation
When writing CSVs, pass `newline=''` to `open()` so Windows doesn't insert blank lines. For JSON, `json.dumps()`/`loads()` work on strings, while `json.dump()`/`load()` work on file objects.

## 7. Syntax and usage
`reader = csv.DictReader(f)` | `data = json.loads(raw_text)`

## 8. Simple example
```python
import csv, io

csv_text = "name,score\nAsha,92\nRavi,85\n"
reader = csv.DictReader(io.StringIO(csv_text))
for row in reader:
    print(row["name"], int(row["score"]) + 5)
```

## 9. Detailed code walkthrough
`DictReader` parses header `name,score` and yields each row as a dict of strings.

## 10. Execution flow
1. Parse header. 2. Yield `{'name': 'Asha', 'score': '92'}`. 3. Convert score to `int` and print.

## 11. Expected output
```
Asha 97
Ravi 90
```

## 12. More complex example
```python
import json

payload = {"course": "Python", "modules": 10, "active": True}
serialized = json.dumps(payload, indent=2)
restored = json.loads(serialized)
print(restored["course"], restored["modules"])
```

## 13. Common mistakes
Expecting `csv.DictReader` values to be `int` automatically (they are always `str`!) or forgetting `json.JSONDecodeError` on malformed JSON.

## 14. Incorrect versus correct code
**Incorrect:** `total = row['score'] + 1  # TypeError: str + int`
**Correct:** `total = int(row['score']) + 1`

## 15. Debugging guidance
Print `repr(row)` to inspect exact column keys (watch for trailing spaces in CSV headers).

## 16. When to use this concept
Use `csv` for spreadsheets and `json` for nested/API data.

## 17. When not to use it
Don't parse CSV or JSON with regexes.

## 18. Relationship with other Python concepts
Directly connects to Module 09 (knowing when to use parsers vs. regex).

## 19. Practical application
ETL scripts, REST API integration, dataset cleaning.

## 20. Lesson summary
Use `csv.DictReader`/`DictWriter` for tabular data and `json` for nested structures; convert CSV strings explicitly.
