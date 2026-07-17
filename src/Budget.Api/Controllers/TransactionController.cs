using Budget.Application.DTOs.Transactions;
using Budget.Application.Services;
using Microsoft.AspNetCore.Mvc;


namespace Budget.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly TransactionService _service;


    public TransactionsController(TransactionService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var transactions =
            await _service.GetTransactionsAsync();

        return Ok(transactions);
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        CreateTransactionDto dto)
    {
        var transaction =
            await _service.CreateTransactionAsync(dto);

        return Ok(transaction);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteTransactionAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateTransactionDto dto)
    {
        var transaction =
            await _service.UpdateTransactionAsync(id, dto);

        if (transaction is null)
        {
            return NotFound();
        }

        return Ok(transaction);
    }
}