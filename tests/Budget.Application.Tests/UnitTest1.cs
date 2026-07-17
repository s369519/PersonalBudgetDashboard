using Budget.Application.DTOs.Accounts;
using Budget.Application.Exceptions;
using Budget.Application.Interfaces;
using Budget.Application.Services;
using Budget.Domain.Entities;

namespace Budget.Application.Tests;

public class AccountServiceSavingsGoalTests
{
    [Fact]
    public async Task SetSavingsGoalCalculatesRequiredMonthlySavings()
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            UserId = "user-1",
            StartingBalance = 3_000
        };
        var service = new AccountService(
            new AccountRepositoryStub(account));

        var result = await service.SetSavingsGoalAsync(
            account.Id,
            new UpdateSavingsGoalDto
            {
                TargetAmount = 15_000,
                TargetDate = DateOnly
                    .FromDateTime(DateTime.UtcNow)
                    .AddMonths(6)
            },
            account.UserId);

        Assert.NotNull(result);
        Assert.Equal(12_000, result.SavingsGoalRemaining);
        Assert.Equal(2_000, result.RequiredMonthlySavings);
    }

    [Fact]
    public async Task GetAccountsCalculatesBalanceFromStartingBalanceAndTransactions()
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            UserId = "user-1",
            StartingBalance = 5_000,
            Transactions =
            [
                new Transaction { Amount = 2_000 },
                new Transaction { Amount = -1_250 }
            ]
        };
        var service = new AccountService(new AccountRepositoryStub(account));

        var result = Assert.Single(await service.GetAccountsAsync("user-1"));

        Assert.Equal(5_000, result.StartingBalance);
        Assert.Equal(5_750, result.Balance);
    }

    [Fact]
    public async Task SetSavingsGoalRejectsDateThatIsNotInFuture()
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            UserId = "user-1"
        };
        var service = new AccountService(
            new AccountRepositoryStub(account));

        await Assert.ThrowsAsync<ValidationException>(() =>
            service.SetSavingsGoalAsync(
                account.Id,
                new UpdateSavingsGoalDto
                {
                    TargetAmount = 10_000,
                    TargetDate = DateOnly.FromDateTime(DateTime.UtcNow)
                },
                account.UserId));
    }

    private sealed class AccountRepositoryStub(Account account)
        : IAccountRepository
    {
        public Task<IEnumerable<Account>> GetAllAsync(string userId) =>
            Task.FromResult<IEnumerable<Account>>([account]);

        public Task<Account?> GetByIdAsync(Guid id, string userId) =>
            Task.FromResult<Account?>(
                id == account.Id ? account : null);

        public Task<Account> AddAsync(Account newAccount) =>
            Task.FromResult(newAccount);

        public Task UpdateAsync(Account updatedAccount) =>
            Task.CompletedTask;

        public Task DeleteAsync(Account deletedAccount) =>
            Task.CompletedTask;
    }
}
