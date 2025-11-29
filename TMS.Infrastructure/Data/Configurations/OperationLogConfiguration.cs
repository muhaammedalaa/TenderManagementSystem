using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class OperationLogConfiguration : IEntityTypeConfiguration<OperationLog>
{
    public void Configure(EntityTypeBuilder<OperationLog> builder)
    {
        builder.HasKey(ol => ol.Id);
        
        builder.Property(ol => ol.OperationType)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(ol => ol.Description);
        
        builder.Property(ol => ol.EntityType)
            .HasMaxLength(255);
            
        builder.Property(ol => ol.EntityId);
        builder.Property(ol => ol.Details);
        builder.Property(ol => ol.UserId);
        
        builder.Property(ol => ol.UserName)
            .HasMaxLength(255);
            
        builder.Property(ol => ol.Timestamp)
            .IsRequired();
            
        builder.Property(ol => ol.Status)
            .HasMaxLength(50);
            
        builder.Property(ol => ol.ErrorMessage);

        builder.HasOne(ol => ol.User)
            .WithMany(u => u.OperationLogs)
            .HasForeignKey(ol => ol.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(ol => ol.UserId);
        builder.HasIndex(ol => ol.CreatedBy);
        builder.HasIndex(ol => ol.UpdatedBy);
    }
}
