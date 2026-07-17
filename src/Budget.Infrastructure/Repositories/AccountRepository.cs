using Budget.Application.Interfaces;
using Budget.Domain.Entities;
using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly BudgetDbContext _context;

    public AccountRepository(BudgetDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Account>> GetAllAsync(
        string userId)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();

        return await _context.Accounts
            .Include(account => account.Transactions)
            .Where(account =>
                account.UserId == userId ||
                account.Visibility == AccountVisibility.Shared &&
                householdId != null &&
                _context.Users.Any(owner =>
                    owner.Id == account.UserId &&
                    owner.HouseholdId == householdId))
            .OrderBy(account => account.Name)
            .ToListAsync();
    }

    public async Task<Account?> GetByIdAsync(
        Guid id,
        string userId)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();

        return await _context.Accounts
            .Include(account => account.Transactions)
            .FirstOrDefaultAsync(account =>
                account.Id == id &&
                (account.UserId == userId ||
                 account.Visibility == AccountVisibility.Shared &&
                 householdId != null &&
                 _context.Users.Any(owner =>
                     owner.Id == account.UserId &&
                     owner.HouseholdId == householdId)));
    }

    public async Task<Account> AddAsync(Account account)
    {
        await _context.Accounts.AddAsync(account);
        await _context.SaveChangesAsync();

        return account;
    }

    public async Task UpdateAsync(Account account)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Account account)
    {
        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();
    }
}
