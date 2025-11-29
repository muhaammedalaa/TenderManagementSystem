using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(s => s.Email)
            .HasMaxLength(255);
            
        builder.Property(s => s.Phone)
            .HasMaxLength(50);
            
        builder.Property(s => s.Category)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(s => s.TaxNumber)
            .HasMaxLength(50);
            
        builder.Property(s => s.RegistrationNumber)
            .HasMaxLength(50);
            
        builder.Property(s => s.ContactPerson)
            .HasMaxLength(255);
            
        builder.Property(s => s.ContactPhone)
            .HasMaxLength(50);
            
        builder.Property(s => s.ContactEmail)
            .HasMaxLength(255);
            
        builder.Property(s => s.FinancialCapacity)
            .HasColumnType("decimal(15,2)");
            
        builder.Property(s => s.ExperienceYears);

        builder.HasOne(s => s.Entity)
            .WithMany(e => e.Suppliers)
            .HasForeignKey(s => s.EntityId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(s => s.PrimaryAddress)
            .WithMany(a => a.Suppliers)
            .HasForeignKey(s => s.PrimaryAddressId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(s => s.EntityId);
        builder.HasIndex(s => s.PrimaryAddressId);
        builder.HasIndex(s => s.CreatedBy);
        builder.HasIndex(s => s.UpdatedBy);
    }
}
