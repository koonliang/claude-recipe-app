namespace Core.Application.DTOs;

public class StepDto : BaseDto
{
    public int StepNumber { get; set; }
    public string InstructionText { get; set; } = string.Empty;
}