using System.ComponentModel.DataAnnotations;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class Entity : BaseEntity
{
    public Guid? ParentId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // Navigation properties
    public virtual Entity? Parent { get; set; }
    public virtual ICollection<Entity> Children { get; set; } = new List<Entity>();
    public virtual ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();
    public virtual ICollection<Tender> Tenders { get; set; } = new List<Tender>();
    public virtual ICollection<AssignmentOrder> AssignmentOrders { get; set; } = new List<AssignmentOrder>();
    public virtual ICollection<SupportMatter> SupportMatters { get; set; } = new List<SupportMatter>();
    public virtual ICollection<TmsFile> TmsFiles { get; set; } = new List<TmsFile>();
}
