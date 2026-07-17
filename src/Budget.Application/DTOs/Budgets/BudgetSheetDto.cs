using Budget.Domain.Entities;

namespace Budget.Application.DTOs.Budgets;

public class BudgetSheetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly Month { get; set; }
    public BudgetVisibility Visibility { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Remaining { get; set; }
    public decimal ActualIncome { get; set; }
    public decimal ActualExpenses { get; set; }
    public decimal ActualRemaining { get; set; }
    public IEnumerable<BudgetItemDto> Items { get; set; } = [];
}
