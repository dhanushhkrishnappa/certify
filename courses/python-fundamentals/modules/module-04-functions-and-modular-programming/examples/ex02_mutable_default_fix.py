"""Example M04-E02: Avoiding the mutable default argument trap."""
def add_score(score: int, history: list[int] | None = None) -> list[int]:
    """Return a list containing history plus the new score."""
    if history is None:
        history = []
    history.append(score)
    return history

print(add_score(90))
print(add_score(85))
