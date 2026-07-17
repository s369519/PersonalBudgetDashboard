using System.ComponentModel.DataAnnotations;
using Budget.Domain.Entities;

namespace Budget.Application.DTOs.Budgets;

public class SaveBudgetSheetDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    public DateOnly Month { get; set; }

    public BudgetVisibility Visibility { get; set; }

    public IEnumerable<SaveBudgetItemDto> Items { get; set; } = [];
}
