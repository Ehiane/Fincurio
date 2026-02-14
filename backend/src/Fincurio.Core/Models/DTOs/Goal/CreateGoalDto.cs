using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.Goal;

public class CreateGoalDto
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [Required]
    [RegularExpression("^(budget|savings)$")]
    public required string Type { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal TargetAmount { get; set; }

    public Guid? CategoryId { get; set; }

    [RegularExpression("^(daily|weekly|monthly|yearly)$")]
    public string? Period { get; set; }

    public DateTime? Deadline { get; set; }

    public DateTime? StartDate { get; set; }
}
