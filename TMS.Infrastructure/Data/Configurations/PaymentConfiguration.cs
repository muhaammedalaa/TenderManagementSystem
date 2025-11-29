using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.PaymentNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(p => p.Amount)
            .HasColumnType("decimal(15,2)")
            .IsRequired();
            
        builder.Property(p => p.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.HasIndex(p => p.PaymentNumber)
            .IsUnique();
            
        builder.HasIndex(p => p.InvoiceId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.PaymentDate);
        builder.HasIndex(p => p.TransactionReference);
        
        // Relationships
        builder.HasOne(p => p.Invoice)
            .WithMany(i => i.Payments)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(p => p.Currency)
            .WithMany()
            .HasForeignKey(p => p.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(p => p.ConfirmedByUser)
            .WithMany()
            .HasForeignKey(p => p.ConfirmedBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
