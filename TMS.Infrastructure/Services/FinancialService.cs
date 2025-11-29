using TMS.Application.DTOs.Financial;
using TMS.Application.DTOs.Report;
using TMS.Application.DTOs.Common;
using TMS.Application.Interfaces;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace TMS.Infrastructure.Services;

public class FinancialService : IFinancialService
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public FinancialService(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto dto)
    {
        // Validate contract exists
        var contract = await _context.Contracts
            .Include(c => c.AssignmentOrder)
                .ThenInclude(ao => ao.Quotation)
                    .ThenInclude(q => q.Supplier)
            .Include(c => c.AssignmentOrder)
                .ThenInclude(ao => ao.Entity)
            .FirstOrDefaultAsync(c => c.Id == dto.ContractId);

        if (contract == null)
        {
            throw new ArgumentException($"Contract with ID {dto.ContractId} not found");
        }

        // Validate invoice number is unique
        var existingInvoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.InvoiceNumber == dto.InvoiceNumber);
        
        if (existingInvoice != null)
        {
            throw new ArgumentException($"Invoice with number '{dto.InvoiceNumber}' already exists");
        }

        // Create invoice entity
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            ContractId = dto.ContractId,
            InvoiceNumber = dto.InvoiceNumber,
            Amount = dto.Amount,
            CurrencyCode = dto.CurrencyCode,
            IssueDate = DateTime.UtcNow,
            DueDate = dto.DueDate.Kind == DateTimeKind.Utc ? dto.DueDate : DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc),
            Status = InvoiceStatus.Draft,
            TaxAmount = dto.Amount * (dto.TaxRate / 100),
            TaxRate = dto.TaxRate,
            TaxType = dto.TaxType,
            TotalAmount = dto.Amount + (dto.Amount * (dto.TaxRate / 100)),
            PaidAmount = 0,
            RemainingAmount = dto.Amount + (dto.Amount * (dto.TaxRate / 100)),
            PaymentType = dto.PaymentType,
            PaymentPercentage = dto.PaymentPercentage,
            Description = dto.Description,
            Notes = dto.Notes,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        // Map to DTO and return
        var invoiceDto = _mapper.Map<InvoiceDto>(invoice);
        return invoiceDto;
    }

    public async Task<InvoiceDto> GetInvoiceAsync(Guid id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Quotation)
                        .ThenInclude(q => q.Supplier)
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Entity)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new ArgumentException($"Invoice with ID {id} not found");
        }

        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Quotation)
                        .ThenInclude(q => q.Supplier)
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Entity)
            .OrderByDescending(i => i.CreatedAtUtc)
            .ToListAsync();

        var invoiceDtos = _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
        
        // Add contract information to each invoice
        foreach (var invoiceDto in invoiceDtos)
        {
            var invoice = invoices.FirstOrDefault(i => i.Id == invoiceDto.Id);
            if (invoice?.Contract != null)
            {
                invoiceDto.ContractNumber = invoice.Contract.ContractNumber;
                invoiceDto.EntityName = invoice.Contract.AssignmentOrder?.Entity?.Name;
                invoiceDto.SupplierName = invoice.Contract.AssignmentOrder?.Quotation?.Supplier?.Name;
            }
        }

        return invoiceDtos;
    }

    public async Task<PagedResultDto<InvoiceDto>> GetInvoicesWithPaginationAsync(SearchFilterDto filter)
    {
        var query = _context.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Quotation)
                        .ThenInclude(q => q.Supplier)
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Entity)
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(filter.Search))
        {
            var searchTerm = filter.Search.ToLower();
            query = query.Where(i => 
                i.InvoiceNumber.ToLower().Contains(searchTerm) ||
                i.Contract.ContractNumber.ToLower().Contains(searchTerm) ||
                (i.Contract.AssignmentOrder != null && 
                 (i.Contract.AssignmentOrder.Entity.Name.ToLower().Contains(searchTerm) ||
                  i.Contract.AssignmentOrder.Quotation.Supplier.Name.ToLower().Contains(searchTerm)))
            );
        }

        // Apply status filter
        if (!string.IsNullOrEmpty(filter.Status) && filter.Status != "all")
        {
            if (Enum.TryParse<InvoiceStatus>(filter.Status, true, out var status))
            {
                query = query.Where(i => i.Status == status);
            }
        }

        // Apply date range filter
        if (filter.FromDate.HasValue)
        {
            query = query.Where(i => i.IssueDate >= filter.FromDate.Value);
        }
        if (filter.ToDate.HasValue)
        {
            query = query.Where(i => i.IssueDate <= filter.ToDate.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply sorting
        if (!string.IsNullOrEmpty(filter.SortBy))
        {
            switch (filter.SortBy.ToLower())
            {
                case "invoicenumber":
                    query = filter.SortDirection == "desc" ? query.OrderByDescending(i => i.InvoiceNumber) : query.OrderBy(i => i.InvoiceNumber);
                    break;
                case "issuedate":
                    query = filter.SortDirection == "desc" ? query.OrderByDescending(i => i.IssueDate) : query.OrderBy(i => i.IssueDate);
                    break;
                case "totalamount":
                    query = filter.SortDirection == "desc" ? query.OrderByDescending(i => i.TotalAmount) : query.OrderBy(i => i.TotalAmount);
                    break;
                default:
                    query = query.OrderByDescending(i => i.CreatedAtUtc);
                    break;
            }
        }
        else
        {
            query = query.OrderByDescending(i => i.CreatedAtUtc);
        }

        // Apply pagination
        var invoices = await query
            .Skip((filter.Page - 1) * filter.Limit)
            .Take(filter.Limit)
            .ToListAsync();

        var invoiceDtos = _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
        
        // Add contract information to each invoice
        foreach (var invoiceDto in invoiceDtos)
        {
            var invoice = invoices.FirstOrDefault(i => i.Id == invoiceDto.Id);
            if (invoice?.Contract != null)
            {
                invoiceDto.ContractNumber = invoice.Contract.ContractNumber;
                invoiceDto.EntityName = invoice.Contract.AssignmentOrder?.Entity?.Name;
                invoiceDto.SupplierName = invoice.Contract.AssignmentOrder?.Quotation?.Supplier?.Name;
            }
        }

        return new PagedResultDto<InvoiceDto>
        {
            Data = invoiceDtos.ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            Limit = filter.Limit
        };
    }

    public async Task<IEnumerable<InvoiceDto>> GetInvoicesByContractAsync(Guid contractId)
    {
        var invoices = await _context.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Quotation)
                        .ThenInclude(q => q.Supplier)
            .Include(i => i.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao.Entity)
            .Where(i => i.ContractId == contractId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
    }

    public async Task<InvoiceDto> UpdateInvoiceAsync(Guid id, UpdateInvoiceDto dto)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null)
        {
            throw new ArgumentException($"Invoice with ID {id} not found");
        }

        // Update properties
        if (!string.IsNullOrEmpty(dto.InvoiceNumber))
            invoice.InvoiceNumber = dto.InvoiceNumber;
        if (dto.Amount.HasValue)
            invoice.Amount = dto.Amount.Value;
        if (!string.IsNullOrEmpty(dto.CurrencyCode))
            invoice.CurrencyCode = dto.CurrencyCode;
        if (dto.DueDate.HasValue)
            invoice.DueDate = dto.DueDate.Value.Kind == DateTimeKind.Utc ? dto.DueDate.Value : DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc);
        if (dto.TaxRate.HasValue)
            invoice.TaxRate = dto.TaxRate.Value;
        if (!string.IsNullOrEmpty(dto.TaxType))
            invoice.TaxType = dto.TaxType;
        if (dto.PaymentType.HasValue)
            invoice.PaymentType = dto.PaymentType.Value;
        if (dto.PaymentPercentage.HasValue)
            invoice.PaymentPercentage = dto.PaymentPercentage.Value;
        if (!string.IsNullOrEmpty(dto.Description))
            invoice.Description = dto.Description;
        if (!string.IsNullOrEmpty(dto.Notes))
            invoice.Notes = dto.Notes;

        // Recalculate totals
        invoice.TaxAmount = invoice.Amount * (invoice.TaxRate / 100);
        invoice.TotalAmount = invoice.Amount + invoice.TaxAmount;
        invoice.RemainingAmount = invoice.TotalAmount - invoice.PaidAmount;
        invoice.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<bool> DeleteInvoiceAsync(Guid id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null)
        {
            return false;
        }

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto)
    {
        // Validate invoice exists and track it for updates
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == dto.InvoiceId);
        if (invoice == null)
        {
            throw new ArgumentException($"Invoice with ID {dto.InvoiceId} not found");
        }
        
        Console.WriteLine($"Found invoice: {invoice.InvoiceNumber}, Current PaidAmount: {invoice.PaidAmount}, TotalAmount: {invoice.TotalAmount}");

        // Create payment entity
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = dto.InvoiceId,
            PaymentNumber = dto.PaymentNumber,
            Amount = dto.Amount,
            CurrencyCode = dto.CurrencyCode,
            PaymentDate = dto.PaymentDate.Kind == DateTimeKind.Utc ? dto.PaymentDate : DateTime.SpecifyKind(dto.PaymentDate, DateTimeKind.Utc),
            PaymentMethod = dto.PaymentMethod,
            Status = PaymentStatus.Pending,
            BankName = dto.BankName,
            BankAccount = dto.BankAccount,
            TransactionReference = dto.TransactionReference,
            CheckNumber = dto.CheckNumber,
            CheckDate = dto.CheckDate.HasValue ? (dto.CheckDate.Value.Kind == DateTimeKind.Utc ? dto.CheckDate.Value : DateTime.SpecifyKind(dto.CheckDate.Value, DateTimeKind.Utc)) : null,
            CheckDueDate = dto.CheckDueDate.HasValue ? (dto.CheckDueDate.Value.Kind == DateTimeKind.Utc ? dto.CheckDueDate.Value : DateTime.SpecifyKind(dto.CheckDueDate.Value, DateTimeKind.Utc)) : null,
            BankSwiftCode = dto.BankSwiftCode,
            BankIban = dto.BankIban,
            Notes = dto.Notes,
            ReceiptNumber = dto.ReceiptNumber,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        
        // Update invoice payment information
        Console.WriteLine($"Before update - PaidAmount: {invoice.PaidAmount}, Adding: {dto.Amount}");
        invoice.PaidAmount += dto.Amount;
        invoice.RemainingAmount = invoice.TotalAmount - invoice.PaidAmount;
        Console.WriteLine($"After update - PaidAmount: {invoice.PaidAmount}, RemainingAmount: {invoice.RemainingAmount}");
        
        // Update invoice status based on payment
        if (invoice.RemainingAmount <= 0)
        {
            invoice.Status = InvoiceStatus.Paid;
            Console.WriteLine("Invoice status set to Paid");
        }
        else if (invoice.PaidAmount > 0)
        {
            invoice.Status = InvoiceStatus.PartiallyPaid;
            Console.WriteLine("Invoice status set to PartiallyPaid");
        }
        
        invoice.UpdatedAtUtc = DateTime.UtcNow;
        
        Console.WriteLine("Saving changes to database...");
        await _context.SaveChangesAsync();
        Console.WriteLine("Changes saved successfully");

        return _mapper.Map<PaymentDto>(payment);
    }

    public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync()
    {
        var payments = await _context.Payments
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Contract)
                    .ThenInclude(c => c.AssignmentOrder)
                        .ThenInclude(ao => ao.Quotation)
                            .ThenInclude(q => q.Supplier)
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Contract)
                    .ThenInclude(c => c.AssignmentOrder)
                        .ThenInclude(ao => ao.Entity)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync();
            
        Console.WriteLine($"Found {payments.Count} payments");
        if (payments.Any())
        {
            var firstPayment = payments.First();
            Console.WriteLine($"First payment: {firstPayment.PaymentNumber}");
            Console.WriteLine($"Invoice: {firstPayment.Invoice?.InvoiceNumber}");
            Console.WriteLine($"Contract: {firstPayment.Invoice?.Contract?.ContractNumber}");
        }

        var paymentDtos = _mapper.Map<IEnumerable<PaymentDto>>(payments);
        
        // Add invoice information to each payment manually
        foreach (var paymentDto in paymentDtos)
        {
            var payment = payments.FirstOrDefault(p => p.Id == paymentDto.Id);
            if (payment?.Invoice != null)
            {
                Console.WriteLine($"Payment {payment.PaymentNumber} - Invoice: {payment.Invoice.InvoiceNumber}");
                Console.WriteLine($"Contract: {payment.Invoice.Contract?.ContractNumber}");
                Console.WriteLine($"Entity: {payment.Invoice.Contract?.AssignmentOrder?.Entity?.Name}");
                Console.WriteLine($"Supplier: {payment.Invoice.Contract?.AssignmentOrder?.Quotation?.Supplier?.Name}");
                
                paymentDto.InvoiceNumber = payment.Invoice.InvoiceNumber;
                paymentDto.ContractNumber = payment.Invoice.Contract?.ContractNumber;
                paymentDto.EntityName = payment.Invoice.Contract?.AssignmentOrder?.Entity?.Name;
                paymentDto.SupplierName = payment.Invoice.Contract?.AssignmentOrder?.Quotation?.Supplier?.Name;
            }
            else
            {
                Console.WriteLine($"Payment {payment?.PaymentNumber} - No invoice found");
            }
        }

        return paymentDtos;
    }

    public async Task<PagedResultDto<PaymentDto>> GetPaymentsWithPaginationAsync(SearchFilterDto filter)
    {
        var query = _context.Payments
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Contract)
                    .ThenInclude(c => c.AssignmentOrder)
                        .ThenInclude(ao => ao.Quotation)
                            .ThenInclude(q => q.Supplier)
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Contract)
                    .ThenInclude(c => c.AssignmentOrder)
                        .ThenInclude(ao => ao.Entity)
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(filter.Search))
        {
            var searchTerm = filter.Search.ToLower();
            query = query.Where(p => 
                p.PaymentNumber.ToLower().Contains(searchTerm) ||
                (p.TransactionReference != null && p.TransactionReference.ToLower().Contains(searchTerm)) ||
                (p.CheckNumber != null && p.CheckNumber.ToLower().Contains(searchTerm)) ||
                p.Invoice.InvoiceNumber.ToLower().Contains(searchTerm) ||
                p.Invoice.Contract.ContractNumber.ToLower().Contains(searchTerm) ||
                (p.Invoice.Contract.AssignmentOrder != null && 
                 (p.Invoice.Contract.AssignmentOrder.Entity.Name.ToLower().Contains(searchTerm) ||
                  p.Invoice.Contract.AssignmentOrder.Quotation.Supplier.Name.ToLower().Contains(searchTerm)))
            );
        }

        // Apply status filter
        if (!string.IsNullOrEmpty(filter.Status) && filter.Status != "all")
        {
            if (Enum.TryParse<PaymentStatus>(filter.Status, true, out var status))
            {
                query = query.Where(p => p.Status == status);
            }
        }

        // Apply date range filter
        if (filter.FromDate.HasValue)
        {
            query = query.Where(p => p.PaymentDate >= filter.FromDate.Value);
        }
        if (filter.ToDate.HasValue)
        {
            query = query.Where(p => p.PaymentDate <= filter.ToDate.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply sorting
        if (!string.IsNullOrEmpty(filter.SortBy))
        {
            switch (filter.SortBy.ToLower())
            {
                case "paymentnumber":
                    query = filter.SortDirection == "desc" ? query.OrderByDescending(p => p.PaymentNumber) : query.OrderBy(p => p.PaymentNumber);
                    break;
                case "paymentdate":
                    query = filter.SortDirection == "desc" ? query.OrderByDescending(p => p.PaymentDate) : query.OrderBy(p => p.PaymentDate);
                    break;
                case "amount":
                    query = filter.SortDirection == "desc" ? query.OrderByDescending(p => p.Amount) : query.OrderBy(p => p.Amount);
                    break;
                default:
                    query = query.OrderByDescending(p => p.CreatedAtUtc);
                    break;
            }
        }
        else
        {
            query = query.OrderByDescending(p => p.CreatedAtUtc);
        }

        // Apply pagination
        var payments = await query
            .Skip((filter.Page - 1) * filter.Limit)
            .Take(filter.Limit)
            .ToListAsync();

        var paymentDtos = _mapper.Map<IEnumerable<PaymentDto>>(payments);
        
        // Add invoice information to each payment
        foreach (var paymentDto in paymentDtos)
        {
            var payment = payments.FirstOrDefault(p => p.Id == paymentDto.Id);
            if (payment?.Invoice != null)
            {
                paymentDto.InvoiceNumber = payment.Invoice.InvoiceNumber;
                paymentDto.ContractNumber = payment.Invoice.Contract?.ContractNumber;
                paymentDto.EntityName = payment.Invoice.Contract?.AssignmentOrder?.Entity?.Name;
                paymentDto.SupplierName = payment.Invoice.Contract?.AssignmentOrder?.Quotation?.Supplier?.Name;
            }
        }

        return new PagedResultDto<PaymentDto>
        {
            Data = paymentDtos.ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            Limit = filter.Limit
        };
    }

    public async Task<PaymentDto> GetPaymentAsync(Guid id)
    {
        var payment = await _context.Payments
            .Include(p => p.Invoice)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            throw new ArgumentException($"Payment with ID {id} not found");
        }

        return _mapper.Map<PaymentDto>(payment);
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(Guid invoiceId)
    {
        var payments = await _context.Payments
            .Include(p => p.Invoice)
            .Where(p => p.InvoiceId == invoiceId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<PaymentDto>>(payments);
    }

    public async Task<PaymentDto> UpdatePaymentAsync(Guid id, UpdatePaymentDto dto)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null)
        {
            throw new ArgumentException($"Payment with ID {id} not found");
        }

        // Update properties
        if (!string.IsNullOrEmpty(dto.PaymentNumber))
            payment.PaymentNumber = dto.PaymentNumber;
        if (dto.Amount.HasValue)
            payment.Amount = dto.Amount.Value;
        if (!string.IsNullOrEmpty(dto.CurrencyCode))
            payment.CurrencyCode = dto.CurrencyCode;
        if (dto.PaymentDate.HasValue)
            payment.PaymentDate = dto.PaymentDate.Value.Kind == DateTimeKind.Utc ? dto.PaymentDate.Value : DateTime.SpecifyKind(dto.PaymentDate.Value, DateTimeKind.Utc);
        if (dto.PaymentMethod.HasValue)
            payment.PaymentMethod = dto.PaymentMethod.Value;
        if (!string.IsNullOrEmpty(dto.BankName))
            payment.BankName = dto.BankName;
        if (!string.IsNullOrEmpty(dto.BankAccount))
            payment.BankAccount = dto.BankAccount;
        if (!string.IsNullOrEmpty(dto.TransactionReference))
            payment.TransactionReference = dto.TransactionReference;
        if (!string.IsNullOrEmpty(dto.CheckNumber))
            payment.CheckNumber = dto.CheckNumber;
        if (dto.CheckDate.HasValue)
            payment.CheckDate = dto.CheckDate.Value.Kind == DateTimeKind.Utc ? dto.CheckDate.Value : DateTime.SpecifyKind(dto.CheckDate.Value, DateTimeKind.Utc);
        if (dto.CheckDueDate.HasValue)
            payment.CheckDueDate = dto.CheckDueDate.Value.Kind == DateTimeKind.Utc ? dto.CheckDueDate.Value : DateTime.SpecifyKind(dto.CheckDueDate.Value, DateTimeKind.Utc);
        if (!string.IsNullOrEmpty(dto.BankSwiftCode))
            payment.BankSwiftCode = dto.BankSwiftCode;
        if (!string.IsNullOrEmpty(dto.BankIban))
            payment.BankIban = dto.BankIban;
        if (!string.IsNullOrEmpty(dto.Notes))
            payment.Notes = dto.Notes;
        if (!string.IsNullOrEmpty(dto.ReceiptNumber))
            payment.ReceiptNumber = dto.ReceiptNumber;

        payment.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<PaymentDto>(payment);
    }

    public async Task<bool> DeletePaymentAsync(Guid id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null)
        {
            return false;
        }

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ConfirmPaymentAsync(Guid id, ConfirmPaymentDto dto)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null)
        {
            throw new ArgumentException($"Payment with ID {id} not found");
        }

        payment.Status = PaymentStatus.Completed;
        payment.ConfirmationDate = DateTime.UtcNow;
        payment.ConfirmedBy = dto.ConfirmedBy;
        payment.ConfirmationNotes = dto.ConfirmationNotes;
        payment.UpdatedAtUtc = DateTime.UtcNow;

        // Update invoice paid amount
        var invoice = await _context.Invoices.FindAsync(payment.InvoiceId);
        if (invoice != null)
        {
            invoice.PaidAmount += payment.Amount;
            invoice.RemainingAmount = invoice.TotalAmount - invoice.PaidAmount;
            invoice.UpdatedAtUtc = DateTime.UtcNow;

            // Update invoice status
            if (invoice.RemainingAmount <= 0)
            {
                invoice.Status = InvoiceStatus.Paid;
            }
            else if (invoice.PaidAmount > 0)
            {
                invoice.Status = InvoiceStatus.PartiallyPaid;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PaymentScheduleDto> GetPaymentScheduleAsync(Guid id)
    {
        var paymentSchedule = await _context.PaymentSchedules
            .Include(ps => ps.Contract)
            .FirstOrDefaultAsync(ps => ps.Id == id);

        if (paymentSchedule == null)
        {
            throw new ArgumentException($"Payment schedule with ID {id} not found");
        }

        return _mapper.Map<PaymentScheduleDto>(paymentSchedule);
    }

    public async Task<PaymentScheduleDto> CreatePaymentScheduleAsync(CreatePaymentScheduleDto dto)
    {
        // Validate contract exists
        var contract = await _context.Contracts.FindAsync(dto.ContractId);
        if (contract == null)
        {
            throw new ArgumentException($"Contract with ID {dto.ContractId} not found");
        }

        // Create payment schedule entity
        var paymentSchedule = new PaymentSchedule
        {
            Id = Guid.NewGuid(),
            ContractId = dto.ContractId,
            ScheduleNumber = dto.ScheduleNumber,
            Description = dto.Description,
            Amount = dto.Amount,
            CurrencyCode = dto.CurrencyCode,
            DueDate = dto.DueDate.Kind == DateTimeKind.Utc ? dto.DueDate : DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc),
            PaymentType = dto.PaymentType,
            PaymentPercentage = dto.PaymentPercentage,
            Status = PaymentScheduleStatus.Pending,
            PaidAmount = 0,
            RemainingAmount = dto.Amount,
            Notes = dto.Notes,
            MilestoneDescription = dto.MilestoneDescription,
            IsAutomatic = dto.IsAutomatic,
            TriggerCondition = dto.TriggerCondition,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.PaymentSchedules.Add(paymentSchedule);
        await _context.SaveChangesAsync();

        return _mapper.Map<PaymentScheduleDto>(paymentSchedule);
    }

    public async Task<IEnumerable<PaymentScheduleDto>> GetPaymentSchedulesByContractAsync(Guid contractId)
    {
        var paymentSchedules = await _context.PaymentSchedules
            .Include(ps => ps.Contract)
            .Where(ps => ps.ContractId == contractId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<PaymentScheduleDto>>(paymentSchedules);
    }

    public async Task<PaymentScheduleDto> UpdatePaymentScheduleAsync(Guid id, UpdatePaymentScheduleDto dto)
    {
        var paymentSchedule = await _context.PaymentSchedules.FindAsync(id);
        if (paymentSchedule == null)
        {
            throw new ArgumentException($"Payment schedule with ID {id} not found");
        }

        // Update properties
        if (!string.IsNullOrEmpty(dto.ScheduleNumber))
            paymentSchedule.ScheduleNumber = dto.ScheduleNumber;
        if (!string.IsNullOrEmpty(dto.Description))
            paymentSchedule.Description = dto.Description;
        if (dto.Amount.HasValue)
            paymentSchedule.Amount = dto.Amount.Value;
        if (!string.IsNullOrEmpty(dto.CurrencyCode))
            paymentSchedule.CurrencyCode = dto.CurrencyCode;
        if (dto.DueDate.HasValue)
            paymentSchedule.DueDate = dto.DueDate.Value.Kind == DateTimeKind.Utc ? dto.DueDate.Value : DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc);
        if (dto.PaymentType.HasValue)
            paymentSchedule.PaymentType = dto.PaymentType.Value;
        if (dto.PaymentPercentage.HasValue)
            paymentSchedule.PaymentPercentage = dto.PaymentPercentage.Value;
        if (!string.IsNullOrEmpty(dto.Notes))
            paymentSchedule.Notes = dto.Notes;
        if (!string.IsNullOrEmpty(dto.MilestoneDescription))
            paymentSchedule.MilestoneDescription = dto.MilestoneDescription;
        if (dto.IsAutomatic.HasValue)
            paymentSchedule.IsAutomatic = dto.IsAutomatic.Value;
        if (!string.IsNullOrEmpty(dto.TriggerCondition))
            paymentSchedule.TriggerCondition = dto.TriggerCondition;

        // Recalculate remaining amount
        paymentSchedule.RemainingAmount = paymentSchedule.Amount - paymentSchedule.PaidAmount;
        paymentSchedule.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<PaymentScheduleDto>(paymentSchedule);
    }

    public async Task<bool> DeletePaymentScheduleAsync(Guid id)
    {
        var paymentSchedule = await _context.PaymentSchedules.FindAsync(id);
        if (paymentSchedule == null)
        {
            return false;
        }

        _context.PaymentSchedules.Remove(paymentSchedule);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CreateAdvancePaymentAsync(Guid contractId, decimal percentage)
    {
        var contract = await _context.Contracts.FindAsync(contractId);
        if (contract == null)
        {
            throw new ArgumentException($"Contract with ID {contractId} not found");
        }

        var advanceAmount = contract.Amount * (percentage / 100);

        var paymentSchedule = new PaymentSchedule
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            ScheduleNumber = $"ADV-{contract.ContractNumber}-{DateTime.UtcNow:yyyyMMdd}",
            Description = $"دفعة مقدمة {percentage}% عند توقيع العقد",
            Amount = advanceAmount,
            CurrencyCode = contract.CurrencyCode,
            DueDate = DateTime.UtcNow.AddDays(30), // 30 days from now
            PaymentType = PaymentType.Advance,
            PaymentPercentage = (int)percentage,
            Status = PaymentScheduleStatus.Pending,
            PaidAmount = 0,
            RemainingAmount = advanceAmount,
            IsAutomatic = false,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.PaymentSchedules.Add(paymentSchedule);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CreatePaymentSchedulesForContractAsync(Guid contractId, List<PaymentScheduleTemplate> templates)
    {
        // This method is not implemented yet
        // It would create multiple payment schedules based on templates
        return await Task.FromResult(false);
    }

    public async Task<ContractFinancialSummaryDto> GetContractFinancialSummaryAsync(Guid contractId)
    {
        var contract = await _context.Contracts
            .Include(c => c.Invoices)
            .Include(c => c.PaymentSchedules)
            .FirstOrDefaultAsync(c => c.Id == contractId);

        if (contract == null)
        {
            throw new ArgumentException($"Contract with ID {contractId} not found");
        }

        var totalInvoiced = contract.Invoices.Sum(i => i.TotalAmount);
        var totalPaid = contract.Invoices.Sum(i => i.PaidAmount);
        var totalRemaining = contract.Invoices.Sum(i => i.RemainingAmount);

        var advancePayment = contract.PaymentSchedules
            .FirstOrDefault(ps => ps.PaymentType == PaymentType.Advance);

        var nextPayment = contract.PaymentSchedules
            .Where(ps => ps.Status == PaymentScheduleStatus.Pending || ps.Status == PaymentScheduleStatus.Due)
            .OrderBy(ps => ps.DueDate)
            .FirstOrDefault();

        var paymentProgressPercentage = contract.Amount > 0 ? (totalPaid / contract.Amount) * 100 : 0;

        return new ContractFinancialSummaryDto
        {
            ContractId = contractId,
            ContractNumber = contract.ContractNumber,
            ContractAmount = contract.Amount,
            CurrencyCode = contract.CurrencyCode,
            TotalInvoiced = totalInvoiced,
            TotalPaid = totalPaid,
            TotalRemaining = totalRemaining,
            PaymentProgressPercentage = paymentProgressPercentage,
            AdvancePaymentAmount = advancePayment?.Amount ?? 0,
            AdvancePaymentPercentage = advancePayment?.PaymentPercentage ?? 0,
            NextPaymentAmount = nextPayment?.Amount ?? 0,
            NextPaymentDueDate = nextPayment?.DueDate,
            PaymentStatus = totalRemaining <= 0 ? "Completed" : 
                          totalPaid > 0 ? "In Progress" : "Pending"
        };
    }

    public async Task<FinancialReportDto> GetFinancialReportAsync(FinancialReportRequest request)
    {
        // This is a simplified implementation
        // In a real application, you would implement complex reporting logic here
        
        // Get basic statistics
        var totalInvoices = await _context.Invoices
            .Where(i => i.CreatedAtUtc >= request.StartDate && i.CreatedAtUtc <= request.EndDate)
            .CountAsync();
            
        var paidInvoices = await _context.Invoices
            .Where(i => i.CreatedAtUtc >= request.StartDate && i.CreatedAtUtc <= request.EndDate && 
                       i.Status == InvoiceStatus.Paid)
            .CountAsync();
            
        var overdueInvoices = await _context.Invoices
            .Where(i => i.CreatedAtUtc >= request.StartDate && i.CreatedAtUtc <= request.EndDate && 
                       i.Status == InvoiceStatus.Overdue)
            .CountAsync();
            
        var totalRevenue = await _context.Invoices
            .Where(i => i.CreatedAtUtc >= request.StartDate && i.CreatedAtUtc <= request.EndDate && 
                       i.Status == InvoiceStatus.Paid)
            .SumAsync(i => i.TotalAmount);
            
        var totalExpenses = await _context.Payments
            .Where(p => p.PaymentDate >= request.StartDate && p.PaymentDate <= request.EndDate)
            .SumAsync(p => p.Amount);
            
        var overdueAmount = await _context.PaymentSchedules
            .Where(ps => ps.DueDate < DateTime.UtcNow && 
                        (ps.Status == PaymentScheduleStatus.Pending || ps.Status == PaymentScheduleStatus.Due))
            .SumAsync(ps => ps.Amount);
        
        return new FinancialReportDto
        {
            ReportId = Guid.NewGuid(),
            ReportName = request.ReportName,
            GeneratedAt = DateTime.UtcNow,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalRevenue = totalRevenue,
            TotalInvoices = totalInvoices,
            TotalPayments = paidInvoices,
            OverduePayments = overdueInvoices,
            Items = new List<FinancialReportItemDto>(),
            Charts = new List<FinancialReportChartDto>()
        };
    }

    public async Task<IEnumerable<OverduePaymentDto>> GetOverduePaymentsAsync()
    {
        var overduePayments = await _context.PaymentSchedules
            .Include(ps => ps.Contract)
            .Where(ps => ps.DueDate < DateTime.UtcNow && 
                        (ps.Status == PaymentScheduleStatus.Pending || ps.Status == PaymentScheduleStatus.Due))
            .Select(ps => new OverduePaymentDto
            {
                Id = ps.Id,
                ContractId = ps.ContractId,
                ContractNumber = ps.Contract.ContractNumber,
                ScheduleNumber = ps.ScheduleNumber,
                Amount = ps.Amount,
                CurrencyCode = ps.CurrencyCode,
                DueDate = ps.DueDate,
                DaysOverdue = (int)(DateTime.UtcNow - ps.DueDate).TotalDays,
                Description = ps.Description
            })
            .ToListAsync();

        return overduePayments;
    }

    public async Task<PaymentAnalyticsDto> GetPaymentAnalyticsAsync(DateTime startDate, DateTime endDate)
    {
        // This is a simplified implementation
        // In a real application, you would implement complex analytics logic here
        return new PaymentAnalyticsDto
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalPayments = 0,
            TotalAmount = 0,
            AveragePaymentAmount = 0,
            PaymentMethodBreakdown = new Dictionary<string, int>(),
            MonthlyTrends = new Dictionary<string, decimal>()
        };
    }
}
