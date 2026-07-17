using Budget.Application.Services;
using Budget.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Budget.Application.DTOs.Accounts;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly AccountService _service;

    public AccountsController(AccountService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var accounts = await _service.GetAccountsAsync();
        return Ok(accounts);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAccountDto dto)
    {
        var created = await _service.CreateAccountAsync(dto);
        return Ok(created);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var account = await _service.GetAccountByIdAsync(id);
        if (account == null)
            return NotFound();
        return Ok(account);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateAccountDto dto)
    {
        var updated = await _service.UpdateAccountAsync(id, dto);
        if (updated == null)
            return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAccountAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}