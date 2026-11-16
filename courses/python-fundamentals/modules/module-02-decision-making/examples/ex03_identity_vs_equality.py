"""Example M02-E03: Value equality (==) vs. object identity (is)."""
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print("a == b:", a == b)   # True: same contents
print("a is b:", a is b)   # False: different list objects in memory
print("a is c:", a is c)   # True: same object reference
