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
        return await _context.Transactions
            .Include(transaction => transaction.Account)
            .Include(transaction => transaction.Category)
            .Where(transaction =>
                transaction.Account.UserId == userId)
            .OrderByDescending(transaction => transaction.Date)
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(Guid id, string userId)
    {
        return await _context.Transactions
            .Include(transaction => transaction.Account)
            .Include(transaction => transaction.Category)
            .FirstOrDefaultAsync(transaction =>
                transaction.Id == id &&
                transaction.Account.UserId == userId);
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