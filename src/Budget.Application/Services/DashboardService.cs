using Budget.Application.DTOs.Dashboard;
using Budget.Application.Interfaces;

namespace Budget.Application.Services;

public class DashboardService
{
    private readonly IDashboardRepository _repository;


    public DashboardService(
        IDashboardRepository repository)
    {
        _repository = repository;
    }


    public async Task<DashboardSummaryDto> GetSummaryAsync(string userId)
    {
        var (from, to) = GetCurrentMonthRange();
        var transactions =
            await _repository.GetTransactionsAsync(userId, from, to);


        var balance =
            await _repository.GetTotalBalanceAsync(userId);


        var income =
            transactions
            .Where(x => x.Amount > 0)
            .Sum(x => x.Amount);


        var expenses =
            transactions
            .Where(x => x.Amount < 0)
            .Sum(x => Math.Abs(x.Amount));


        var largestExpense =
            transactions
            .Where(x => x.Amount < 0)
            .Select(x => Math.Abs(x.Amount))
            .DefaultIfEmpty(0)
            .Max();


        return new DashboardSummaryDto
        {
            TotalBalance = balance,

            MonthlyIncome = income,

            MonthlyExpenses = expenses,

            LargestExpense = largestExpense
        };
    }


    public async Task<IEnumerable<CategorySpendingDto>> GetCategorySpendingAsync(string userId)
    {
        var (from, to) = GetCurrentMonthRange();
        var transactions =
            await _repository.GetTransactionsAsync(userId, from, to);


        return transactions
            .Where(x => x.Amount < 0)
            .GroupBy(x => x.Category.Name)
            .Select(x => new CategorySpendingDto
            {
                Category = x.Key,

                Amount = x.Sum(t =>
                    Math.Abs(t.Amount))
            });
    }

    public async Task<IEnumerable<MonthlyTrendDto>> GetMonthlyTrendsAsync(
        string userId,
        int numberOfMonths = 12)
    {
        numberOfMonths = Math.Clamp(numberOfMonths, 2, 36);
        var currentMonth = new DateTime(
            DateTime.UtcNow.Year,
            DateTime.UtcNow.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);
        var from = currentMonth.AddMonths(-(numberOfMonths - 1));
        var to = currentMonth.AddMonths(1);
        var transactions = (await _repository.GetTransactionsAsync(
            userId,
            from,
            to)).ToList();

        return Enumerable.Range(0, numberOfMonths)
            .Select(offset => from.AddMonths(offset))
            .Select(month =>
            {
                var monthEnd = month.AddMonths(1);
                var monthTransactions = transactions.Where(item =>
                    item.Date >= month && item.Date < monthEnd);
                var income = monthTransactions
                    .Where(item => item.Amount > 0)
                    .Sum(item => item.Amount);
                var expenses = monthTransactions
                    .Where(item => item.Amount < 0)
                    .Sum(item => Math.Abs(item.Amount));
                var net = income - expenses;

                return new MonthlyTrendDto
                {
                    Month = DateOnly.FromDateTime(month),
                    Income = income,
                    Expenses = expenses,
                    Net = net,
                    SavingsRate = income == 0
                        ? 0
                        : Math.Round(net / income * 100, 1)
                };
            });
    }

    private static (DateTime From, DateTime To) GetCurrentMonthRange()
    {
        var from = new DateTime(
            DateTime.UtcNow.Year,
            DateTime.UtcNow.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        return (from, from.AddMonths(1));
    }

    
}
