namespace Fincurio.Core.Models.DTOs.Insight;

public class MoneyFlowResponseDto
{
    public DateTime? EarliestDate { get; set; }
    public DateTime? LatestDate { get; set; }
    public DateTime FilterStart { get; set; }
    public DateTime FilterEnd { get; set; }
    public string Grouping { get; set; } = "weekly"; // "daily", "weekly", "monthly", "yearly"
    public List<MonthlyFlowDto> DataPoints { get; set; } = new();
}
