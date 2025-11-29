using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class SupplyDeliveryConfiguration : IEntityTypeConfiguration<SupplyDelivery>
{
    public void Configure(EntityTypeBuilder<SupplyDelivery> builder)
    {
        builder.HasKey(sd => sd.Id);
        
        builder.Property(sd => sd.DeliveryNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(sd => sd.DeliveryDate)
            .IsRequired();
            
        builder.Property(sd => sd.Quantity)
            .IsRequired()
            .HasColumnType("decimal(10,2)");
            
        builder.Property(sd => sd.Unit)
            .HasMaxLength(50);
            
        builder.Property(sd => sd.UnitPrice)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(sd => sd.TotalAmount)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(sd => sd.DeliveryLocation);
        builder.Property(sd => sd.ActualDeliveryDate);
        builder.Property(sd => sd.AcceptanceDate);
        builder.Property(sd => sd.Notes);

        builder.HasOne(sd => sd.Contract)
            .WithMany(c => c.SupplyDeliveries)
            .HasForeignKey(sd => sd.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(sd => sd.DeliveryNumber).IsUnique();
        builder.HasIndex(sd => sd.ContractId);
        builder.HasIndex(sd => sd.CreatedBy);
        builder.HasIndex(sd => sd.UpdatedBy);
    }
}
