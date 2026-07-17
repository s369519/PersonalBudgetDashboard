namespace Budget.Application.DTOs.Dashboard;

public class MonthlyTrendDto
{
    public DateOnly Month { get; set; }
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Net { get; set; }
    public decimal SavingsRate { get; set; }
}
