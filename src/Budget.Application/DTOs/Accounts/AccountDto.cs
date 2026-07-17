namespace Budget.Application.DTOs.Accounts;

using Budget.Domain.Entities;

public class AccountDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Balance { get; set; }

    public decimal StartingBalance { get; set; }

    public AccountVisibility Visibility { get; set; }

    public decimal? SavingsGoalAmount { get; set; }

    public DateOnly? SavingsGoalDate { get; set; }

    public decimal? SavingsGoalRemaining { get; set; }

    public decimal? RequiredMonthlySavings { get; set; }
}
