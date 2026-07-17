using Budget.Application.Interfaces;
using Budget.Domain.Entities;
using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly BudgetDbContext _context;


    public CategoryRepository(BudgetDbContext context)
    {
        _context = context;
    }


    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _context.Categories.ToListAsync();
    }


    public async Task<Category?> GetByIdAsync(Guid id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<Category> AddAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Category category)
    {
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Category>> GetAllAsync(string userId)
    {
        return await _context.Categories
            .Where(category => category.UserId == userId)
            .OrderBy(category => category.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(
        Guid id,
        string userId)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(category =>
                category.Id == id &&
                category.UserId == userId);
    }
}