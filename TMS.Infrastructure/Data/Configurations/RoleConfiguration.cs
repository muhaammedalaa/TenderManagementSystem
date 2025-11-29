using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(r => r.Description);

        builder.HasIndex(r => r.Name).IsUnique();
        builder.HasIndex(r => r.CreatedBy);
        builder.HasIndex(r => r.UpdatedBy);
    }
}
