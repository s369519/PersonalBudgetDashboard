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
        string userId,
        DateTime from,
        DateTime to)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();

        return await _context.Transactions
            .Include(transaction => transaction.Account)
            .Include(transaction => transaction.Category)
            .Where(transaction =>
                transaction.Date >= from &&
                transaction.Date < to &&
                (transaction.Account.UserId == userId ||
                 transaction.Account.Visibility == AccountVisibility.Shared &&
                 householdId != null &&
                 _context.Users.Any(owner =>
                     owner.Id == transaction.Account.UserId &&
                     owner.HouseholdId == householdId)))
            .ToListAsync();
    }

    public async Task<decimal> GetTotalBalanceAsync(
        string userId)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();

        return await _context.Accounts
            .Where(account =>
                account.UserId == userId ||
                account.Visibility == AccountVisibility.Shared &&
                householdId != null &&
                _context.Users.Any(owner =>
                    owner.Id == account.UserId &&
                    owner.HouseholdId == householdId))
            .SumAsync(account =>
                account.StartingBalance +
                (account.Transactions.Sum(transaction =>
                    (decimal?)transaction.Amount) ?? 0));
    }

    public async Task<IEnumerable<DateOnly>> GetAvailableMonthsAsync(
        string userId)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();
        var months = await _context.Transactions
            .Where(transaction =>
                transaction.Account.UserId == userId ||
                transaction.Account.Visibility == AccountVisibility.Shared &&
                householdId != null &&
                _context.Users.Any(owner =>
                    owner.Id == transaction.Account.UserId &&
                    owner.HouseholdId == householdId))
            .Select(transaction => new
            {
                transaction.Date.Year,
                transaction.Date.Month
            })
            .Distinct()
            .OrderByDescending(value => value.Year)
            .ThenByDescending(value => value.Month)
            .ToListAsync();

        return months.Select(value =>
            new DateOnly(value.Year, value.Month, 1));
    }
}
