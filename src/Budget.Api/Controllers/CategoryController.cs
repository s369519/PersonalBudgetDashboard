using Budget.Application.DTOs.Categories;
using Budget.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Budget.Api.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace Budget.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _service;


    public CategoriesController(CategoryService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var categories = await _service.GetCategoriesAsync(User.GetUserId());

        return Ok(categories);
    }


    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryDto dto)
    {
        var category = await _service.CreateCategoryAsync(dto, User.GetUserId());

        return Ok(category);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCategoryDto dto)
    {
        var category = await _service.UpdateAsync(id, dto, User.GetUserId());
        if (category is null)
        {
            return NotFound();
        }
        return Ok(category);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id, User.GetUserId());
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}