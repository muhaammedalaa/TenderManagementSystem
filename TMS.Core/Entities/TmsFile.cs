using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class TmsFile : BaseEntity
{
    [Required]
    public Guid EntityId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string EntityType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? FileType { get; set; }
    
    public long? FileSize { get; set; }
    
    [MaxLength(100)]
    public string? MimeType { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
    
    public Guid? UploadedBy { get; set; }
    
    public bool IsPublic { get; set; } = false;
    
    // Navigation properties
    public virtual Entity Entity { get; set; } = null!;
    public virtual User? UploadedByUser { get; set; }
}
