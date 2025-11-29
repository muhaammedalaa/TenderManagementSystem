using TMS.Application.DTOs.Financial;
using TMS.Application.DTOs.Report;
using TMS.Application.DTOs.Common;

namespace TMS.Application.Interfaces;

public interface IFinancialService
{
    // Invoice Management
    Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto dto);
    Task<InvoiceDto> GetInvoiceAsync(Guid id);
    Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync();
    Task<IEnumerable<InvoiceDto>> GetInvoicesByContractAsync(Guid contractId);
    Task<PagedResultDto<InvoiceDto>> GetInvoicesWithPaginationAsync(SearchFilterDto filter);
    Task<InvoiceDto> UpdateInvoiceAsync(Guid id, UpdateInvoiceDto dto);
    Task<bool> DeleteInvoiceAsync(Guid id);
    
    // Payment Management
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto);
    Task<PaymentDto> GetPaymentAsync(Guid id);
    Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync();
    Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(Guid invoiceId);
    Task<PagedResultDto<PaymentDto>> GetPaymentsWithPaginationAsync(SearchFilterDto filter);
    Task<PaymentDto> UpdatePaymentAsync(Guid id, UpdatePaymentDto dto);
    Task<bool> DeletePaymentAsync(Guid id);
    Task<bool> ConfirmPaymentAsync(Guid id, ConfirmPaymentDto dto);
    
    // Payment Schedule Management
    Task<PaymentScheduleDto> CreatePaymentScheduleAsync(CreatePaymentScheduleDto dto);
    Task<PaymentScheduleDto> GetPaymentScheduleAsync(Guid id);
    Task<IEnumerable<PaymentScheduleDto>> GetPaymentSchedulesByContractAsync(Guid contractId);
    Task<PaymentScheduleDto> UpdatePaymentScheduleAsync(Guid id, UpdatePaymentScheduleDto dto);
    Task<bool> DeletePaymentScheduleAsync(Guid id);
    
    // Contract Financial Operations
    Task<bool> CreateAdvancePaymentAsync(Guid contractId, decimal percentage = 25);
    Task<ContractFinancialSummaryDto> GetContractFinancialSummaryAsync(Guid contractId);
    
    // Financial Reports
    Task<FinancialReportDto> GetFinancialReportAsync(FinancialReportRequest request);
    Task<IEnumerable<OverduePaymentDto>> GetOverduePaymentsAsync();
    Task<PaymentAnalyticsDto> GetPaymentAnalyticsAsync(DateTime startDate, DateTime endDate);
}

