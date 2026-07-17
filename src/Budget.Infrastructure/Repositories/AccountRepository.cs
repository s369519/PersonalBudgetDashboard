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

    public async Task<IEnumerable<Account>> GetAllAsync()
    {
        return await _context.Accounts
            .OrderBy(account => account.Name)
            .ToListAsync();
    }

    public async Task<Account?> GetByIdAsync(Guid id)
    {
        return await _context.Accounts
            .FirstOrDefaultAsync(account => account.Id == id);
    }

    public async Task<Account> AddAsync(Account account)
    {
        await _context.Accounts.AddAsync(account);
        await _context.SaveChangesAsync();

        return account;
    }

    public async Task UpdateAsync(Account account)
    {
        _context.Accounts.Update(account);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Account account)
    {
        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();
    }
}