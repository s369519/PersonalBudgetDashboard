using Budget.Application.Interfaces;
using Budget.Application.Services;
using Budget.Domain.Entities;

namespace Budget.Application.Tests;

public class BudgetServiceTests
{
    [Fact]
    public async Task GetAllCalculatesActualCategorySpendingForBudgetMonth()
    {
        var categoryId = Guid.NewGuid();
        var month = new DateOnly(2026, 7, 1);
        var sheet = new BudgetSheet
        {
            Id = Guid.NewGuid(),
            Name = "July",
            Month = month,
            UserId = "user-1",
            Items =
            [
                new BudgetItem
                {
                    Description = "Food",
                    Type = BudgetItemType.Expense,
                    Amount = 1_000,
                    CategoryId = categoryId
                }
            ]
        };
        var transactions = new[]
        {
            new Transaction
            {
                Amount = -600,
                Date = new DateTime(2026, 7, 15, 0, 0, 0, DateTimeKind.Utc),
                CategoryId = categoryId
            },
            new Transaction
            {
                Amount = -500,
                Date = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                CategoryId = categoryId
            }
        };
        var service = new BudgetService(
            new BudgetRepositoryStub(sheet),
            new TransactionRepositoryStub(transactions),
            new CategoryRepositoryStub());

        var result = Assert.Single(await service.GetAllAsync("user-1"));
        var item = Assert.Single(result.Items);

        Assert.Equal(600, item.ActualAmount);
        Assert.Equal(400, item.Difference);
        Assert.Equal(600, result.ActualExpenses);
    }

    private sealed class BudgetRepositoryStub(BudgetSheet sheet)
        : IBudgetRepository
    {
        public Task<IEnumerable<BudgetSheet>> GetAllAsync(string userId) =>
            Task.FromResult<IEnumerable<BudgetSheet>>([sheet]);
        public Task<BudgetSheet?> GetByIdAsync(Guid id, string userId) =>
            Task.FromResult<BudgetSheet?>(sheet);
        public Task<BudgetSheet> AddAsync(BudgetSheet value) =>
            Task.FromResult(value);
        public Task UpdateAsync(BudgetSheet value) => Task.CompletedTask;
        public Task DeleteAsync(BudgetSheet value) => Task.CompletedTask;
    }

    private sealed class TransactionRepositoryStub(
        IEnumerable<Transaction> transactions)
        : ITransactionRepository
    {
        public Task<IEnumerable<Transaction>> GetAllAsync(string userId) =>
            Task.FromResult(transactions);
        public Task<Transaction?> GetByIdAsync(Guid id, string userId) =>
            Task.FromResult<Transaction?>(null);
        public Task<Transaction> AddAsync(Transaction value) =>
            Task.FromResult(value);
        public Task UpdateAsync(Transaction value) => Task.CompletedTask;
        public Task DeleteAsync(Transaction value) => Task.CompletedTask;
    }

    private sealed class CategoryRepositoryStub : ICategoryRepository
    {
        public Task<IEnumerable<Category>> GetAllAsync(string userId) =>
            Task.FromResult<IEnumerable<Category>>([]);
        public Task<Category?> GetByIdAsync(Guid id, string userId) =>
            Task.FromResult<Category?>(null);
        public Task<Category> AddAsync(Category value) => Task.FromResult(value);
        public Task UpdateAsync(Category value) => Task.CompletedTask;
        public Task DeleteAsync(Category value) => Task.CompletedTask;
    }
}
