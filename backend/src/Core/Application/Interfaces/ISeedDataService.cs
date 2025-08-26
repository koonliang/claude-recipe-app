namespace Core.Application.Interfaces;

public interface ISeedDataService
{
    Task SeedAsync();
    Task<bool> IsDatabaseEmptyAsync();
}