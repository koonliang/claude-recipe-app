namespace Core.Application.Interfaces;

public interface IImageStorageService
{
    Task<string> UploadImageAsync(string base64Image, string fileName);
    Task DeleteImageAsync(string imageUrl);
}