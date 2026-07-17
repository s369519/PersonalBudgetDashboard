namespace Budget.Domain.Entities;

public class Account

{

    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Balance { get; set; }

    public string UserId { get; set; } = string.Empty;

    public ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();

}