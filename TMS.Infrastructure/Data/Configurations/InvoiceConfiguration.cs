using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(i => i.Amount)
            .HasColumnType("decimal(15,2)")
            .IsRequired();
            
        builder.Property(i => i.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(i => i.TaxAmount)
            .HasColumnType("decimal(15,2)")
            .HasDefaultValue(0);
            
        builder.Property(i => i.TaxRate)
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0);
            
        builder.Property(i => i.TotalAmount)
            .HasColumnType("decimal(15,2)")
            .IsRequired();
            
        builder.Property(i => i.PaidAmount)
            .HasColumnType("decimal(15,2)")
            .HasDefaultValue(0);
            
        builder.Property(i => i.RemainingAmount)
            .HasColumnType("decimal(15,2)")
            .IsRequired();
            
        builder.Property(i => i.PaymentPercentage)
            .HasDefaultValue(25); // 25% عند التوقيع كقيمة افتراضية
            
        builder.HasIndex(i => i.InvoiceNumber)
            .IsUnique();
            
        builder.HasIndex(i => i.ContractId);
        builder.HasIndex(i => i.Status);
        builder.HasIndex(i => i.DueDate);
        
        // Relationships
        builder.HasOne(i => i.Contract)
            .WithMany(c => c.Invoices)
            .HasForeignKey(i => i.ContractId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(i => i.Currency)
            .WithMany()
            .HasForeignKey(i => i.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(i => i.PaidByUser)
            .WithMany()
            .HasForeignKey(i => i.PaidBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
