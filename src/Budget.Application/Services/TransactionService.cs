using Budget.Application.DTOs.Transactions;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class TransactionService
{
    private readonly ITransactionRepository _repository;

    public TransactionService(ITransactionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TransactionDto>> GetTransactionsAsync()
    {
        var transactions = await _repository.GetAllAsync();

        return transactions.Select(MapToDto);
    }

    public async Task<TransactionDto> CreateTransactionAsync(
        CreateTransactionDto dto)
    {
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            Description = dto.Description.Trim(),
            Amount = dto.Amount,
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId
        };

        var createdTransaction = await _repository.AddAsync(transaction);

        var savedTransaction =
            await _repository.GetByIdAsync(createdTransaction.Id);

        if (savedTransaction is null)
        {
            throw new InvalidOperationException(
                "The transaction was created but could not be loaded.");
        }

        return MapToDto(savedTransaction);
    }

    public async Task<TransactionDto?> UpdateTransactionAsync(
        Guid id,
        UpdateTransactionDto dto)
    {
        var transaction = await _repository.GetByIdAsync(id);

        if (transaction is null)
        {
            return null;
        }

        transaction.Description = dto.Description.Trim();
        transaction.Amount = dto.Amount;
        transaction.Date = DateTime.SpecifyKind(
            dto.Date,
            DateTimeKind.Utc);

        transaction.AccountId = dto.AccountId;
        transaction.CategoryId = dto.CategoryId;

        await _repository.UpdateAsync(transaction);

        var updatedTransaction = await _repository.GetByIdAsync(id);

        return updatedTransaction is null
            ? null
            : MapToDto(updatedTransaction);
    }

    public async Task<bool> DeleteTransactionAsync(Guid id)
    {
        var transaction = await _repository.GetByIdAsync(id);

        if (transaction is null)
        {
            return false;
        }

        await _repository.DeleteAsync(transaction);

        return true;
    }

    private static TransactionDto MapToDto(Transaction transaction)
    {
        return new TransactionDto
        {
            Id = transaction.Id,
            Description = transaction.Description,
            Amount = transaction.Amount,
            Date = transaction.Date,
            AccountName = transaction.Account?.Name ?? string.Empty,
            CategoryName = transaction.Category?.Name ?? string.Empty
        };
    }
}