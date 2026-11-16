"""Example M06-E01: Using statistics, math, and datetime together."""
import math
import statistics
from datetime import date, timedelta

latencies_ms = [12, 15, 14, 18, 21]
avg = statistics.mean(latencies_ms)
med = statistics.median(latencies_ms)
review_date = date(2026, 11, 16) + timedelta(days=7)

print(f"Mean={avg:.1f}ms, Median={med}ms, Ceil={math.ceil(avg)}ms")
print(f"Next review: {review_date.isoformat()}")
