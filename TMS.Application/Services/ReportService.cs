using System.Text;
using TMS.Application.DTOs.Report;
using TMS.Application.Interfaces;

namespace TMS.Application.Services
{
    public class ReportService : IReportService
    {
        public async Task<object> GenerateTenderSummaryReportAsync(TenderReportRequest request)
        {
            // Mock data for demonstration - will be replaced with real data
            return await Task.FromResult(new
            {
                TotalTenders = 25,
                OpenTenders = 8,
                ClosedTenders = 17,
                TotalValue = 1500000.00,
                Currency = request.Currency ?? "USD",
                AverageBidCount = 4.2,
                TopSuppliers = new[]
                {
                    new { Name = "ABC Construction", BidCount = 12, WinRate = 0.75 },
                    new { Name = "XYZ Engineering", BidCount = 8, WinRate = 0.60 },
                    new { Name = "DEF Services", BidCount = 15, WinRate = 0.40 }
                },
                TendersByStatus = new[]
                {
                    new { Status = "Open", Count = 8 },
                    new { Status = "Closed", Count = 17 }
                },
                TendersByMonth = new[]
                {
                    new { Month = "January", Count = 3 },
                    new { Month = "February", Count = 5 },
                    new { Month = "March", Count = 7 },
                    new { Month = "April", Count = 4 },
                    new { Month = "May", Count = 6 }
                }
            });
        }

        public async Task<object> GenerateFinancialReportAsync(FinancialReportRequest request)
        {
            return await Task.FromResult(new
            {
                TotalRevenue = 2500000.00,
                TotalExpenses = 1800000.00,
                NetProfit = 700000.00,
                ProfitMargin = 0.28,
                Currency = request.Currency ?? "USD",
                RevenueByMonth = new[]
                {
                    new { Month = "January", Revenue = 400000.00 },
                    new { Month = "February", Revenue = 450000.00 },
                    new { Month = "March", Revenue = 500000.00 },
                    new { Month = "April", Revenue = 480000.00 },
                    new { Month = "May", Revenue = 520000.00 },
                    new { Month = "June", Revenue = 550000.00 }
                },
                ExpenseCategories = new[]
                {
                    new { Category = "Materials", Amount = 800000.00, Percentage = 44.4 },
                    new { Category = "Labor", Amount = 600000.00, Percentage = 33.3 },
                    new { Category = "Equipment", Amount = 250000.00, Percentage = 13.9 },
                    new { Category = "Overhead", Amount = 150000.00, Percentage = 8.4 }
                }
            });
        }

        public async Task<object> GenerateSupplierPerformanceReportAsync(SupplierReportRequest request)
        {
            return await Task.FromResult(new
            {
                TotalSuppliers = 45,
                ActiveSuppliers = 38,
                InactiveSuppliers = 7,
                AverageRating = 4.2,
                TopPerformers = new[]
                {
                    new { Name = "ABC Construction", Rating = 4.8, Projects = 15, OnTimeDelivery = 0.95 },
                    new { Name = "XYZ Engineering", Rating = 4.6, Projects = 12, OnTimeDelivery = 0.92 },
                    new { Name = "DEF Services", Rating = 4.4, Projects = 18, OnTimeDelivery = 0.88 }
                },
                PerformanceMetrics = new[]
                {
                    new { Metric = "On-Time Delivery", Average = 0.89 },
                    new { Metric = "Quality Rating", Average = 4.1 },
                    new { Metric = "Response Time (hours)", Average = 4.5 },
                    new { Metric = "Customer Satisfaction", Average = 0.87 }
                },
                SuppliersByCategory = new[]
                {
                    new { Category = "Construction", Count = 15 },
                    new { Category = "Engineering", Count = 12 },
                    new { Category = "Services", Count = 18 }
                }
            });
        }

