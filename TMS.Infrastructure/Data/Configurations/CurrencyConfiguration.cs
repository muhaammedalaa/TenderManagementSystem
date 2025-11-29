using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(c => c.Symbol)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.Property(c => c.ExchangeRate)
            .IsRequired()
            .HasColumnType("decimal(10,4)");

        builder.HasIndex(c => c.Code).IsUnique();
        builder.HasIndex(c => c.CreatedBy);
        builder.HasIndex(c => c.UpdatedBy);
    }
}
