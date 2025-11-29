using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class GovernmentGuaranteeConfiguration : IEntityTypeConfiguration<GovernmentGuarantee>
{
    public void Configure(EntityTypeBuilder<GovernmentGuarantee> builder)
    {
        builder.HasKey(gg => gg.Id);
        
        builder.Property(gg => gg.GuaranteeNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(gg => gg.AuthorityName)
            .HasMaxLength(255);
            
        builder.Property(gg => gg.AuthorityType)
            .HasMaxLength(100);
            
        builder.Property(gg => gg.Amount)
            .IsRequired()
            .HasColumnType("decimal(15,2)");
            
        builder.Property(gg => gg.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(gg => gg.IssueDate)
            .IsRequired();
            
        builder.Property(gg => gg.ExpiryDate)
            .IsRequired();
            
        builder.Property(gg => gg.Notes);
        
        builder.Property(gg => gg.TaxAmount)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(gg => gg.TaxType)
            .HasMaxLength(50);
            
        builder.Property(gg => gg.TaxRate)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(gg => gg.TaxRegistrationNumber)
            .HasMaxLength(50);
            
        builder.Property(gg => gg.ProfitPercentage)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(gg => gg.CalculatedProfit)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(gg => gg.AuthorityCode)
            .HasMaxLength(50);
            
        builder.Property(gg => gg.AuthorityContactPerson)
            .HasMaxLength(255);
            
        builder.Property(gg => gg.AuthorityContactEmail)
            .HasMaxLength(255);
            
        builder.Property(gg => gg.AuthorityContactPhone)
            .HasMaxLength(50);
            
        builder.Property(gg => gg.GuaranteeTerms);
        builder.Property(gg => gg.RenewalPeriodDays);
        
        builder.Property(gg => gg.ApprovalNumber)
            .HasMaxLength(100);
            
        builder.Property(gg => gg.ApprovalDate);

        builder.HasOne(gg => gg.Quotation)
            .WithMany(q => q.GovernmentGuarantees)
            .HasForeignKey(gg => gg.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(gg => gg.Currency)
            .WithMany(c => c.GovernmentGuarantees)
            .HasForeignKey(gg => gg.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(gg => gg.GuaranteeNumber).IsUnique();
        builder.HasIndex(gg => gg.QuotationId);
        builder.HasIndex(gg => gg.CurrencyCode);
        builder.HasIndex(gg => gg.CreatedBy);
        builder.HasIndex(gg => gg.UpdatedBy);
    }
}