        public async Task<object> GenerateContractStatusReportAsync(ContractReportRequest request)
        {
            return await Task.FromResult(new
            {
                TotalContracts = 32,
                ActiveContracts = 18,
                CompletedContracts = 12,
                PendingContracts = 2,
                TotalValue = 3200000.00,
                Currency = request.Currency ?? "USD",
                ContractsByStatus = new[]
                {
                    new { Status = "Active", Count = 18, Value = 1800000.00 },
                    new { Status = "Completed", Count = 12, Value = 1200000.00 },
                    new { Status = "Pending", Count = 2, Value = 200000.00 }
                },
                ContractsByType = new[]
                {
                    new { Type = "Supply", Count = 15, Value = 1500000.00 },
                    new { Type = "Service", Count = 12, Value = 1200000.00 },
                    new { Type = "Construction", Count = 5, Value = 500000.00 }
                },
                UpcomingRenewals = new[]
                {
                    new { ContractId = "C-2024-001", Supplier = "ABC Construction", RenewalDate = "2024-12-15" },
                    new { ContractId = "C-2024-002", Supplier = "XYZ Engineering", RenewalDate = "2024-12-20" }
                }
            });
        }

        public async Task<object> GenerateDashboardReportAsync(DashboardReportRequest request)
        {
            return await Task.FromResult(new
            {
                KPIs = new
                {
                    TotalTenders = 25,
                    ActiveTenders = 8,
                    TotalValue = 1500000.00,
                    AverageBidCount = 4.2,
                    TopSupplier = "ABC Construction",
                    CompletionRate = 0.85
                },
                Charts = new
                {
                    TendersByMonth = new[]
                    {
                        new { Month = "Jan", Count = 3 },
                        new { Month = "Feb", Count = 5 },
                        new { Month = "Mar", Count = 7 },
                        new { Month = "Apr", Count = 4 },
                        new { Month = "May", Count = 6 }
                    },
                    TendersByStatus = new[]
                    {
                        new { Status = "Open", Count = 8 },
                        new { Status = "Closed", Count = 17 }
                    },
                    TopSuppliers = new[]
                    {
                        new { Name = "ABC Construction", Value = 450000.00 },
                        new { Name = "XYZ Engineering", Value = 380000.00 },
                        new { Name = "DEF Services", Value = 320000.00 }
                    }
                }
            });
        }

        public async Task<byte[]> ExportReportAsPdfAsync(ExportReportRequest request)
        {
            try
            {
                var reportData = request.ReportData;
                var reportType = request.ReportType?.ToUpper() ?? "UNKNOWN";
                
                var content = new StringBuilder();
                
                // Header
                content.AppendLine("╔══════════════════════════════════════════════════════════════════════════════╗");
                content.AppendLine("║                           TMS MANAGEMENT SYSTEM                              ║");
                content.AppendLine("║                              REPORT EXPORT                                   ║");
                content.AppendLine("╚══════════════════════════════════════════════════════════════════════════════╝");
                content.AppendLine();
                
                // Report Info
                content.AppendLine("┌─ REPORT INFORMATION ──────────────────────────────────────────────────────────┐");
                content.AppendLine($"│ Report Name: {request.ReportName?.PadRight(60)} │");
                content.AppendLine($"│ Report Type: {reportType.PadRight(60)} │");
                content.AppendLine($"│ Generated By: {request.GeneratedBy?.PadRight(58)} │");
                content.AppendLine($"│ Generated At: {(request.GeneratedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")).PadRight(58)} │");
                content.AppendLine("└─────────────────────────────────────────────────────────────────────────────────┘");
                content.AppendLine();
                
                // Report Content based on type
                content.AppendLine("┌─ REPORT CONTENT ──────────────────────────────────────────────────────────────┐");
                
