using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface ITransactionRepository
{
    Task<IEnumerable<Transaction>> GetAllAsync(
        string userId);

    Task<Transaction?> GetByIdAsync(
        Guid id,
        string userId);

    Task<Transaction> AddAsync(Transaction transaction);

    Task UpdateAsync(Transaction transaction);

    Task DeleteAsync(Transaction transaction);
}