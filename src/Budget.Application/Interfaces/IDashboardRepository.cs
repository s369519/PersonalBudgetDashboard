using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface IDashboardRepository
{
    Task<IEnumerable<Transaction>> GetTransactionsAsync(
        string userId);

    Task<decimal> GetTotalBalanceAsync(
        string userId);
}