using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data.Configurations;

public class TmsFileConfiguration : IEntityTypeConfiguration<TmsFile>
{
    public void Configure(EntityTypeBuilder<TmsFile> builder)
    {
        builder.HasKey(tf => tf.Id);
        
        builder.Property(tf => tf.EntityType)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(tf => tf.FileName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(tf => tf.OriginalFileName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(tf => tf.FilePath)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(tf => tf.FileType)
            .HasMaxLength(100);
            
        builder.Property(tf => tf.FileSize);
            
        builder.Property(tf => tf.MimeType)
            .HasMaxLength(100);
            
        builder.Property(tf => tf.Description);
            
        builder.Property(tf => tf.UploadedAtUtc)
            .IsRequired();

        builder.HasOne(tf => tf.Entity)
            .WithMany(e => e.TmsFiles)
            .HasForeignKey(tf => tf.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(tf => tf.EntityId);
        builder.HasIndex(tf => tf.CreatedBy);
        builder.HasIndex(tf => tf.UpdatedBy);
    }
}
