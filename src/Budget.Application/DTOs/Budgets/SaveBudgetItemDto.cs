using System.ComponentModel.DataAnnotations;
using Budget.Domain.Entities;

namespace Budget.Application.DTOs.Budgets;

public class SaveBudgetItemDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Description { get; set; } = string.Empty;

    public BudgetItemType Type { get; set; }

    [Range(0.01, 1_000_000_000)]
    public decimal Amount { get; set; }

    public Guid? CategoryId { get; set; }
}
