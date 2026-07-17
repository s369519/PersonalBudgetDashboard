using Budget.Application.DTOs.Categories;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class CategoryService
{
    private readonly ICategoryRepository _repository;


    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }


    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync(string userId)
{
    var categories =
        await _repository.GetAllAsync(userId);

    return categories.Select(category => new CategoryDto
    {
        Id = category.Id,
        Name = category.Name
    });
}


    public async Task<CategoryDto> CreateCategoryAsync(
        CreateCategoryDto dto,
        string userId)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            UserId = userId
        };
        var created =
            await _repository.AddAsync(category);
        return new CategoryDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task<CategoryDto?> UpdateAsync(
        Guid id,
        UpdateCategoryDto dto,
        string userId)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        if (category is null)
        {
            return null;
        }
        category.Name = dto.Name.Trim();
        await _repository.UpdateAsync(category);
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        if (category is null)
        {
            return false;
        }
        await _repository.DeleteAsync(category);
        return true;
    }
}