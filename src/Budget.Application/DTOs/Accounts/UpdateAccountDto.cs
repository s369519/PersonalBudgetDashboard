using System.ComponentModel.DataAnnotations;
using Budget.Domain.Entities;

namespace Budget.Application.DTOs.Accounts;

public class UpdateAccountDto
{
    [Required(ErrorMessage = "Account name is required.")]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "Account name must be between 2 and 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [Range(
        -1_000_000_000,
        1_000_000_000,
        ErrorMessage = "Balance must be between -1,000,000,000 and 1,000,000,000.")]
    public decimal StartingBalance { get; set; }

    public AccountVisibility Visibility { get; set; }
        = AccountVisibility.Personal;
}
