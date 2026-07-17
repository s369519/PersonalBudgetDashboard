using System.ComponentModel.DataAnnotations;

namespace Budget.Application.DTOs.Categories;

public class UpdateCategoryDto
{
    [Required(ErrorMessage = "Category name is required.")]
    [StringLength(
        50,
        MinimumLength = 2,
        ErrorMessage = "Category name must be between 2 and 50 characters.")]
    public string Name { get; set; } = string.Empty;
}