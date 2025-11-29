using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class EntityConfiguration : IEntityTypeConfiguration<Entity>
{
    public void Configure(EntityTypeBuilder<Entity> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(e => e.Code)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(e => e.Description);

        builder.HasOne(e => e.Parent)
            .WithMany(e => e.Children)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => e.ParentId);
        builder.HasIndex(e => e.CreatedBy);
        builder.HasIndex(e => e.UpdatedBy);
    }
}
