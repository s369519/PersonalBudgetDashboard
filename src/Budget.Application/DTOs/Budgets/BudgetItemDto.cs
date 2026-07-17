using Budget.Domain.Entities;

namespace Budget.Application.DTOs.Budgets;

public class BudgetItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public BudgetItemType Type { get; set; }
    public decimal Amount { get; set; }
    public int SortOrder { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public decimal ActualAmount { get; set; }
    public decimal Difference { get; set; }
}
