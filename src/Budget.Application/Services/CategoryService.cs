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


    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
    {
        var categories = await _repository.GetAllAsync();

        return categories.Select(x => new CategoryDto
        {
            Id = x.Id,
            Name = x.Name
        });
    }


    public async Task<CategoryDto> CreateCategoryAsync(
        CreateCategoryDto dto)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name
        };


        var created = await _repository.AddAsync(category);


        return new CategoryDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category is null)
        {
            return false;
        }
        await _repository.DeleteAsync(category);
        return true;
    }
}