namespace Budget.Domain.Entities;

public class Account

{

    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal StartingBalance { get; set; }

    public string UserId { get; set; } = string.Empty;

    public AccountVisibility Visibility { get; set; }
        = AccountVisibility.Personal;

    public decimal? SavingsGoalAmount { get; set; }

    public DateOnly? SavingsGoalDate { get; set; }

    public ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();

}
