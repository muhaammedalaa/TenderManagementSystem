using TMS.Application.DTOs.Report;

namespace TMS.Application.Interfaces
{
    public interface IReportService
    {
        // Report Generation
        Task<object> GenerateTenderSummaryReportAsync(TenderReportRequest request);
        Task<object> GenerateFinancialReportAsync(FinancialReportRequest request);
        Task<object> GenerateSupplierPerformanceReportAsync(SupplierReportRequest request);
        Task<object> GenerateContractStatusReportAsync(ContractReportRequest request);
        Task<object> GenerateDashboardReportAsync(DashboardReportRequest request);

        // Export Functions
        Task<byte[]> ExportReportAsPdfAsync(ExportReportRequest request);
        Task<byte[]> ExportReportAsExcelAsync(ExportReportRequest request);

        // Report Management
        Task<List<ReportTemplateDto>> GetReportTemplatesAsync();
        Task<object> GetReportHistoryAsync(int page, int pageSize);
        
        // Scheduling
        Task<object> ScheduleReportAsync(ScheduleReportRequest request);
        Task<List<ScheduledReportDto>> GetScheduledReportsAsync();
        Task<ScheduledReportDto> GetScheduledReportByIdAsync(Guid id);
        Task<ScheduledReportDto> UpdateScheduledReportAsync(Guid id, ScheduleReportRequest request);
        Task<bool> DeleteScheduledReportAsync(Guid id);
        Task CancelScheduledReportAsync(int id);
    }
}
