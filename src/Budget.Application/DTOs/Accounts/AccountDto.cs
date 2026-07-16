namespace Budget.Application.DTOs.Accounts;

public class AccountDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Balance { get; set; }
}