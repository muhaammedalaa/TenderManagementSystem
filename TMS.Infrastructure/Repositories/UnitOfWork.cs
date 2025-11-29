using Microsoft.EntityFrameworkCore.Storage;
using TMS.Core.Entities;
using TMS.Core.Interfaces;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly TmsDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(TmsDbContext context)
    {
        _context = context;
        Users = new GenericRepository<User>(_context);
        Roles = new GenericRepository<Role>(_context);
        Entities = new GenericRepository<Entity>(_context);
        Addresses = new GenericRepository<Address>(_context);
        Suppliers = new GenericRepository<Supplier>(_context);
        Currencies = new GenericRepository<Currency>(_context);
        Tenders = new GenericRepository<Tender>(_context);
        Quotations = new GenericRepository<Quotation>(_context);
        AssignmentOrders = new GenericRepository<AssignmentOrder>(_context);
        Contracts = new GenericRepository<Contract>(_context);
        SupplyDeliveries = new GenericRepository<SupplyDelivery>(_context);
        BankGuarantees = new GenericRepository<BankGuarantee>(_context);
        GovernmentGuarantees = new GenericRepository<GovernmentGuarantee>(_context);
        GuaranteeLetters = new GenericRepository<GuaranteeLetter>(_context);
        SupportMatters = new GenericRepository<SupportMatter>(_context);
        TmsFiles = new GenericRepository<TmsFile>(_context);
        Notifications = new GenericRepository<Notification>(_context);
        OperationLogs = new GenericRepository<OperationLog>(_context);
    }

    public IRepository<User> Users { get; }
    public IRepository<Role> Roles { get; }
    public IRepository<Entity> Entities { get; }
    public IRepository<Address> Addresses { get; }
    public IRepository<Supplier> Suppliers { get; }
    public IRepository<Currency> Currencies { get; }
    public IRepository<Tender> Tenders { get; }
    public IRepository<Quotation> Quotations { get; }
    public IRepository<AssignmentOrder> AssignmentOrders { get; }
    public IRepository<Contract> Contracts { get; }
    public IRepository<SupplyDelivery> SupplyDeliveries { get; }
    public IRepository<BankGuarantee> BankGuarantees { get; }
    public IRepository<GovernmentGuarantee> GovernmentGuarantees { get; }
    public IRepository<GuaranteeLetter> GuaranteeLetters { get; }
    public IRepository<SupportMatter> SupportMatters { get; }
    public IRepository<TmsFile> TmsFiles { get; }
    public IRepository<Notification> Notifications { get; }
    public IRepository<OperationLog> OperationLogs { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
