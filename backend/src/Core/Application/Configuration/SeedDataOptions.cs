using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class SeedDataOptions
{
    public const string SectionName = "SeedData";
    
    [Required]
    public bool EnableSeeding { get; set; } = false;
    
    public bool SeedOnlyIfEmpty { get; set; } = true;
}