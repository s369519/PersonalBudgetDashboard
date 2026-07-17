using Budget.Application.DTOs.Transactions;
using Budget.Application.Exceptions;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class TransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IAccountRepository _accountRepository;
    private readonly ICategoryRepository _categoryRepository;

    public TransactionService(
        ITransactionRepository transactionRepository,
        IAccountRepository accountRepository,
        ICategoryRepository categoryRepository)
    {
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<TransactionDto>> GetTransactionsAsync(
        string userId)
    {
        var transactions =
            await _transactionRepository.GetAllAsync(userId);

        return transactions.Select(MapToDto);
    }

    public async Task<TransactionDto> CreateTransactionAsync(
        CreateTransactionDto dto,
        string userId)
    {
        await ValidateTransactionAsync(
            dto.Description,
            dto.Amount,
            dto.Date,
            dto.AccountId,
            dto.CategoryId,
            userId);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            Description = dto.Description.Trim(),
            Amount = dto.Amount,
            Date = DateTime.SpecifyKind(
                dto.Date,
                DateTimeKind.Utc),
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId
        };

        var createdTransaction =
            await _transactionRepository.AddAsync(transaction);

        var savedTransaction =
            await _transactionRepository.GetByIdAsync(
                createdTransaction.Id,
                userId);

        if (savedTransaction is null)
        {
            throw new InvalidOperationException(
                "The transaction was created but could not be loaded.");
        }

        return MapToDto(savedTransaction);
    }

    public async Task<TransactionDto?> UpdateTransactionAsync(
        Guid id,
        UpdateTransactionDto dto,
        string userId)
    {
        var transaction =
            await _transactionRepository.GetByIdAsync(
                id,
                userId);

        if (transaction is null)
        {
            return null;
        }

        await ValidateTransactionAsync(
            dto.Description,
            dto.Amount,
            dto.Date,
            dto.AccountId,
            dto.CategoryId,
            userId);

        transaction.Description = dto.Description.Trim();
        transaction.Amount = dto.Amount;
        transaction.Date = DateTime.SpecifyKind(
            dto.Date,
            DateTimeKind.Utc);
        transaction.AccountId = dto.AccountId;
        transaction.CategoryId = dto.CategoryId;

        await _transactionRepository.UpdateAsync(transaction);

        var updatedTransaction =
            await _transactionRepository.GetByIdAsync(
                id,
                userId);

        return updatedTransaction is null
            ? null
            : MapToDto(updatedTransaction);
    }

    public async Task<bool> DeleteTransactionAsync(
        Guid id,
        string userId)
    {
        var transaction =
            await _transactionRepository.GetByIdAsync(
                id,
                userId);

        if (transaction is null)
        {
            return false;
        }

        await _transactionRepository.DeleteAsync(transaction);

        return true;
    }

    private async Task ValidateTransactionAsync(
        string description,
        decimal amount,
        DateTime date,
        Guid accountId,
        Guid categoryId,
        string userId)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(description))
        {
            errors["description"] =
                ["Description cannot be empty."];
        }

        if (amount == 0)
        {
            errors["amount"] =
                ["Amount cannot be zero."];
        }

        if (date == default)
        {
            errors["date"] =
                ["A valid date is required."];
        }

        if (date.Date > DateTime.UtcNow.Date.AddDays(1))
        {
            errors["date"] =
                ["Transaction date cannot be in the future."];
        }

        if (accountId == Guid.Empty)
        {
            errors["accountId"] =
                ["An account must be selected."];
        }
        else
        {
            var account =
                await _accountRepository.GetByIdAsync(
                    accountId,
                    userId);

            if (account is null)
            {
                errors["accountId"] =
                    ["The selected account does not exist."];
            }
        }

        if (categoryId == Guid.Empty)
        {
            errors["categoryId"] =
                ["A category must be selected."];
        }
        else
        {
            var category =
                await _categoryRepository.GetByIdAsync(
                    categoryId,
                    userId);

            if (category is null)
            {
                errors["categoryId"] =
                    ["The selected category does not exist."];
            }
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }
    }

    private static TransactionDto MapToDto(
        Transaction transaction)
    {
        return new TransactionDto
        {
            Id = transaction.Id,
            Description = transaction.Description,
            Amount = transaction.Amount,
            Date = transaction.Date,
            AccountName =
                transaction.Account?.Name ?? string.Empty,
            CategoryName =
                transaction.Category?.Name ?? string.Empty
        };
    }
}