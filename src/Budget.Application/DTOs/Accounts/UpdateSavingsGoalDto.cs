using System.ComponentModel.DataAnnotations;

namespace Budget.Application.DTOs.Accounts;

public class UpdateSavingsGoalDto
{
    [Range(
        0.01,
        1_000_000_000,
        ErrorMessage = "The savings goal must be greater than zero.")]
    public decimal TargetAmount { get; set; }

    public DateOnly TargetDate { get; set; }
}
