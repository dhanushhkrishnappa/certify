"""Example M06-E02: Parsing arguments with argparse (testable via argv list)."""
import argparse

def run_cli(argv: list[str] | None = None) -> str:
    parser = argparse.ArgumentParser(description="CERTIFY Demo CLI")
    parser.add_argument("--topic", default="python")
    parser.add_argument("--count", type=int, default=2)
    args = parser.parse_args(argv)
    return f"Topic={args.topic}, Count={args.count}"

if __name__ == "__main__":
    print(run_cli(["--topic", "testing", "--count", "4"]))
