"""Example M10-E01: Encapsulation with @property, inheritance, super(), and dunders."""
class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0) -> None:
        self.owner = owner
        self.balance = balance

    @property
    def balance(self) -> float:
        return self._balance

    @balance.setter
    def balance(self, amount: float) -> None:
        if amount < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = round(amount, 2)

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self.balance})"


class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: float = 0.0, rate: float = 0.04) -> None:
        super().__init__(owner, balance)
        self.rate = rate

    def apply_interest(self) -> None:
        self.balance = self.balance * (1 + self.rate)


acct = SavingsAccount("Asha", 1000.0, rate=0.05)
acct.deposit(200.0)
acct.apply_interest()
print(acct)
