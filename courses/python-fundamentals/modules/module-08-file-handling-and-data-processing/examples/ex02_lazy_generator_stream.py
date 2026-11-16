"""Example M08-E02: Lazy log-line generator pipeline using yield."""
def filter_errors(lines):
    for line in lines:
        if line.startswith("ERROR:"):
            yield line.removeprefix("ERROR:").strip()

log_stream = [
    "INFO: server started",
    "ERROR: disk full",
    "INFO: retrying",
    "ERROR: timeout",
]

for err in filter_errors(log_stream):
    print("Alert ->", err)
