using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.Transaction;

public class CreateTransactionDto
{
    [Required]
    public DateTime Date { get; set; }

    public TimeSpan? Time { get; set; }

    [Required]
    [MinLength(1)]
    public required string Merchant { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^(income|expense|contribution)$")]
    public required string Type { get; set; }

    public string? Notes { get; set; }

    public Guid? GoalId { get; set; }
}
