using Core.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence.Services;

public class ImageStorageService : IImageStorageService
{
    private readonly ILogger<ImageStorageService> _logger;

    public ImageStorageService(ILogger<ImageStorageService> logger)
    {
        _logger = logger;
    }

    public async Task<string> UploadImageAsync(string base64Image, string fileName)
    {
        try
        {
            // In production, integrate with AWS S3, Azure Blob Storage, or another cloud storage service
            // For demo purposes, simulate image upload
            _logger.LogInformation("Uploading image: {FileName}", fileName);
            
            // Validate base64 format
            if (!IsValidBase64(base64Image))
                throw new ArgumentException("Invalid base64 image format");

            // Simulate async upload
            await Task.Delay(100);
            
            // Return mock URL
            var imageUrl = $"https://storage.example.com/images/{fileName}.jpg";
            _logger.LogInformation("Image uploaded successfully: {ImageUrl}", imageUrl);
            
            return imageUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image: {FileName}", fileName);
            throw;
        }
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        try
        {
            // In production, delete from cloud storage
            _logger.LogInformation("Deleting image: {ImageUrl}", imageUrl);
            
            // Simulate async deletion
            await Task.Delay(50);
            
            _logger.LogInformation("Image deleted successfully: {ImageUrl}", imageUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete image: {ImageUrl}", imageUrl);
            // Don't throw for deletion failures in demo
        }
    }

    private static bool IsValidBase64(string base64String)
    {
        try
        {
            // Remove data URL prefix if present
            if (base64String.StartsWith("data:"))
            {
                var commaIndex = base64String.IndexOf(',');
                if (commaIndex >= 0)
                    base64String = base64String[(commaIndex + 1)..];
            }

            // Validate base64 format
            var buffer = Convert.FromBase64String(base64String);
            return buffer.Length > 0;
        }
        catch
        {
            return false;
        }
    }
}