using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface IAccountRepository
{
    Task<IEnumerable<Account>> GetAllAsync(string userId);

    Task<Account?> GetByIdAsync(
        Guid id,
        string userId);

    Task<Account> AddAsync(Account account);

    Task UpdateAsync(Account account);

    Task DeleteAsync(Account account);
}