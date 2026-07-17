namespace Budget.Application.DTOs.Transactions;

public class UpdateTransactionDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
}