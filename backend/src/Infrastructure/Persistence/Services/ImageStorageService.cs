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
            
            // Handle null or empty input
            if (string.IsNullOrWhiteSpace(base64Image))
            {
                _logger.LogWarning("Empty or null base64 image provided for file: {FileName}", fileName);
                throw new ArgumentException("Image data is required");
            }
            
            // Validate and clean base64 format
            var cleanedBase64 = CleanBase64String(base64Image);
            if (!IsValidBase64(cleanedBase64))
            {
                _logger.LogWarning("Invalid base64 image format for file: {FileName}. Input length: {Length}", fileName, base64Image.Length);
                throw new ArgumentException("Invalid base64 image format");
            }

            // Simulate async upload
            await Task.Delay(100);
            
            // Return mock URL
            var imageUrl = $"https://storage.example.com/images/{fileName}.jpg";
            _logger.LogInformation("Image uploaded successfully: {ImageUrl}", imageUrl);
            
            return imageUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image: {FileName}. Error: {Error}", fileName, ex.Message);
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

    private static string CleanBase64String(string base64String)
    {
        if (string.IsNullOrWhiteSpace(base64String))
            return string.Empty;

        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if (base64String.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            var commaIndex = base64String.IndexOf(',');
            if (commaIndex >= 0 && commaIndex < base64String.Length - 1)
            {
                base64String = base64String[(commaIndex + 1)..];
            }
        }

        // Remove whitespace and newlines
        return base64String.Trim().Replace(" ", "").Replace("\n", "").Replace("\r", "").Replace("\t", "");
    }

    private static bool IsValidBase64(string base64String)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(base64String))
                return false;

            // Check if length is valid for base64 (must be multiple of 4)
            if (base64String.Length % 4 != 0)
                return false;

            // Check for valid base64 characters
            if (!System.Text.RegularExpressions.Regex.IsMatch(base64String, @"^[A-Za-z0-9+/]*={0,2}$"))
                return false;

            // Try to decode
            var buffer = Convert.FromBase64String(base64String);
            return buffer.Length > 0;
        }
        catch
        {
            return false;
        }
    }
}