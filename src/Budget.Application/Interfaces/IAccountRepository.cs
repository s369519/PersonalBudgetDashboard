using Budget.Domain.Entities;

namespace Budget.Application.Interfaces;

public interface IAccountRepository
{
    Task<IEnumerable<Account>> GetAllAsync();

    Task<Account?> GetByIdAsync(Guid id);

    Task<Account> AddAsync(Account account);

    Task DeleteAsync(Account account);

    Task UpdateAsync(Account account);
}