                if (reportType.Contains("TENDER"))
                {
                    content.AppendLine(FormatTenderReport(reportData));
                }
                else if (reportType.Contains("FINANCIAL"))
                {
                    content.AppendLine(FormatFinancialReport(reportData));
                }
                else if (reportType.Contains("SUPPLIER"))
                {
                    content.AppendLine(FormatSupplierReport(reportData));
                }
                else if (reportType.Contains("CONTRACT"))
                {
                    content.AppendLine(FormatContractReport(reportData));
                }
                else if (reportType.Contains("DASHBOARD"))
                {
                    content.AppendLine(FormatDashboardReport(reportData));
                }
                else
                {
                    content.AppendLine("│ Raw Data:");
                    var jsonData = System.Text.Json.JsonSerializer.Serialize(reportData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                    foreach (var line in jsonData.Split('\n'))
                    {
                        content.AppendLine($"│ {line.PadRight(80)} │");
                    }
                }
                
                content.AppendLine("└─────────────────────────────────────────────────────────────────────────────────┘");
                content.AppendLine();
                
                // Footer
                content.AppendLine("┌─ FOOTER ──────────────────────────────────────────────────────────────────────┐");
                content.AppendLine("│ Generated by TMS Reports System                                              │");
                content.AppendLine("│ For technical support, contact: support@tms.com                             │");
                content.AppendLine($"│ Report ID: {Guid.NewGuid().ToString().Substring(0, 8).ToUpper().PadRight(60)} │");
                content.AppendLine("└─────────────────────────────────────────────────────────────────────────────────┘");

                var bytes = System.Text.Encoding.UTF8.GetBytes(content.ToString());
                return await Task.FromResult(bytes);
            }
            catch (Exception ex)
            {
                throw new Exception("Error generating PDF", ex);
            }
        }

        public async Task<byte[]> ExportReportAsExcelAsync(ExportReportRequest request)
        {
            try
            {
                var reportData = request.ReportData;
                var reportType = request.ReportType?.ToUpper() ?? "UNKNOWN";
                
                var csv = new StringBuilder();
                
                // Header
                csv.AppendLine("TMS MANAGEMENT SYSTEM - REPORT EXPORT");
                csv.AppendLine("=" + new string('=', 60));
                csv.AppendLine();
                
                // Report Info
                csv.AppendLine("REPORT INFORMATION");
                csv.AppendLine("-" + new string('-', 30));
                csv.AppendLine($"Report Name,{request.ReportName}");
                csv.AppendLine($"Report Type,{reportType}");
                csv.AppendLine($"Generated By,{request.GeneratedBy}");
                csv.AppendLine($"Generated At,{request.GeneratedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")}");
                csv.AppendLine();
                
                // Report Content based on type
                csv.AppendLine("REPORT DATA");
                csv.AppendLine("-" + new string('-', 30));
                
                if (reportType.Contains("TENDER"))
                {
                    csv.AppendLine(FormatTenderReportCSV(reportData));
                }
                else if (reportType.Contains("FINANCIAL"))
                {
                    csv.AppendLine(FormatFinancialReportCSV(reportData));
                }
                else if (reportType.Contains("SUPPLIER"))
                {
                    csv.AppendLine(FormatSupplierReportCSV(reportData));
                }
                else if (reportType.Contains("CONTRACT"))
                {
                    csv.AppendLine(FormatContractReportCSV(reportData));
                }
                else if (reportType.Contains("DASHBOARD"))
                {
                    csv.AppendLine(FormatDashboardReportCSV(reportData));
                }
                else
                {
                    csv.AppendLine("Raw Data,");
                    var jsonData = System.Text.Json.JsonSerializer.Serialize(reportData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                    foreach (var line in jsonData.Split('\n'))
                    {
                        csv.AppendLine($"\"{line.Replace("\"", "\"\"")}\"");
                    }
                }
                
                csv.AppendLine();
                csv.AppendLine("FOOTER");
                csv.AppendLine("-" + new string('-', 30));
                csv.AppendLine("Generated by,TMS Reports System");
                csv.AppendLine("Support Email,support@tms.com");
                csv.AppendLine($"Report ID,{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}");

