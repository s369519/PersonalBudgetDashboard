namespace Budget.Domain.Entities;

public class BudgetSheet
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateOnly Month { get; set; }

    public BudgetVisibility Visibility { get; set; }

    public string UserId { get; set; } = string.Empty;

    public ICollection<BudgetItem> Items { get; set; }
        = new List<BudgetItem>();
}
