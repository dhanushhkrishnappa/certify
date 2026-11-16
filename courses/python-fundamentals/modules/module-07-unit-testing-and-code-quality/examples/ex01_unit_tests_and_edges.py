"""Example M07-E01: Unit testing normal, boundary, and exception cases."""
def slugify(text: str) -> str:
    """Convert text to a lowercase hyphenated slug."""
    cleaned = "-".join(text.strip().lower().split())
    if not cleaned:
        raise ValueError("Input text cannot be empty")
    return cleaned

def test_slugify() -> None:
    assert slugify("  Hello World  ") == "hello-world"
    assert slugify("Python") == "python"
    try:
        slugify("   ")
        assert False, "Expected ValueError"
    except ValueError:
        pass

if __name__ == "__main__":
    test_slugify()
    print("All M07-E01 unit tests passed!")
