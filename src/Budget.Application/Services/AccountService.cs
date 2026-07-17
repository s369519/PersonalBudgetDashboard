using Budget.Application.DTOs.Accounts;
using Budget.Application.Interfaces;
using Budget.Application.Exceptions;
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
            StartingBalance = dto.StartingBalance,
            UserId = userId,
            Visibility = dto.Visibility
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

        if (account.UserId != userId &&
            dto.Visibility == AccountVisibility.Personal)
        {
            throw new ValidationException(
                "visibility",
                "Only the account owner can make a shared account personal.");
        }

        account.Name = dto.Name.Trim();
        account.StartingBalance = dto.StartingBalance;
        account.Visibility = dto.Visibility;

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

    public async Task<AccountDto?> SetSavingsGoalAsync(
        Guid id,
        UpdateSavingsGoalDto dto,
        string userId)
    {
        var account = await _repository.GetByIdAsync(id, userId);

        if (account is null)
        {
            return null;
        }

        if (dto.TargetDate <= DateOnly.FromDateTime(DateTime.UtcNow))
        {
            throw new ValidationException(
                "targetDate",
                "The savings goal date must be in the future.");
        }

        account.SavingsGoalAmount = dto.TargetAmount;
        account.SavingsGoalDate = dto.TargetDate;
        await _repository.UpdateAsync(account);

        return MapToDto(account);
    }

    public async Task<AccountDto?> ClearSavingsGoalAsync(
        Guid id,
        string userId)
    {
        var account = await _repository.GetByIdAsync(id, userId);

        if (account is null)
        {
            return null;
        }

        account.SavingsGoalAmount = null;
        account.SavingsGoalDate = null;
        await _repository.UpdateAsync(account);

        return MapToDto(account);
    }

    private static AccountDto MapToDto(Account account)
    {
        decimal? remaining = null;
        decimal? requiredMonthlySavings = null;
        var balance = account.StartingBalance +
            account.Transactions.Sum(transaction => transaction.Amount);

        if (account.SavingsGoalAmount is decimal targetAmount &&
            account.SavingsGoalDate is DateOnly targetDate)
        {
            remaining = Math.Max(0, targetAmount - balance);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var monthDifference =
                (targetDate.Year - today.Year) * 12 +
                targetDate.Month - today.Month;
            var monthsRemaining = Math.Max(
                1,
                monthDifference +
                (targetDate.Day > today.Day ? 1 : 0));

            requiredMonthlySavings = Math.Round(
                remaining.Value / monthsRemaining,
                2,
                MidpointRounding.AwayFromZero);
        }

        return new AccountDto
        {
            Id = account.Id,
            Name = account.Name,
            Balance = balance,
            StartingBalance = account.StartingBalance,
            Visibility = account.Visibility,
            SavingsGoalAmount = account.SavingsGoalAmount,
            SavingsGoalDate = account.SavingsGoalDate,
            SavingsGoalRemaining = remaining,
            RequiredMonthlySavings = requiredMonthlySavings
        };
    }
}
