using Budget.Application.Services;
using Microsoft.AspNetCore.Mvc;


namespace Budget.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;


    public DashboardController(
        DashboardService service)
    {
        _service = service;
    }


    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var result =
            await _service.GetSummaryAsync();

        return Ok(result);
    }


    [HttpGet("categories")]
    public async Task<IActionResult> Categories()
    {
        var result =
            await _service.GetCategorySpendingAsync();

        return Ok(result);
    }
}