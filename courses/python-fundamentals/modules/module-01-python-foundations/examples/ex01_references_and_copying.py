"""Example M01-E01: Object references, aliasing, and shallow vs. deep copying."""
import copy

# Immutable integers: rebinding does not affect other names
a = 42
b = a
a = a + 8
print(f"Integers -> a={a}, b={b}")

# Mutable lists: aliasing shares the same object
list_one = [10, 20]
list_alias = list_one
list_copy = list_one.copy()
list_one.append(30)
print(f"Alias shares mutation -> one={list_one}, alias={list_alias}, copy={list_copy}")

# Nested lists: shallow copy shares inner lists; deepcopy isolates everything
matrix = [[1, 2], [3, 4]]
shallow = matrix.copy()
deep = copy.deepcopy(matrix)
matrix[0][0] = 999
print(f"Nested -> original={matrix}, shallow={shallow}, deep={deep}")
