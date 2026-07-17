using Budget.Application.Interfaces;
using Budget.Domain.Entities;
using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly BudgetDbContext _context;

    public TransactionRepository(BudgetDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Transaction>> GetAllAsync(string userId)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();

        return await _context.Transactions
            .Include(transaction => transaction.Account)
            .Include(transaction => transaction.Category)
            .Where(transaction =>
                transaction.Account.UserId == userId ||
                transaction.Account.Visibility == AccountVisibility.Shared &&
                householdId != null &&
                _context.Users.Any(owner =>
                    owner.Id == transaction.Account.UserId &&
                    owner.HouseholdId == householdId))
            .OrderByDescending(transaction => transaction.Date)
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(Guid id, string userId)
    {
        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();

        return await _context.Transactions
            .Include(transaction => transaction.Account)
            .Include(transaction => transaction.Category)
            .FirstOrDefaultAsync(transaction =>
                transaction.Id == id &&
                (transaction.Account.UserId == userId ||
                 transaction.Account.Visibility == AccountVisibility.Shared &&
                 householdId != null &&
                 _context.Users.Any(owner =>
                     owner.Id == transaction.Account.UserId &&
                     owner.HouseholdId == householdId)));
    }

    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        await _context.Transactions.AddAsync(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Transaction transaction)
    {
        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
    }
}
