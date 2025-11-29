using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
{
    public void Configure(EntityTypeBuilder<Quotation> builder)
    {
        builder.HasKey(q => q.Id);
        
        builder.Property(q => q.ReferenceNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(q => q.Amount)
            .IsRequired()
            .HasColumnType("decimal(15,2)");
            
        builder.Property(q => q.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(q => q.ValidityPeriod);
        builder.Property(q => q.DeliveryPeriod);
        
        builder.Property(q => q.TechnicalScore)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(q => q.FinancialScore)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(q => q.TotalScore)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(q => q.SubmissionDate)
            .IsRequired();
            
        builder.Property(q => q.EvaluationDate);
        builder.Property(q => q.EvaluationNotes);

        builder.HasOne(q => q.Tender)
            .WithMany(t => t.Quotations)
            .HasForeignKey(q => q.TenderId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(q => q.Supplier)
            .WithMany(s => s.Quotations)
            .HasForeignKey(q => q.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(q => q.Currency)
            .WithMany(c => c.Quotations)
            .HasForeignKey(q => q.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(q => q.ReferenceNumber).IsUnique();
        builder.HasIndex(q => q.TenderId);
        builder.HasIndex(q => q.SupplierId);
        builder.HasIndex(q => q.CurrencyCode);
        builder.HasIndex(q => q.Status);
        builder.HasIndex(q => q.CreatedBy);
        builder.HasIndex(q => q.UpdatedBy);
    }
}
