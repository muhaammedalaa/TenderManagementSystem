using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(a => a.Id);
        
        builder.Property(a => a.AddressLine1)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(a => a.AddressLine2)
            .HasMaxLength(255);
            
        builder.Property(a => a.City)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(a => a.State)
            .HasMaxLength(100);
            
        builder.Property(a => a.PostalCode)
            .HasMaxLength(20);
            
        builder.Property(a => a.Country)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(a => a.CreatedBy);
        builder.HasIndex(a => a.UpdatedBy);
    }
}
