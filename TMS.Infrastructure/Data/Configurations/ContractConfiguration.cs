using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.ContractNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(c => c.Amount)
            .IsRequired()
            .HasColumnType("decimal(15,2)");
            
        builder.Property(c => c.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(c => c.StartDate)
            .IsRequired();
            
        builder.Property(c => c.EndDate)
            .IsRequired();
            
        builder.Property(c => c.PaymentTerms);
        builder.Property(c => c.DeliveryTerms);
        builder.Property(c => c.WarrantyPeriod);
        builder.Property(c => c.TerminationDate);
        builder.Property(c => c.TerminationReason);

        builder.HasOne(c => c.AssignmentOrder)
            .WithMany(ao => ao.Contracts)
            .HasForeignKey(c => c.AssignmentOrderId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(c => c.Currency)
            .WithMany(cu => cu.Contracts)
            .HasForeignKey(c => c.CurrencyCode)
            .HasPrincipalKey(cu => cu.Code)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.ContractNumber).IsUnique();
        builder.HasIndex(c => c.AssignmentOrderId);
        builder.HasIndex(c => c.CurrencyCode);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.CreatedBy);
        builder.HasIndex(c => c.UpdatedBy);
    }
}
