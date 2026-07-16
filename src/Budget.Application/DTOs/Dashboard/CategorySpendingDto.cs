namespace Budget.Application.DTOs.Dashboard;

public class CategorySpendingDto
{
    public string Category { get; set; } = string.Empty;

    public decimal Amount { get; set; }
}