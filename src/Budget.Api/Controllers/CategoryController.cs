using Budget.Application.DTOs.Categories;
using Budget.Application.Services;
using Microsoft.AspNetCore.Mvc;


namespace Budget.Api.Controllers;


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
        var categories = await _service.GetCategoriesAsync();

        return Ok(categories);
    }


    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryDto dto)
    {
        var category = await _service.CreateCategoryAsync(dto);

        return Ok(category);
    }
}