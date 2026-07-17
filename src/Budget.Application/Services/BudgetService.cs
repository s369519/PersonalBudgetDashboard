using Budget.Application.DTOs.Budgets;
using Budget.Application.Exceptions;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class BudgetService
{
    private readonly IBudgetRepository _repository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;

    public BudgetService(
        IBudgetRepository repository,
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<BudgetSheetDto>> GetAllAsync(
        string userId)
    {
        var sheets = await _repository.GetAllAsync(userId);
        var transactions = await _transactionRepository.GetAllAsync(userId);
        return sheets.Select(sheet => MapToDto(sheet, transactions));
    }

    public async Task<BudgetSheetDto?> GetByIdAsync(
        Guid id,
        string userId)
    {
        var sheet = await _repository.GetByIdAsync(id, userId);
        if (sheet is null)
        {
            return null;
        }

        var transactions = await _transactionRepository.GetAllAsync(userId);
        return MapToDto(sheet, transactions);
    }

    public async Task<BudgetSheetDto> CreateAsync(
        SaveBudgetSheetDto dto,
        string userId)
    {
        Validate(dto);
        await ValidateCategoriesAsync(dto, userId);

        var sheet = new BudgetSheet
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Month = new DateOnly(dto.Month.Year, dto.Month.Month, 1),
            Visibility = dto.Visibility,
            UserId = userId,
            Items = CreateItems(dto.Items)
        };

        await _repository.AddAsync(sheet);
        var transactions = await _transactionRepository.GetAllAsync(userId);
        return MapToDto(sheet, transactions);
    }

    public async Task<BudgetSheetDto?> UpdateAsync(
        Guid id,
        SaveBudgetSheetDto dto,
        string userId)
    {
        Validate(dto);
        await ValidateCategoriesAsync(dto, userId);
        var sheet = await _repository.GetByIdAsync(id, userId);

        if (sheet is null)
        {
            return null;
        }

        if (sheet.UserId != userId &&
            dto.Visibility == BudgetVisibility.Personal)
        {
            throw new ValidationException(
                "visibility",
                "Only the budget owner can make a shared budget personal.");
        }

        sheet.Name = dto.Name.Trim();
        sheet.Month = new DateOnly(dto.Month.Year, dto.Month.Month, 1);
        sheet.Visibility = dto.Visibility;
        sheet.Items.Clear();

        foreach (var item in CreateItems(dto.Items))
        {
            sheet.Items.Add(item);
        }

        await _repository.UpdateAsync(sheet);
        var transactions = await _transactionRepository.GetAllAsync(userId);
        return MapToDto(sheet, transactions);
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var sheet = await _repository.GetByIdAsync(id, userId);

        if (sheet is null)
        {
            return false;
        }

        await _repository.DeleteAsync(sheet);
        return true;
    }

    private static List<BudgetItem> CreateItems(
        IEnumerable<SaveBudgetItemDto> items)
    {
        return items.Select((item, index) => new BudgetItem
        {
            Id = Guid.NewGuid(),
            Description = item.Description.Trim(),
            Type = item.Type,
            Amount = item.Amount,
            SortOrder = index,
            CategoryId = item.CategoryId
        }).ToList();
    }

    private static void Validate(SaveBudgetSheetDto dto)
    {
        if (dto.Month == default)
        {
            throw new ValidationException("month", "Select a budget month.");
        }

        if (dto.Items.Count() > 200)
        {
            throw new ValidationException(
                "items",
                "A budget can contain at most 200 rows.");
        }

        if (dto.Items.Any(item =>
                string.IsNullOrWhiteSpace(item.Description) ||
                item.Amount <= 0))
        {
            throw new ValidationException(
                "items",
                "Every budget row needs a description and an amount greater than zero.");
        }
    }

    private async Task ValidateCategoriesAsync(
        SaveBudgetSheetDto dto,
        string userId)
    {
        foreach (var categoryId in dto.Items
                     .Where(item => item.CategoryId.HasValue)
                     .Select(item => item.CategoryId!.Value)
                     .Distinct())
        {
            if (categoryId == Guid.Empty ||
                await _categoryRepository.GetByIdAsync(
                    categoryId,
                    userId) is null)
            {
                throw new ValidationException(
                    "categoryId",
                    "A selected category does not exist or is not available to you.");
            }
        }
    }

    private static BudgetSheetDto MapToDto(
        BudgetSheet sheet,
        IEnumerable<Transaction> transactions)
    {
        var income = sheet.Items
            .Where(item => item.Type == BudgetItemType.Income)
            .Sum(item => item.Amount);
        var expenses = sheet.Items
            .Where(item => item.Type == BudgetItemType.Expense)
            .Sum(item => item.Amount);
        var monthStart = sheet.Month;
        var monthEnd = sheet.Month.AddMonths(1);
        var monthlyTransactions = transactions
            .Where(transaction =>
            {
                var date = DateOnly.FromDateTime(transaction.Date);
                return date >= monthStart && date < monthEnd;
            })
            .ToList();
        var actualIncome = monthlyTransactions
            .Where(transaction => transaction.Amount > 0)
            .Sum(transaction => transaction.Amount);
        var actualExpenses = monthlyTransactions
            .Where(transaction => transaction.Amount < 0)
            .Sum(transaction => Math.Abs(transaction.Amount));

        return new BudgetSheetDto
        {
            Id = sheet.Id,
            Name = sheet.Name,
            Month = sheet.Month,
            Visibility = sheet.Visibility,
            TotalIncome = income,
            TotalExpenses = expenses,
            Remaining = income - expenses,
            ActualIncome = actualIncome,
            ActualExpenses = actualExpenses,
            ActualRemaining = actualIncome - actualExpenses,
            Items = sheet.Items
                .OrderBy(item => item.SortOrder)
                .Select(item =>
                {
                    var actual = item.CategoryId is null
                        ? 0
                        : monthlyTransactions
                            .Where(transaction =>
                                transaction.CategoryId == item.CategoryId &&
                                (item.Type == BudgetItemType.Income
                                    ? transaction.Amount > 0
                                    : transaction.Amount < 0))
                            .Sum(transaction => Math.Abs(transaction.Amount));

                    return new BudgetItemDto
                    {
                        Id = item.Id,
                        Description = item.Description,
                        Type = item.Type,
                        Amount = item.Amount,
                        SortOrder = item.SortOrder,
                        CategoryId = item.CategoryId,
                        CategoryName = item.Category?.Name,
                        ActualAmount = actual,
                        Difference = item.Type == BudgetItemType.Expense
                            ? item.Amount - actual
                            : actual - item.Amount
                    };
                })
        };
    }
}
