using Budget.Api.Extensions;
using Budget.Application.DTOs.Budgets;
using Budget.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly BudgetService _service;

    public BudgetsController(BudgetService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await _service.GetAllAsync(User.GetUserId()));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var budget = await _service.GetByIdAsync(id, User.GetUserId());
        return budget is null ? NotFound() : Ok(budget);
    }

    [HttpPost]
    public async Task<IActionResult> Create(SaveBudgetSheetDto dto)
    {
        var budget = await _service.CreateAsync(dto, User.GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = budget.Id }, budget);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        SaveBudgetSheetDto dto)
    {
        var budget = await _service.UpdateAsync(id, dto, User.GetUserId());
        return budget is null ? NotFound() : Ok(budget);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        return await _service.DeleteAsync(id, User.GetUserId())
            ? NoContent()
            : NotFound();
    }
}
