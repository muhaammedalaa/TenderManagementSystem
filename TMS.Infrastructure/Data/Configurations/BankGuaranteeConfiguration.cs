using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class BankGuaranteeConfiguration : IEntityTypeConfiguration<BankGuarantee>
{
    public void Configure(EntityTypeBuilder<BankGuarantee> builder)
    {
        builder.HasKey(bg => bg.Id);
        
        builder.Property(bg => bg.GuaranteeNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(bg => bg.BankName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(bg => bg.BankBranch)
            .HasMaxLength(255);
            
        builder.Property(bg => bg.Amount)
            .IsRequired()
            .HasColumnType("decimal(15,2)");
            
        builder.Property(bg => bg.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(bg => bg.IssueDate)
            .IsRequired();
            
        builder.Property(bg => bg.ExpiryDate)
            .IsRequired();
            
        builder.Property(bg => bg.Notes);
        
        builder.Property(bg => bg.TaxAmount)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(bg => bg.TaxType)
            .HasMaxLength(50);
            
        builder.Property(bg => bg.TaxRate)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(bg => bg.TaxRegistrationNumber)
            .HasMaxLength(50);
            
        builder.Property(bg => bg.ProfitPercentage)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(bg => bg.CalculatedProfit)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(bg => bg.BankSwiftCode)
            .HasMaxLength(50);
            
        builder.Property(bg => bg.BankAccountNumber)
            .HasMaxLength(100);
            
        builder.Property(bg => bg.BankContactPerson)
            .HasMaxLength(255);
            
        builder.Property(bg => bg.BankContactEmail)
            .HasMaxLength(255);
            
        builder.Property(bg => bg.BankContactPhone)
            .HasMaxLength(50);
            
        builder.Property(bg => bg.GuaranteeTerms);
        builder.Property(bg => bg.RenewalPeriodDays);

        builder.HasOne(bg => bg.Quotation)
            .WithMany(q => q.BankGuarantees)
            .HasForeignKey(bg => bg.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(bg => bg.Currency)
            .WithMany(c => c.BankGuarantees)
            .HasForeignKey(bg => bg.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(bg => bg.GuaranteeNumber).IsUnique();
        builder.HasIndex(bg => bg.QuotationId);
        builder.HasIndex(bg => bg.CurrencyCode);
        builder.HasIndex(bg => bg.CreatedBy);
        builder.HasIndex(bg => bg.UpdatedBy);
    }
}
