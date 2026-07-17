using Budget.Application.Interfaces;
using Budget.Domain.Entities;
using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly BudgetDbContext _context;

    public DashboardRepository(BudgetDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsAsync(
        string userId)
    {
        return await _context.Transactions
            .Include(transaction => transaction.Account)
            .Include(transaction => transaction.Category)
            .Where(transaction =>
                transaction.Account.UserId == userId)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalBalanceAsync(
        string userId)
    {
        return await _context.Accounts
            .Where(account => account.UserId == userId)
            .SumAsync(account => account.Balance);
    }
}