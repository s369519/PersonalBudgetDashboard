namespace Budget.Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public decimal TotalBalance { get; set; }

    public decimal MonthlyIncome { get; set; }

    public decimal MonthlyExpenses { get; set; }

    public decimal LargestExpense { get; set; }
}