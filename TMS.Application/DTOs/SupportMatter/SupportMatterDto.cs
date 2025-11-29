namespace TMS.Application.DTOs.SupportMatter;

public class SupportMatterDto
{
    public Guid Id { get; set; }
    public Guid EntityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? TotalAmount { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public decimal? CalculatedProfit { get; set; }
    public DateTime OpenedAtUtc { get; set; }
    public DateTime? ClosedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Navigation properties
    public string? EntityName { get; set; }
}
