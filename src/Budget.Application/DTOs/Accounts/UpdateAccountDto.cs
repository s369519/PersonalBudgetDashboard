namespace Budget.Application.DTOs.Accounts;

public class UpdateAccountDto
{
    public string Name { get; set; } = string.Empty;

    public decimal Balance { get; set; }
}