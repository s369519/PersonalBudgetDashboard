using Budget.Application.DTOs.Transactions;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class TransactionService
{
    private readonly ITransactionRepository _repository;


    public TransactionService(
        ITransactionRepository repository)
    {
        _repository = repository;
    }


    public async Task<IEnumerable<TransactionDto>> GetTransactionsAsync()
    {
        var transactions = await _repository.GetAllAsync();


        return transactions.Select(x => new TransactionDto
        {
            Id = x.Id,
            Description = x.Description,
            Amount = x.Amount,
            Date = x.Date,

            AccountName = x.Account.Name,

            CategoryName = x.Category.Name
        });
    }


    public async Task<TransactionDto> CreateTransactionAsync(
        CreateTransactionDto dto)
    {
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),

            Description = dto.Description,

            Amount = dto.Amount,

            Date = DateTime.SpecifyKind(
                dto.Date,
                DateTimeKind.Utc),

            AccountId = dto.AccountId,

            CategoryId = dto.CategoryId
        };


        var created = await _repository.AddAsync(transaction);


        return new TransactionDto
        {
            Id = created.Id,
            Description = created.Description,
            Amount = created.Amount,
            Date = created.Date
        };
    }
}