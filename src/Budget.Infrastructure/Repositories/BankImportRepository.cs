using Budget.Application.DTOs.Imports;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;
using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Repositories;

public class BankImportRepository : IBankImportRepository
{
    private readonly BudgetDbContext _context;

    public BankImportRepository(BudgetDbContext context)
    {
        _context = context;
    }

    public Task<bool> HasBeenImportedAsync(
        string fileHash,
        Guid accountId,
        string userId)
    {
        return _context.BankImportBatches.AnyAsync(batch =>
            batch.FileHash == fileHash &&
            batch.AccountId == accountId &&
            batch.UserId == userId);
    }

    public async Task<BankCsvImportResultDto> ImportAsync(
        string fileHash,
        Guid accountId,
        string userId,
        DateOnly month,
        IReadOnlyCollection<BankCsvRowDto> rows)
    {
        await using var databaseTransaction =
            await _context.Database.BeginTransactionAsync();

        var householdId = await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.HouseholdId)
            .SingleAsync();
        var visibleCategories = await _context.Categories
            .Where(category =>
                category.UserId == userId ||
                householdId != null &&
                _context.Users.Any(owner =>
                    owner.Id == category.UserId &&
                    owner.HouseholdId == householdId))
            .ToListAsync();
        var categories = visibleCategories
            .GroupBy(category => category.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.First(),
                StringComparer.OrdinalIgnoreCase);
        var createdCategories = 0;

        foreach (var categoryName in rows
                     .Select(row => row.Category)
                     .Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (categories.ContainsKey(categoryName))
            {
                continue;
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = categoryName,
                UserId = userId
            };
            categories.Add(categoryName, category);
            _context.Categories.Add(category);
            createdCategories++;
        }

        var transactionDate = new DateTime(
            month.Year,
            month.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);
        _context.Transactions.AddRange(rows.Select(row => new Transaction
        {
            Id = Guid.NewGuid(),
            Description = row.Description,
            Amount = row.Amount,
            Date = transactionDate,
            AccountId = accountId,
            CategoryId = categories[row.Category].Id
        }));
        _context.BankImportBatches.Add(new BankImportBatch
        {
            Id = Guid.NewGuid(),
            FileHash = fileHash,
            Month = month,
            ImportedAt = DateTime.UtcNow,
            TransactionCount = rows.Count,
            AccountId = accountId,
            UserId = userId
        });

        await _context.SaveChangesAsync();
        await databaseTransaction.CommitAsync();

        return new BankCsvImportResultDto
        {
            Month = month,
            ImportedTransactions = rows.Count,
            CreatedCategories = createdCategories
        };
    }
}
