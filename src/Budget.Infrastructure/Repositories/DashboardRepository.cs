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


    public async Task<IEnumerable<Transaction>> GetTransactionsAsync()
    {
        return await _context.Transactions
            .Include(x => x.Category)
            .ToListAsync();
    }


    public async Task<decimal> GetTotalBalanceAsync()
    {
        return await _context.Accounts
            .SumAsync(x => x.Balance);
    }
}