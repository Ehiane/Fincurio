namespace Fincurio.Core.Models.DTOs.Transaction;

public class TransactionListResponseDto
{
    public List<TransactionDto> Transactions { get; set; } = new();
    public PaginationDto Pagination { get; set; } = null!;
}

public class PaginationDto
{
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
}
