using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class AssignmentOrderConfiguration : IEntityTypeConfiguration<AssignmentOrder>
{
    public void Configure(EntityTypeBuilder<AssignmentOrder> builder)
    {
        builder.HasKey(ao => ao.Id);
        
        builder.Property(ao => ao.OrderNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(ao => ao.Amount)
            .IsRequired()
            .HasColumnType("decimal(15,2)");
            
        builder.Property(ao => ao.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(ao => ao.OrderDate)
            .IsRequired();
            
        builder.Property(ao => ao.DeliveryDate);
        builder.Property(ao => ao.PaymentTerms);
        builder.Property(ao => ao.Notes);

        builder.HasOne(ao => ao.Quotation)
            .WithMany(q => q.AssignmentOrders)
            .HasForeignKey(ao => ao.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(ao => ao.Entity)
            .WithMany(e => e.AssignmentOrders)
            .HasForeignKey(ao => ao.EntityId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(ao => ao.Currency)
            .WithMany(c => c.AssignmentOrders)
            .HasForeignKey(ao => ao.CurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(ao => ao.OrderNumber).IsUnique();
        builder.HasIndex(ao => ao.QuotationId);
        builder.HasIndex(ao => ao.EntityId);
        builder.HasIndex(ao => ao.CurrencyCode);
        builder.HasIndex(ao => ao.CreatedBy);
        builder.HasIndex(ao => ao.UpdatedBy);
    }
}
