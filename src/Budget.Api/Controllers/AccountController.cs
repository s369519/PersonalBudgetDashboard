using Budget.Api.Extensions;
using Budget.Application.DTOs.Accounts;
using Budget.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[Authorize]
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
        var userId = User.GetUserId();

        var accounts =
            await _service.GetAccountsAsync(userId);

        return Ok(accounts);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();

        var account =
            await _service.GetAccountByIdAsync(
                id,
                userId);

        if (account is null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateAccountDto dto)
    {
        var userId = User.GetUserId();

        var account =
            await _service.CreateAccountAsync(
                dto,
                userId);

        return Ok(account);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateAccountDto dto)
    {
        var userId = User.GetUserId();

        var account =
            await _service.UpdateAccountAsync(
                id,
                dto,
                userId);

        if (account is null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();

        var deleted =
            await _service.DeleteAccountAsync(
                id,
                userId);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPut("{id:guid}/savings-goal")]
    public async Task<IActionResult> SetSavingsGoal(
        Guid id,
        UpdateSavingsGoalDto dto)
    {
        var account = await _service.SetSavingsGoalAsync(
            id,
            dto,
            User.GetUserId());

        return account is null
            ? NotFound()
            : Ok(account);
    }

    [HttpDelete("{id:guid}/savings-goal")]
    public async Task<IActionResult> ClearSavingsGoal(Guid id)
    {
        var account = await _service.ClearSavingsGoalAsync(
            id,
            User.GetUserId());

        return account is null
            ? NotFound()
            : Ok(account);
    }
}
