using TMS.Core.Entities;

namespace TMS.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Role> Roles { get; }
    IRepository<Entity> Entities { get; }
    IRepository<Address> Addresses { get; }
    IRepository<Supplier> Suppliers { get; }
    IRepository<Currency> Currencies { get; }
    IRepository<Tender> Tenders { get; }
    IRepository<Quotation> Quotations { get; }
    IRepository<AssignmentOrder> AssignmentOrders { get; }
    IRepository<Contract> Contracts { get; }
    IRepository<SupplyDelivery> SupplyDeliveries { get; }
    IRepository<BankGuarantee> BankGuarantees { get; }
    IRepository<GovernmentGuarantee> GovernmentGuarantees { get; }
    IRepository<GuaranteeLetter> GuaranteeLetters { get; }
    IRepository<SupportMatter> SupportMatters { get; }
    IRepository<TmsFile> TmsFiles { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<OperationLog> OperationLogs { get; }
    
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
