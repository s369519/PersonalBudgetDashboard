using Budget.Api.Extensions;
using Budget.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ImportsController : ControllerBase
{
    private readonly BankCsvImportService _service;

    public ImportsController(BankCsvImportService service)
    {
        _service = service;
    }

    [HttpPost("bank-csv/preview")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Preview(IFormFile file)
    {
        return Ok(_service.Preview(await ReadFileAsync(file)));
    }

    [HttpPost("bank-csv")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Import(
        IFormFile file,
        [FromForm] Guid accountId)
    {
        var result = await _service.ImportAsync(
            await ReadFileAsync(file),
            accountId,
            User.GetUserId());

        return Ok(result);
    }

    private static async Task<byte[]> ReadFileAsync(IFormFile file)
    {
        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        return stream.ToArray();
    }
}
