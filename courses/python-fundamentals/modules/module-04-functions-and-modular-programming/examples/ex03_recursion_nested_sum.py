"""Example M04-E03: Recursive traversal of arbitrarily nested integer lists."""
def sum_nested(data: list) -> int:
    total = 0
    for element in data:
        if isinstance(element, list):
            total += sum_nested(element)
        else:
            total += element
    return total

print("Nested sum:", sum_nested([1, [2, 3], [4, [5]]]))
