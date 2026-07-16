namespace Budget.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime Date { get; set; }


    // Relationship

    public Guid AccountId { get; set; }

    public Account Account { get; set; } = null!;


    public Guid CategoryId { get; set; }

    public Category Category { get; set; } = null!;
}