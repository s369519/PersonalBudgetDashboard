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

    public async Task<IEnumerable<AccountDto>> GetAccountsAsync(
        string userId)
    {
        var accounts =
            await _repository.GetAllAsync(userId);

        return accounts.Select(MapToDto);
    }

    public async Task<AccountDto?> GetAccountByIdAsync(
        Guid id,
        string userId)
    {
        var account =
            await _repository.GetByIdAsync(id, userId);

        return account is null
            ? null
            : MapToDto(account);
    }

    public async Task<AccountDto> CreateAccountAsync(
        CreateAccountDto dto,
        string userId)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Balance = dto.Balance,
            UserId = userId
        };

        var created =
            await _repository.AddAsync(account);

        return MapToDto(created);
    }

    public async Task<AccountDto?> UpdateAccountAsync(
        Guid id,
        UpdateAccountDto dto,
        string userId)
    {
        var account =
            await _repository.GetByIdAsync(id, userId);

        if (account is null)
        {
            return null;
        }

        account.Name = dto.Name.Trim();
        account.Balance = dto.Balance;

        await _repository.UpdateAsync(account);

        return MapToDto(account);
    }

    public async Task<bool> DeleteAccountAsync(
        Guid id,
        string userId)
    {
        var account =
            await _repository.GetByIdAsync(id, userId);

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