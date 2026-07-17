using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface IDashboardRepository
{
    Task<IEnumerable<Transaction>> GetTransactionsAsync(
        string userId,
        DateTime from,
        DateTime to);

    Task<decimal> GetTotalBalanceAsync(
        string userId);

    Task<IEnumerable<DateOnly>> GetAvailableMonthsAsync(
        string userId);
}
