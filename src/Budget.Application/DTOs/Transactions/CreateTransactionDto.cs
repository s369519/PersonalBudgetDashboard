using System.ComponentModel.DataAnnotations;

namespace Budget.Application.DTOs.Transactions;

public class CreateTransactionDto
{
    [Required(ErrorMessage = "Description is required.")]
    [StringLength(
        200,
        MinimumLength = 2,
        ErrorMessage = "Description must be between 2 and 200 characters.")]
    public string Description { get; set; } = string.Empty;

    [Range(
        -1_000_000_000,
        1_000_000_000,
        ErrorMessage = "Amount is outside the permitted range.")]
    public decimal Amount { get; set; }

    public DateTime Date { get; set; }

    [Required]
    public Guid AccountId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }
}