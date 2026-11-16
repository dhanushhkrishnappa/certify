"""Example M05-E01: Complete try/except/else/finally control flow."""
def parse_port(raw: str) -> int | None:
    try:
        port = int(raw.strip())
        if not (1 <= port <= 65535):
            raise ValueError("Port out of valid range 1-65535")
    except ValueError as exc:
        print(f"Validation failed for {raw!r}: {exc}")
        return None
    else:
        print(f"Valid port parsed: {port}")
        return port
    finally:
        print("Finished port check.")

parse_port("8080")
parse_port("99999")
