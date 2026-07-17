using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllAsync(string userId);

    Task<Category?> GetByIdAsync(
        Guid id,
        string userId);

    Task<Category> AddAsync(Category category);

    Task UpdateAsync(Category category);

    Task DeleteAsync(Category category);
}