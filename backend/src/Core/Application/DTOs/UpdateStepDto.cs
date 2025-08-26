namespace Core.Application.DTOs;

public class UpdateStepDto
{
    public string? Id { get; set; }
    public int StepNumber { get; set; }
    public string InstructionText { get; set; } = string.Empty;
}