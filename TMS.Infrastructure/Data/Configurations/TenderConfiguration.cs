using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class TenderConfiguration : IEntityTypeConfiguration<Tender>
{
    public void Configure(EntityTypeBuilder<Tender> builder)
    {
        builder.HasKey(t => t.Id);
        
        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(t => t.Description);
            
        builder.Property(t => t.ReferenceNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(t => t.Category)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(t => t.EstimatedBudget)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(t => t.SubmissionDeadline)
            .IsRequired();
            
        builder.Property(t => t.OpeningDate)
            .IsRequired();
            
        builder.Property(t => t.Requirements);
        builder.Property(t => t.TermsConditions);
        
        builder.Property(t => t.LowestBidAmount)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(t => t.HighestScore)
            .HasColumnType("decimal(5,2)");

        builder.HasOne(t => t.Entity)
            .WithMany(e => e.Tenders)
            .HasForeignKey(t => t.EntityId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(t => t.WinnerQuotation)
            .WithMany()
            .HasForeignKey(t => t.WinnerQuotationId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(t => t.LowestBidQuotation)
            .WithMany()
            .HasForeignKey(t => t.LowestBidQuotationId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(t => t.HighestScoreQuotation)
            .WithMany()
            .HasForeignKey(t => t.HighestScoreQuotationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.ReferenceNumber).IsUnique();
        builder.HasIndex(t => t.EntityId);
        builder.HasIndex(t => t.WinnerQuotationId);
        builder.HasIndex(t => t.LowestBidQuotationId);
        builder.HasIndex(t => t.HighestScoreQuotationId);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.CreatedBy);
        builder.HasIndex(t => t.UpdatedBy);
    }
}
