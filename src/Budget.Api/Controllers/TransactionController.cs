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
}