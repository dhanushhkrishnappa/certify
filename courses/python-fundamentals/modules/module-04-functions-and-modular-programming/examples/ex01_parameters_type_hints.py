"""Example M04-E01: Functions, keyword/default arguments, type hints, and docstrings."""
def calculate_total(price: float, qty: int = 1, discount: float = 0.0) -> float:
    """Compute final price after applying percentage discount (0.0 to 1.0)."""
    subtotal = price * qty
    return round(subtotal * (1 - discount), 2)

print(calculate_total(25.0))
print(calculate_total(25.0, qty=3, discount=0.10))
