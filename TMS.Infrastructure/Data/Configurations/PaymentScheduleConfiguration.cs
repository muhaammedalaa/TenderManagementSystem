using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class PaymentScheduleConfiguration : IEntityTypeConfiguration<PaymentSchedule>
{
    public void Configure(EntityTypeBuilder<PaymentSchedule> builder)
    {
        builder.HasKey(ps => ps.Id);
        
        builder.Property(ps => ps.ScheduleNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(ps => ps.Description)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(ps => ps.Amount)
            .HasColumnType("decimal(15,2)")
            .IsRequired();
            
        builder.Property(ps => ps.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(ps => ps.PaymentPercentage)
            .HasDefaultValue(25); // 25% عند التوقيع كقيمة افتراضية
            
        builder.Property(ps => ps.PaidAmount)
            .HasColumnType("decimal(15,2)")
            .HasDefaultValue(0);
            
        builder.Property(ps => ps.RemainingAmount)
            .HasColumnType("decimal(15,2)")
            .IsRequired();
            
        builder.HasIndex(ps => ps.ScheduleNumber)
            .IsUnique();
            
        builder.HasIndex(ps => ps.ContractId);
        builder.HasIndex(ps => ps.Status);
        builder.HasIndex(ps => ps.DueDate);
        builder.HasIndex(ps => ps.PaymentType);
        
        // Relationships
        builder.HasOne(ps => ps.Contract)
            .WithMany(c => c.PaymentSchedules)
            .HasForeignKey(ps => ps.ContractId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(ps => ps.Currency)
            .WithMany()
            .HasForeignKey(ps => ps.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(ps => ps.Invoice)
            .WithMany()
            .HasForeignKey(ps => ps.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
