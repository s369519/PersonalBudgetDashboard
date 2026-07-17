using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface IBudgetRepository
{
    Task<IEnumerable<BudgetSheet>> GetAllAsync(string userId);
    Task<BudgetSheet?> GetByIdAsync(Guid id, string userId);
    Task<BudgetSheet> AddAsync(BudgetSheet sheet);
    Task UpdateAsync(BudgetSheet sheet);
    Task DeleteAsync(BudgetSheet sheet);
}
