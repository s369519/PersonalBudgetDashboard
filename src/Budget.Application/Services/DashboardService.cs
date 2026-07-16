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


    public async Task<DashboardSummaryDto>
        GetSummaryAsync()
    {
        var transactions =
            await _repository.GetTransactionsAsync();


        var balance =
            await _repository.GetTotalBalanceAsync();


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


    public async Task<IEnumerable<CategorySpendingDto>>
        GetCategorySpendingAsync()
    {
        var transactions =
            await _repository.GetTransactionsAsync();


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
}