using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface ITransactionRepository
{
    Task<IEnumerable<Transaction>> GetAllAsync();

    Task<Transaction?> GetByIdAsync(Guid id);

    Task<Transaction> AddAsync(Transaction transaction);

    Task DeleteAsync(Transaction transaction);
}