                var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
                return await Task.FromResult(bytes);
            }
            catch (Exception ex)
            {
                throw new Exception("Error generating Excel", ex);
            }
        }

        public async Task<object> ScheduleReportAsync(ScheduleReportRequest request)
        {
            return await Task.FromResult(new ScheduledReportDto
            {
                Id = 1,
                ReportName = request.ReportType + " Report",
                ReportType = request.ReportType,
                ScheduleType = request.ScheduleType,
                Recipients = request.Recipients?.ToList() ?? new List<string>(),
                ExportFormats = request.ExportFormats?.ToList() ?? new List<string>(),
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            });
        }

        public async Task<List<ReportTemplateDto>> GetReportTemplatesAsync()
        {
            return await Task.FromResult(new List<ReportTemplateDto>
            {
                new ReportTemplateDto
                {
                    Id = 1,
                    Name = "Tender Summary Report",
                    Description = "Comprehensive overview of all tenders",
                    Category = "Tenders",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new ReportTemplateDto
                {
                    Id = 2,
                    Name = "Financial Report",
                    Description = "Financial performance and metrics",
                    Category = "Financial",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new ReportTemplateDto
                {
                    Id = 3,
                    Name = "Supplier Performance Report",
                    Description = "Supplier evaluation and performance metrics",
                    Category = "Suppliers",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                }
            });
        }

        public async Task<List<ScheduledReportDto>> GetScheduledReportsAsync()
        {
            return await Task.FromResult(new List<ScheduledReportDto>
            {
                new ScheduledReportDto
                {
                    Id = 1,
                    ReportName = "Tender Summary Report",
                    ReportType = "Tender Summary",
                    ScheduleType = "Weekly",
                    Recipients = new List<string> { "manager@company.com", "admin@company.com" },
                    ExportFormats = new List<string> { "PDF", "Excel" },
                    Description = "Weekly tender summary report",
                    IsActive = true,
                    NextRun = DateTime.UtcNow.AddDays(7),
                    CreatedAt = DateTime.UtcNow.AddDays(-14)
                },
                new ScheduledReportDto
                {
                    Id = 2,
                    ReportName = "Financial Report",
                    ReportType = "Financial Report",
                    ScheduleType = "Monthly",
                    Recipients = new List<string> { "finance@company.com" },
                    ExportFormats = new List<string> { "Excel" },
                    Description = "Monthly financial performance report",
                    IsActive = true,
                    NextRun = DateTime.UtcNow.AddDays(15),
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                }
            });
        }

        public async Task<ScheduledReportDto> GetScheduledReportByIdAsync(Guid id)
        {
            var reports = await GetScheduledReportsAsync();
            return reports.FirstOrDefault(r => r.Id == 1) ?? new ScheduledReportDto();
        }

        public async Task<ScheduledReportDto> UpdateScheduledReportAsync(Guid id, ScheduleReportRequest request)
        {
            return await Task.FromResult(new ScheduledReportDto
            {
                Id = 1,
                ReportName = request.ReportType + " Report",
                ReportType = request.ReportType,
                ScheduleType = request.ScheduleType,
                Recipients = request.Recipients?.ToList() ?? new List<string>(),
                ExportFormats = request.ExportFormats?.ToList() ?? new List<string>(),
                Description = request.Description,
                IsActive = true,
                NextRun = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            });
        }

        public async Task<bool> DeleteScheduledReportAsync(Guid id)
        {
            return await Task.FromResult(true);
        }

        public async Task<object> GetReportHistoryAsync(int page, int pageSize)
        {
            return await Task.FromResult(new
            {
                Reports = new[]
                {
                    new { Id = Guid.NewGuid(), Name = "Tender Summary Report", GeneratedAt = DateTime.UtcNow.AddDays(-1), Format = "PDF", Size = "2.5 MB" },
                    new { Id = Guid.NewGuid(), Name = "Financial Report", GeneratedAt = DateTime.UtcNow.AddDays(-2), Format = "Excel", Size = "1.8 MB" },
                    new { Id = Guid.NewGuid(), Name = "Supplier Performance Report", GeneratedAt = DateTime.UtcNow.AddDays(-3), Format = "PDF", Size = "3.2 MB" }
                },
                TotalCount = 15,
                Page = page,
                PageSize = pageSize
            });
        }

        public async Task CancelScheduledReportAsync(int id)
        {
            await Task.CompletedTask;
        }

        private string FormatTenderReport(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("│ TENDER SUMMARY REPORT");
            content.AppendLine("├─────────────────────────────────────────────────────────────────────────────────┤");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"│ Total Tenders: {data?.GetProperty("TotalTenders")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Open Tenders: {data?.GetProperty("OpenTenders")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Closed Tenders: {data?.GetProperty("ClosedTenders")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Total Value: {data?.GetProperty("TotalValue")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"│ Currency: {data?.GetProperty("Currency")?.GetString() ?? "USD"}");
                content.AppendLine($"│ Average Bid Count: {data?.GetProperty("AverageBidCount")?.GetDouble() ?? 0:F1}");
            }
            catch
            {
                content.AppendLine("│ Unable to parse tender data");
            }
            
            return content.ToString();
        }

        private string FormatFinancialReport(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("│ FINANCIAL PERFORMANCE REPORT");
            content.AppendLine("├─────────────────────────────────────────────────────────────────────────────────┤");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"│ Total Revenue: {data?.GetProperty("TotalRevenue")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"│ Total Expenses: {data?.GetProperty("TotalExpenses")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"│ Net Profit: {data?.GetProperty("NetProfit")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"│ Profit Margin: {(data?.GetProperty("ProfitMargin")?.GetDouble() ?? 0):P2}");
                content.AppendLine($"│ Currency: {data?.GetProperty("Currency")?.GetString() ?? "USD"}");
            }
            catch
            {
                content.AppendLine("│ Unable to parse financial data");
            }
            
            return content.ToString();
        }

        private string FormatSupplierReport(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("│ SUPPLIER PERFORMANCE REPORT");
            content.AppendLine("├─────────────────────────────────────────────────────────────────────────────────┤");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"│ Total Suppliers: {data?.GetProperty("TotalSuppliers")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Active Suppliers: {data?.GetProperty("ActiveSuppliers")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Inactive Suppliers: {data?.GetProperty("InactiveSuppliers")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Average Rating: {data?.GetProperty("AverageRating")?.GetDouble() ?? 0:F1}/5.0");
            }
            catch
            {
                content.AppendLine("│ Unable to parse supplier data");
            }
            
            return content.ToString();
        }

        private string FormatContractReport(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("│ CONTRACT STATUS REPORT");
            content.AppendLine("├─────────────────────────────────────────────────────────────────────────────────┤");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"│ Total Contracts: {data?.GetProperty("TotalContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Active Contracts: {data?.GetProperty("ActiveContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Completed Contracts: {data?.GetProperty("CompletedContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Pending Contracts: {data?.GetProperty("PendingContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"│ Total Value: {data?.GetProperty("TotalValue")?.GetDecimal() ?? 0:C}");
            }
            catch
            {
                content.AppendLine("│ Unable to parse contract data");
            }
            
            return content.ToString();
        }

        private string FormatDashboardReport(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("│ DASHBOARD SUMMARY REPORT");
            content.AppendLine("├─────────────────────────────────────────────────────────────────────────────────┤");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                var kpis = data?.GetProperty("KPIs");
                if (kpis.HasValue)
                {
                    content.AppendLine($"│ Total Tenders: {kpis.Value.GetProperty("TotalTenders")?.GetInt32() ?? 0}");
                    content.AppendLine($"│ Active Tenders: {kpis.Value.GetProperty("ActiveTenders")?.GetInt32() ?? 0}");
                    content.AppendLine($"│ Total Value: {kpis.Value.GetProperty("TotalValue")?.GetDecimal() ?? 0:C}");
                    content.AppendLine($"│ Average Bid Count: {kpis.Value.GetProperty("AverageBidCount")?.GetDouble() ?? 0:F1}");
                    content.AppendLine($"│ Top Supplier: {kpis.Value.GetProperty("TopSupplier")?.GetString() ?? "N/A"}");
                    content.AppendLine($"│ Completion Rate: {(kpis.Value.GetProperty("CompletionRate")?.GetDouble() ?? 0):P2}");
                }
            }
            catch
            {
                content.AppendLine("│ Unable to parse dashboard data");
            }
            
            return content.ToString();
        }

        private string FormatTenderReportCSV(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("Metric,Value");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"Total Tenders,{data?.GetProperty("TotalTenders")?.GetInt32() ?? 0}");
                content.AppendLine($"Open Tenders,{data?.GetProperty("OpenTenders")?.GetInt32() ?? 0}");
                content.AppendLine($"Closed Tenders,{data?.GetProperty("ClosedTenders")?.GetInt32() ?? 0}");
                content.AppendLine($"Total Value,{data?.GetProperty("TotalValue")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"Currency,{data?.GetProperty("Currency")?.GetString() ?? "USD"}");
                content.AppendLine($"Average Bid Count,{data?.GetProperty("AverageBidCount")?.GetDouble() ?? 0:F1}");
            }
            catch
            {
                content.AppendLine("Error,Unable to parse tender data");
            }
            
            return content.ToString();
        }

        private string FormatFinancialReportCSV(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("Metric,Value");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"Total Revenue,{data?.GetProperty("TotalRevenue")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"Total Expenses,{data?.GetProperty("TotalExpenses")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"Net Profit,{data?.GetProperty("NetProfit")?.GetDecimal() ?? 0:C}");
                content.AppendLine($"Profit Margin,{(data?.GetProperty("ProfitMargin")?.GetDouble() ?? 0):P2}");
                content.AppendLine($"Currency,{data?.GetProperty("Currency")?.GetString() ?? "USD"}");
            }
            catch
            {
                content.AppendLine("Error,Unable to parse financial data");
            }
            
            return content.ToString();
        }

        private string FormatSupplierReportCSV(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("Metric,Value");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"Total Suppliers,{data?.GetProperty("TotalSuppliers")?.GetInt32() ?? 0}");
                content.AppendLine($"Active Suppliers,{data?.GetProperty("ActiveSuppliers")?.GetInt32() ?? 0}");
                content.AppendLine($"Inactive Suppliers,{data?.GetProperty("InactiveSuppliers")?.GetInt32() ?? 0}");
                content.AppendLine($"Average Rating,{data?.GetProperty("AverageRating")?.GetDouble() ?? 0:F1}/5.0");
            }
            catch
            {
                content.AppendLine("Error,Unable to parse supplier data");
            }
            
            return content.ToString();
        }

        private string FormatContractReportCSV(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("Metric,Value");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                content.AppendLine($"Total Contracts,{data?.GetProperty("TotalContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"Active Contracts,{data?.GetProperty("ActiveContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"Completed Contracts,{data?.GetProperty("CompletedContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"Pending Contracts,{data?.GetProperty("PendingContracts")?.GetInt32() ?? 0}");
                content.AppendLine($"Total Value,{data?.GetProperty("TotalValue")?.GetDecimal() ?? 0:C}");
            }
            catch
            {
                content.AppendLine("Error,Unable to parse contract data");
            }
            
            return content.ToString();
        }

        private string FormatDashboardReportCSV(object reportData)
        {
            var content = new StringBuilder();
            content.AppendLine("Metric,Value");
            
            try
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportData.ToString() ?? "{}");
                var kpis = data?.GetProperty("KPIs");
                if (kpis.HasValue)
                {
                    content.AppendLine($"Total Tenders,{kpis.Value.GetProperty("TotalTenders")?.GetInt32() ?? 0}");
                    content.AppendLine($"Active Tenders,{kpis.Value.GetProperty("ActiveTenders")?.GetInt32() ?? 0}");
                    content.AppendLine($"Total Value,{kpis.Value.GetProperty("TotalValue")?.GetDecimal() ?? 0:C}");
                    content.AppendLine($"Average Bid Count,{kpis.Value.GetProperty("AverageBidCount")?.GetDouble() ?? 0:F1}");
                    content.AppendLine($"Top Supplier,{kpis.Value.GetProperty("TopSupplier")?.GetString() ?? "N/A"}");
                    content.AppendLine($"Completion Rate,{(kpis.Value.GetProperty("CompletionRate")?.GetDouble() ?? 0):P2}");
                }
            }
            catch
            {
                content.AppendLine("Error,Unable to parse dashboard data");
            }
            
            return content.ToString();
        }
    }
}
