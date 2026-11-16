"""Example M08-E01: Parsing CSV in memory and serializing summary to JSON."""
import csv
import io
import json

raw_csv = "name,dept,score\nAsha,Eng,94\nRavi,Ops,81\nMaya,Eng,89\n"
rows = list(csv.DictReader(io.StringIO(raw_csv)))
eng_scores = [int(r["score"]) for r in rows if r["dept"] == "Eng"]

report = {"department": "Eng", "count": len(eng_scores), "avg": round(sum(eng_scores) / len(eng_scores), 2)}
print(json.dumps(report, indent=2))
