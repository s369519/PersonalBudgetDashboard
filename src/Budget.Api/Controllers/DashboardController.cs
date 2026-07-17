using Budget.Api.Extensions;
using Budget.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;

    public DashboardController(DashboardService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var userId = User.GetUserId();

        var result =
            await _service.GetSummaryAsync(userId);

        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> Categories()
    {
        var userId = User.GetUserId();

        var result =
            await _service.GetCategorySpendingAsync(userId);

        return Ok(result);
    }

    [HttpGet("trends")]
    public async Task<IActionResult> Trends([FromQuery] int months = 12)
    {
        var result = await _service.GetMonthlyTrendsAsync(
            User.GetUserId(),
            months);

        return Ok(result);
    }
}
