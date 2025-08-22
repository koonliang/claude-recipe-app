namespace Core.Application.DTOs;

public class UpdateIngredientDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
}