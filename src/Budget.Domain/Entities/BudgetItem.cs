namespace Budget.Domain.Entities;

public class BudgetItem
{
    public Guid Id { get; set; }

    public string Description { get; set; } = string.Empty;

    public BudgetItemType Type { get; set; }

    public decimal Amount { get; set; }

    public int SortOrder { get; set; }

    public Guid? CategoryId { get; set; }

    public Category? Category { get; set; }

    public Guid BudgetSheetId { get; set; }

    public BudgetSheet BudgetSheet { get; set; } = null!;
}
