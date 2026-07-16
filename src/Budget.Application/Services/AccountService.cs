using Budget.Application.DTOs.Accounts;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class AccountService
{
    private readonly IAccountRepository _repository;

    public AccountService(IAccountRepository repository)
    {
        _repository = repository;
    }


    public async Task<IEnumerable<AccountDto>> GetAccountsAsync()
    {
        var accounts = await _repository.GetAllAsync();

        return accounts.Select(account => new AccountDto
        {
            Id = account.Id,
            Name = account.Name,
            Balance = account.Balance
        });
    }


    public async Task<AccountDto> CreateAccountAsync(CreateAccountDto dto)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Balance = dto.Balance
        };

        var created = await _repository.AddAsync(account);

        return new AccountDto
        {
            Id = created.Id,
            Name = created.Name,
            Balance = created.Balance
        };
    }

    public async Task<AccountDto?> GetAccountByIdAsync(Guid id)
    {
        var account = await _repository.GetByIdAsync(id);

        if (account == null)
            return null;

        return new AccountDto
        {
            Id = account.Id,
            Name = account.Name,
            Balance = account.Balance
        };
    }
}