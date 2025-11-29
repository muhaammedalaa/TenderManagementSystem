using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class SupportMatterConfiguration : IEntityTypeConfiguration<SupportMatter>
{
    public void Configure(EntityTypeBuilder<SupportMatter> builder)
    {
        builder.HasKey(sm => sm.Id);
        
        builder.Property(sm => sm.Title)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(sm => sm.Category)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(sm => sm.Description);
        
        builder.Property(sm => sm.TotalAmount)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(sm => sm.ProfitPercentage)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(sm => sm.CalculatedProfit)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(sm => sm.OpenedAtUtc)
            .IsRequired();
            
        builder.Property(sm => sm.ClosedAtUtc);

        builder.HasOne(sm => sm.Entity)
            .WithMany(e => e.SupportMatters)
            .HasForeignKey(sm => sm.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(sm => sm.EntityId);
        builder.HasIndex(sm => sm.Status);
        builder.HasIndex(sm => sm.Priority);
        builder.HasIndex(sm => sm.CreatedBy);
        builder.HasIndex(sm => sm.UpdatedBy);
    }
}
