using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class GuaranteeLetterConfiguration : IEntityTypeConfiguration<GuaranteeLetter>
{
    public void Configure(EntityTypeBuilder<GuaranteeLetter> builder)
    {
        builder.HasKey(gl => gl.Id);
        
        builder.Property(gl => gl.Type)
            .HasMaxLength(255);
            
        builder.Property(gl => gl.GuaranteeNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(gl => gl.Supplier)
            .HasMaxLength(255);
            
        builder.Property(gl => gl.Tender)
            .HasMaxLength(255);
            
        builder.Property(gl => gl.Winner)
            .HasMaxLength(255);
            
        builder.Property(gl => gl.Amount)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(gl => gl.IssueDate);
        builder.Property(gl => gl.ExpiryDate);
        
        builder.Property(gl => gl.Status)
            .HasMaxLength(50);
            
        builder.Property(gl => gl.ProfitPercentage)
            .HasColumnType("decimal(5,2)");
            
        builder.Property(gl => gl.CalculatedProfit)
            .HasColumnType("decimal(15,2)");

        builder.HasOne(gl => gl.Contract)
            .WithMany(c => c.GuaranteeLetters)
            .HasForeignKey(gl => gl.ContractId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(gl => gl.BankGuarantee)
            .WithMany(bg => bg.GuaranteeLetters)
            .HasForeignKey(gl => gl.BankGuaranteeId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(gl => gl.GovernmentGuarantee)
            .WithMany(gg => gg.GuaranteeLetters)
            .HasForeignKey(gl => gl.GovernmentGuaranteeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(gl => gl.GuaranteeNumber).IsUnique();
        builder.HasIndex(gl => gl.ContractId);
        builder.HasIndex(gl => gl.BankGuaranteeId);
        builder.HasIndex(gl => gl.GovernmentGuaranteeId);
        builder.HasIndex(gl => gl.CreatedBy);
        builder.HasIndex(gl => gl.UpdatedBy);
    }
}
