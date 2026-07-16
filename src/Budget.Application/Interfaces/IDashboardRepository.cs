using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface IDashboardRepository
{
    Task<IEnumerable<Transaction>> GetTransactionsAsync();

    Task<decimal> GetTotalBalanceAsync();
}