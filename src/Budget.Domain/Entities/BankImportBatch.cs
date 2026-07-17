namespace Budget.Domain.Entities;

public class BankImportBatch
{
    public Guid Id { get; set; }
    public string FileHash { get; set; } = string.Empty;
    public DateOnly Month { get; set; }
    public DateTime ImportedAt { get; set; }
    public int TransactionCount { get; set; }
    public Guid AccountId { get; set; }
    public string UserId { get; set; } = string.Empty;
}
