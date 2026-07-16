namespace Budget.Application.DTOs.Transactions;

public class TransactionDto
{
    public Guid Id { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime Date { get; set; }


    public string AccountName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;
}