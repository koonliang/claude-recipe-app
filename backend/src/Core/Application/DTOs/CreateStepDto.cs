namespace Core.Application.DTOs;

public class CreateStepDto
{
    public int StepNumber { get; set; }
    public string InstructionText { get; set; } = string.Empty;
}