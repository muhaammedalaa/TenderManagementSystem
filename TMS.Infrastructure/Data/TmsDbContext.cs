using Microsoft.EntityFrameworkCore;
using TMS.Core.Entities;

namespace TMS.Infrastructure.Data;

public class TmsDbContext : DbContext
{
    public TmsDbContext(DbContextOptions<TmsDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Entity> Entities { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Currency> Currencies { get; set; }
    public DbSet<Tender> Tenders { get; set; }
    public DbSet<Quotation> Quotations { get; set; }
    public DbSet<AssignmentOrder> AssignmentOrders { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<SupplyDelivery> SupplyDeliveries { get; set; }
    public DbSet<BankGuarantee> BankGuarantees { get; set; }
    public DbSet<GovernmentGuarantee> GovernmentGuarantees { get; set; }
    public DbSet<GuaranteeLetter> GuaranteeLetters { get; set; }
    public DbSet<SupportMatter> SupportMatters { get; set; }
    public DbSet<TmsFile> TmsFiles { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<OperationLog> OperationLogs { get; set; }
    
    // Financial Management
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<PaymentSchedule> PaymentSchedules { get; set; }
    
    // Approval Workflow
    public DbSet<ApprovalWorkflow> ApprovalWorkflows { get; set; }
    public DbSet<ApprovalStep> ApprovalSteps { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalAction> ApprovalActions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TmsDbContext).Assembly);

        // Configure enum conversions
        modelBuilder.HasPostgresEnum<Core.Enums.AddressType>();
        modelBuilder.HasPostgresEnum<Core.Enums.TenderStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.WinnerDeterminationMethod>();
        modelBuilder.HasPostgresEnum<Core.Enums.QuotationStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.AssignmentOrderStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.ContractType>();
        modelBuilder.HasPostgresEnum<Core.Enums.ContractStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.DeliveryStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.GuaranteeType>();
        modelBuilder.HasPostgresEnum<Core.Enums.GuaranteeStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.SupportPriority>();
        modelBuilder.HasPostgresEnum<Core.Enums.SupportStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.NotificationType>();
        modelBuilder.HasPostgresEnum<Core.Enums.NotificationStatus>();
        
        // Financial Management Enums
        modelBuilder.HasPostgresEnum<Core.Enums.InvoiceStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.PaymentType>();
        modelBuilder.HasPostgresEnum<Core.Enums.PaymentMethod>();
        modelBuilder.HasPostgresEnum<Core.Enums.PaymentStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.PaymentScheduleStatus>();
        
        // Approval Workflow Enums
        modelBuilder.HasPostgresEnum<Core.Enums.WorkflowType>();
        modelBuilder.HasPostgresEnum<Core.Enums.ApprovalRole>();
        modelBuilder.HasPostgresEnum<Core.Enums.ApprovalStatus>();
        modelBuilder.HasPostgresEnum<Core.Enums.ApprovalActionType>();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps
        var entries = ChangeTracker.Entries<Core.Common.BaseEntity>();
        
        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAtUtc = DateTime.UtcNow;
                    entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
