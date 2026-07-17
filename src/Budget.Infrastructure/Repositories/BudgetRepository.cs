using Budget.Application.Interfaces;
using Budget.Domain.Entities;
using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly BudgetDbContext _context;

    public BudgetRepository(BudgetDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BudgetSheet>> GetAllAsync(string userId)
    {
        var householdId = await GetHouseholdIdAsync(userId);

        return await _context.BudgetSheets
            .Include(sheet => sheet.Items.OrderBy(item => item.SortOrder))
                .ThenInclude(item => item.Category)
            .Where(sheet =>
                sheet.UserId == userId ||
                sheet.Visibility == BudgetVisibility.Shared &&
                householdId != null &&
                _context.Users.Any(owner =>
                    owner.Id == sheet.UserId &&
                    owner.HouseholdId == householdId))
            .OrderByDescending(sheet => sheet.Month)
            .ThenBy(sheet => sheet.Name)
            .ToListAsync();
    }

    public async Task<BudgetSheet?> GetByIdAsync(Guid id, string userId)
    {
        var householdId = await GetHouseholdIdAsync(userId);

        return await _context.BudgetSheets
            .Include(sheet => sheet.Items.OrderBy(item => item.SortOrder))
                .ThenInclude(item => item.Category)
            .FirstOrDefaultAsync(sheet =>
                sheet.Id == id &&
                (sheet.UserId == userId ||
                 sheet.Visibility == BudgetVisibility.Shared &&
                 householdId != null &&
                 _context.Users.Any(owner =>
                     owner.Id == sheet.UserId &&
                     owner.HouseholdId == householdId)));
    }

    public async Task<BudgetSheet> AddAsync(BudgetSheet sheet)
    {
        _context.BudgetSheets.Add(sheet);
        await _context.SaveChangesAsync();
        return sheet;
    }

    public async Task UpdateAsync(BudgetSheet sheet)
    {
        var newItems = sheet.Items
            .Where(item =>
                _context.Entry(item).State == EntityState.Detached)
            .ToList();

        if (newItems.Count > 0)
        {
            _context.BudgetItems.AddRange(newItems);
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(BudgetSheet sheet)
    {
        _context.BudgetSheets.Remove(sheet);
        await _context.SaveChangesAsync();
    }

    private async Task<Guid?> GetHouseholdIdAsync(string userId)
    {
        return await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleOrDefaultAsync();
    }
}
