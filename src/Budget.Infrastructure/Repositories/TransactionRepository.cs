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


    public async Task<IEnumerable<Transaction>> GetAllAsync()
    {
        return await _context.Transactions
            .Include(x => x.Account)
            .Include(x => x.Category)
            .ToListAsync();
    }


    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _context.Transactions
            .Include(x => x.Account)
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id);
    }


    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);

        await _context.SaveChangesAsync();

        return transaction;
    }


    public async Task DeleteAsync(Transaction transaction)
    {
        _context.Transactions.Remove(transaction);

        await _context.SaveChangesAsync();
    }
}