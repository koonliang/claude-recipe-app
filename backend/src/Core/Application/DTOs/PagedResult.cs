namespace Core.Application.DTOs;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = null!;
}

public class PaginationInfo
{
    public int Page { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
    public int TotalPages { get; set; }
}