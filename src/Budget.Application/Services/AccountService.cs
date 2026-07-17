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

        return accounts.Select(MapToDto);
    }

    public async Task<AccountDto?> GetAccountByIdAsync(Guid id)
    {
        var account = await _repository.GetByIdAsync(id);

        return account is null
            ? null
            : MapToDto(account);
    }

    public async Task<AccountDto> CreateAccountAsync(
        CreateAccountDto dto)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Balance = dto.Balance
        };

        var createdAccount = await _repository.AddAsync(account);

        return MapToDto(createdAccount);
    }

    public async Task<AccountDto?> UpdateAccountAsync(
        Guid id,
        UpdateAccountDto dto)
    {
        var account = await _repository.GetByIdAsync(id);

        if (account is null)
        {
            return null;
        }

        account.Name = dto.Name.Trim();
        account.Balance = dto.Balance;

        await _repository.UpdateAsync(account);

        return MapToDto(account);
    }

    public async Task<bool> DeleteAccountAsync(Guid id)
    {
        var account = await _repository.GetByIdAsync(id);

        if (account is null)
        {
            return false;
        }

        await _repository.DeleteAsync(account);

        return true;
    }

    private static AccountDto MapToDto(Account account)
    {
        return new AccountDto
        {
            Id = account.Id,
            Name = account.Name,
            Balance = account.Balance
        };
    }
}