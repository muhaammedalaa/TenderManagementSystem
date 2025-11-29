using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);
        
        builder.Property(n => n.UserId)
            .IsRequired();
            
        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(n => n.Message)
            .IsRequired();
            
        builder.Property(n => n.RelatedEntityType)
            .HasMaxLength(255);
            
        builder.Property(n => n.ReadAtUtc);

        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => n.CreatedBy);
        builder.HasIndex(n => n.UpdatedBy);
    }
}
