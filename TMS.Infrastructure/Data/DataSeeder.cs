using Microsoft.EntityFrameworkCore;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Infrastructure.Data;
using BCrypt.Net;

namespace TMS.Infrastructure.Data;

public class DataSeeder
{
    private readonly TmsDbContext _context;

    public DataSeeder(TmsDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Ensure database is created
        await _context.Database.EnsureCreatedAsync();

        // Seed in order of dependencies
        await SeedRoles();
        await SeedUsers();
        await SeedCurrencies();
        await SeedEntities();
        await SeedAddresses();
        await SeedSuppliers();
        await SeedTenders();
        await SeedQuotations();
        await SeedAssignmentOrders();
        await SeedContracts();
        await SeedSupplyDeliveries();
        await SeedBankGuarantees();
        await SeedGovernmentGuarantees();
        await SeedSupportMatters();
        await SeedNotifications();
        await SeedOperationLogs();
        await SeedFiles();
    }

    private async Task SeedRoles()
    {
        if (await _context.Roles.AnyAsync()) return;

        var roles = new List<Role>
        {
            new() { Name = "Admin", Description = "System Administrator with full access" },
            new() { Name = "Manager", Description = "Project Manager with management access" },
            new() { Name = "User", Description = "Regular user with limited access" },
            new() { Name = "Supplier", Description = "External supplier user" },
            new() { Name = "Viewer", Description = "Read-only access user" }
        };

        _context.Roles.AddRange(roles);
        await _context.SaveChangesAsync();
    }

    private async Task SeedUsers()
    {
        if (await _context.Users.AnyAsync()) return;

        var users = new List<User>
        {
            new()
            {
                Username = "admin",
                Email = "admin@tms.com",
                FirstName = "System",
                LastName = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Phone = "+1-555-0101",
                IsActive = true
            },
            new()
            {
                Username = "manager1",
                Email = "manager1@tms.com",
                FirstName = "John",
                LastName = "Manager",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
                Phone = "+1-555-0102",
                IsActive = true
            },
            new()
            {
                Username = "user1",
                Email = "user1@tms.com",
                FirstName = "Jane",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"),
                Phone = "+1-555-0103",
                IsActive = true
            },
            new()
            {
                Username = "supplier1",
                Email = "supplier1@example.com",
                FirstName = "Bob",
                LastName = "Supplier",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Supplier123!"),
                Phone = "+1-555-0104",
                IsActive = true
            }
        };

        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();

        // Assign roles to users
        var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");
        var managerRole = await _context.Roles.FirstAsync(r => r.Name == "Manager");
        var userRole = await _context.Roles.FirstAsync(r => r.Name == "User");
        var supplierRole = await _context.Roles.FirstAsync(r => r.Name == "Supplier");

        var adminUser = await _context.Users.FirstAsync(u => u.Username == "admin");
        var managerUser = await _context.Users.FirstAsync(u => u.Username == "manager1");
        var regularUser = await _context.Users.FirstAsync(u => u.Username == "user1");
        var supplierUser = await _context.Users.FirstAsync(u => u.Username == "supplier1");

        var userRoles = new List<UserRole>
        {
            new() { UserId = adminUser.Id, RoleId = adminRole.Id },
            new() { UserId = managerUser.Id, RoleId = managerRole.Id },
            new() { UserId = regularUser.Id, RoleId = userRole.Id },
            new() { UserId = supplierUser.Id, RoleId = supplierRole.Id }
        };

        _context.UserRoles.AddRange(userRoles);
        await _context.SaveChangesAsync();
    }

    private async Task SeedCurrencies()
    {
        if (await _context.Currencies.AnyAsync()) return;

        var currencies = new List<Currency>
        {
            new() { Code = "USD", Name = "US Dollar", Symbol = "$", ExchangeRate = 1.0000m, DecimalPlaces = 2 },
            new() { Code = "EUR", Name = "Euro", Symbol = "€", ExchangeRate = 0.8500m, DecimalPlaces = 2 },
            new() { Code = "GBP", Name = "British Pound", Symbol = "£", ExchangeRate = 0.7300m, DecimalPlaces = 2 },
            new() { Code = "JPY", Name = "Japanese Yen", Symbol = "¥", ExchangeRate = 110.0000m, DecimalPlaces = 0 },
            new() { Code = "CAD", Name = "Canadian Dollar", Symbol = "C$", ExchangeRate = 1.2500m, DecimalPlaces = 2 },
            new() { Code = "AUD", Name = "Australian Dollar", Symbol = "A$", ExchangeRate = 1.3500m, DecimalPlaces = 2 }
        };

        _context.Currencies.AddRange(currencies);
        await _context.SaveChangesAsync();
    }

    private async Task SeedEntities()
    {
        if (await _context.Entities.AnyAsync()) return;

        var entities = new List<Entity>
        {
            new() { Name = "Ministry of Health", Code = "MOH", Description = "Government health ministry" },
            new() { Name = "Ministry of Education", Code = "MOE", Description = "Government education ministry" },
            new() { Name = "Ministry of Transportation", Code = "MOT", Description = "Government transportation ministry" },
            new() { Name = "City Council", Code = "CC", Description = "Local city council" },
            new() { Name = "University Hospital", Code = "UH", Description = "Public university hospital" },
            new() { Name = "Public School District", Code = "PSD", Description = "Local public school district" }
        };

        _context.Entities.AddRange(entities);
        await _context.SaveChangesAsync();
    }

    private async Task SeedAddresses()
    {
        if (await _context.Addresses.AnyAsync()) return;

        var entities = await _context.Entities.ToListAsync();
        var addresses = new List<Address>();

        foreach (var entity in entities)
        {
            addresses.Add(new Address
            {
                EntityId = entity.Id,
                AddressLine1 = $"{entity.Name} Building",
                AddressLine2 = "Suite 100",
                City = "Capital City",
                State = "State",
                PostalCode = "12345",
                Country = "United States",
                AddressType = AddressType.Billing,
                IsPrimary = true,
                Notes = $"Primary address for {entity.Name}"
            });
        }

        _context.Addresses.AddRange(addresses);
        await _context.SaveChangesAsync();
    }

    private async Task SeedSuppliers()
    {
        if (await _context.Suppliers.AnyAsync()) return;

        var entities = await _context.Entities.Take(3).ToListAsync();
        var addresses = await _context.Addresses.Take(3).ToListAsync();

        if (entities.Count < 3 || addresses.Count < 3)
        {
            throw new InvalidOperationException("Not enough entities or addresses to create suppliers. Ensure entities and addresses are seeded first.");
        }

        var suppliers = new List<Supplier>
        {
            new()
            {
                EntityId = entities[0].Id,
                PrimaryAddressId = addresses[0].Id,
                Name = "Tech Solutions Inc",
                Email = "contact@techsolutions.com",
                Phone = "+1-555-1001",
                Category = "Technology",
                TaxNumber = "TAX001",
                RegistrationNumber = "REG001",
                ContactPerson = "Alice Johnson",
                ContactPhone = "+1-555-1002",
                ContactEmail = "alice@techsolutions.com",
                FinancialCapacity = 1000000m,
                ExperienceYears = 10
            },
            new()
            {
                EntityId = entities[1].Id,
                PrimaryAddressId = addresses[1].Id,
                Name = "Construction Works Ltd",
                Email = "info@constructionworks.com",
                Phone = "+1-555-2001",
                Category = "Construction",
                TaxNumber = "TAX002",
                RegistrationNumber = "REG002",
                ContactPerson = "Bob Smith",
                ContactPhone = "+1-555-2002",
                ContactEmail = "bob@constructionworks.com",
                FinancialCapacity = 5000000m,
                ExperienceYears = 15
            },
            new()
            {
                EntityId = entities[2].Id,
                PrimaryAddressId = addresses[2].Id,
                Name = "Medical Supplies Co",
                Email = "sales@medsupplies.com",
                Phone = "+1-555-3001",
                Category = "Healthcare",
                TaxNumber = "TAX003",
                RegistrationNumber = "REG003",
                ContactPerson = "Carol Davis",
                ContactPhone = "+1-555-3002",
                ContactEmail = "carol@medsupplies.com",
                FinancialCapacity = 2000000m,
                ExperienceYears = 8
            }
        };

        _context.Suppliers.AddRange(suppliers);
        await _context.SaveChangesAsync();
    }

    private async Task SeedTenders()
    {
        if (await _context.Tenders.AnyAsync()) return;

        var entities = await _context.Entities.Take(3).ToListAsync();

        if (entities.Count < 3)
        {
            throw new InvalidOperationException("Not enough entities to create tenders. Ensure entities are seeded first.");
        }

        var tenders = new List<Tender>
        {
            new()
            {
                EntityId = entities[0].Id,
                Title = "IT Infrastructure Upgrade",
                Description = "Upgrade of computer systems and network infrastructure",
                ReferenceNumber = "TEN-2024-001",
                Category = "Technology",
                EstimatedBudget = 500000m,
                SubmissionDeadline = DateTime.UtcNow.AddDays(30),
                OpeningDate = DateTime.UtcNow.AddDays(35),
                Requirements = "Certified IT professionals, 5+ years experience",
                TermsConditions = "Standard government terms apply",
                AutoDetermineWinner = true,
                WinnerDeterminationMethod = WinnerDeterminationMethod.LowestBid,
                Status = TenderStatus.Open
            },
            new()
            {
                EntityId = entities[1].Id,
                Title = "School Building Construction",
                Description = "Construction of new elementary school building",
                ReferenceNumber = "TEN-2024-002",
                Category = "Construction",
                EstimatedBudget = 2000000m,
                SubmissionDeadline = DateTime.UtcNow.AddDays(45),
                OpeningDate = DateTime.UtcNow.AddDays(50),
                Requirements = "Licensed contractors, safety certifications required",
                TermsConditions = "Must comply with building codes",
                AutoDetermineWinner = false,
                WinnerDeterminationMethod = WinnerDeterminationMethod.HighestScore,
                Status = TenderStatus.Open
            },
            new()
            {
                EntityId = entities[2].Id,
                Title = "Medical Equipment Supply",
                Description = "Supply of medical equipment for hospital",
                ReferenceNumber = "TEN-2024-003",
                Category = "Healthcare",
                EstimatedBudget = 800000m,
                SubmissionDeadline = DateTime.UtcNow.AddDays(20),
                OpeningDate = DateTime.UtcNow.AddDays(25),
                Requirements = "FDA approved equipment, warranty required",
                TermsConditions = "Delivery within 60 days",
                AutoDetermineWinner = true,
                WinnerDeterminationMethod = WinnerDeterminationMethod.LowestBid,
                Status = TenderStatus.Open
            }
        };

        _context.Tenders.AddRange(tenders);
        await _context.SaveChangesAsync();
    }

    private async Task SeedQuotations()
    {
        if (await _context.Quotations.AnyAsync()) return;

        var tenders = await _context.Tenders.ToListAsync();
        var suppliers = await _context.Suppliers.ToListAsync();
        var currencies = await _context.Currencies.ToListAsync();

        if (tenders.Count < 3 || suppliers.Count < 3 || currencies.Count < 1)
        {
            throw new InvalidOperationException("Not enough tenders, suppliers, or currencies to create quotations. Ensure all dependencies are seeded first.");
        }

        var quotations = new List<Quotation>
        {
            new()
            {
                TenderId = tenders[0].Id,
                SupplierId = suppliers[0].Id,
                ReferenceNumber = "QUO-2024-001",
                Amount = 450000m,
                CurrencyCode = currencies[0].Code,
                ValidityPeriod = 90,
                DeliveryPeriod = 120,
                TechnicalScore = 85m,
                FinancialScore = 90m,
                TotalScore = 87.5m,
                Status = QuotationStatus.Submitted
            },
            new()
            {
                TenderId = tenders[0].Id,
                SupplierId = suppliers[1].Id,
                ReferenceNumber = "QUO-2024-002",
                Amount = 480000m,
                CurrencyCode = currencies[0].Code,
                ValidityPeriod = 90,
                DeliveryPeriod = 150,
                TechnicalScore = 80m,
                FinancialScore = 85m,
                TotalScore = 82.5m,
                Status = QuotationStatus.Submitted
            },
            new()
            {
                TenderId = tenders[1].Id,
                SupplierId = suppliers[1].Id,
                ReferenceNumber = "QUO-2024-003",
                Amount = 1900000m,
                CurrencyCode = currencies[0].Code,
                ValidityPeriod = 120,
                DeliveryPeriod = 365,
                TechnicalScore = 95m,
                FinancialScore = 88m,
                TotalScore = 91.5m,
                Status = QuotationStatus.Awarded
            },
            new()
            {
                TenderId = tenders[2].Id,
                SupplierId = suppliers[2].Id,
                ReferenceNumber = "QUO-2024-004",
                Amount = 750000m,
                CurrencyCode = currencies[0].Code,
                ValidityPeriod = 60,
                DeliveryPeriod = 45,
                TechnicalScore = 90m,
                FinancialScore = 95m,
                TotalScore = 92.5m,
                Status = QuotationStatus.Awarded
            }
        };

        _context.Quotations.AddRange(quotations);
        await _context.SaveChangesAsync();
    }

    private async Task SeedAssignmentOrders()
    {
        if (await _context.AssignmentOrders.AnyAsync()) return;

        var quotations = await _context.Quotations.Where(q => q.Status == QuotationStatus.Awarded).ToListAsync();
        var entities = await _context.Entities.Take(2).ToListAsync();
        var currencies = await _context.Currencies.ToListAsync();

        if (quotations.Count < 2 || entities.Count < 2 || currencies.Count < 1)
        {
            throw new InvalidOperationException("Not enough awarded quotations, entities, or currencies to create assignment orders. Ensure all dependencies are seeded first.");
        }

        var assignmentOrders = new List<AssignmentOrder>
        {
            new()
            {
                QuotationId = quotations[0].Id,
                EntityId = entities[0].Id,
                OrderNumber = "AO-2024-001",
                Amount = quotations[0].Amount,
                CurrencyCode = currencies[0].Code,
                OrderDate = DateTime.UtcNow.AddDays(-10),
                DeliveryDate = DateTime.UtcNow.AddDays(30),
                PaymentTerms = "30 days net",
                Notes = "Priority project - expedite delivery",
                Status = AssignmentOrderStatus.Confirmed
            },
            new()
            {
                QuotationId = quotations[1].Id,
                EntityId = entities[1].Id,
                OrderNumber = "AO-2024-002",
                Amount = quotations[1].Amount,
                CurrencyCode = currencies[0].Code,
                OrderDate = DateTime.UtcNow.AddDays(-5),
                DeliveryDate = DateTime.UtcNow.AddDays(25),
                PaymentTerms = "15 days net",
                Notes = "Standard delivery terms",
                Status = AssignmentOrderStatus.InProgress
            }
        };

        _context.AssignmentOrders.AddRange(assignmentOrders);
        await _context.SaveChangesAsync();
    }

    private async Task SeedContracts()
    {
        if (await _context.Contracts.AnyAsync()) return;

        var assignmentOrders = await _context.AssignmentOrders.ToListAsync();
        var currencies = await _context.Currencies.ToListAsync();

        if (assignmentOrders.Count < 2 || currencies.Count < 1)
        {
            throw new InvalidOperationException("Not enough assignment orders or currencies to create contracts. Ensure all dependencies are seeded first.");
        }

        var contracts = new List<Contract>
        {
            new()
            {
                AssignmentOrderId = assignmentOrders[0].Id,
                ContractNumber = "CON-2024-001",
                ContractType = ContractType.FixedPrice,
                Amount = assignmentOrders[0].Amount,
                CurrencyCode = currencies[0].Code,
                StartDate = DateTime.UtcNow.AddDays(-5),
                EndDate = DateTime.UtcNow.AddDays(25),
                PaymentTerms = "Monthly progress payments",
                DeliveryTerms = "FOB destination",
                WarrantyPeriod = 12,
                Status = ContractStatus.Active,
                Description = "IT Infrastructure Upgrade Contract"
            },
            new()
            {
                AssignmentOrderId = assignmentOrders[1].Id,
                ContractNumber = "CON-2024-002",
                ContractType = ContractType.TimeAndMaterials,
                Amount = assignmentOrders[1].Amount,
                CurrencyCode = currencies[0].Code,
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(20),
                PaymentTerms = "Weekly invoices",
                DeliveryTerms = "CIF destination",
                WarrantyPeriod = 24,
                Status = ContractStatus.Active,
                Description = "Medical Equipment Supply Contract"
            }
        };

        _context.Contracts.AddRange(contracts);
        await _context.SaveChangesAsync();
    }

    private async Task SeedSupplyDeliveries()
    {
        if (await _context.SupplyDeliveries.AnyAsync()) return;

        var contracts = await _context.Contracts.ToListAsync();

        if (contracts.Count < 2)
        {
            throw new InvalidOperationException("Not enough contracts to create supply deliveries. Ensure contracts are seeded first.");
        }

        var supplyDeliveries = new List<SupplyDelivery>
        {
            new()
            {
                ContractId = contracts[0].Id,
                DeliveryNumber = "DEL-2024-001",
                Quantity = 10,
                Unit = "pieces",
                UnitPrice = 5000m,
                TotalAmount = 50000m,
                DeliveryLocation = "Main Office - Server Room",
                DeliveryDate = DateTime.UtcNow.AddDays(15),
                Status = DeliveryStatus.Scheduled,
                Notes = "Server hardware delivery - Fragile equipment - handle with care"
            },
            new()
            {
                ContractId = contracts[1].Id,
                DeliveryNumber = "DEL-2024-002",
                Quantity = 5,
                Unit = "units",
                UnitPrice = 150000m,
                TotalAmount = 750000m,
                DeliveryLocation = "Hospital - Equipment Room",
                DeliveryDate = DateTime.UtcNow.AddDays(10),
                Status = DeliveryStatus.InTransit,
                Notes = "Medical equipment delivery - Temperature controlled transport required"
            }
        };

        _context.SupplyDeliveries.AddRange(supplyDeliveries);
        await _context.SaveChangesAsync();
    }

    private async Task SeedBankGuarantees()
    {
        if (await _context.BankGuarantees.AnyAsync()) return;

        var quotations = await _context.Quotations.Where(q => q.Status == QuotationStatus.Awarded).ToListAsync();
        var currencies = await _context.Currencies.ToListAsync();

        if (quotations.Count < 2 || currencies.Count < 1)
        {
            throw new InvalidOperationException("Not enough awarded quotations or currencies to create bank guarantees. Ensure all dependencies are seeded first.");
        }

        var bankGuarantees = new List<BankGuarantee>
        {
            new()
            {
                QuotationId = quotations[0].Id,
                GuaranteeNumber = "BG-2024-001",
                BankName = "First National Bank",
                BankBranch = "Main Branch",
                GuaranteeType = GuaranteeType.PerformanceBond,
                Amount = quotations[0].Amount * 0.1m, // 10% of contract value
                CurrencyCode = currencies[0].Code,
                IssueDate = DateTime.UtcNow.AddDays(-5),
                ExpiryDate = DateTime.UtcNow.AddDays(365),
                Status = GuaranteeStatus.Active,
                ProfitPercentage = 2.5m
            },
            new()
            {
                QuotationId = quotations[1].Id,
                GuaranteeNumber = "BG-2024-002",
                BankName = "City Bank",
                BankBranch = "Downtown Branch",
                GuaranteeType = GuaranteeType.AdvancePayment,
                Amount = quotations[1].Amount * 0.15m, // 15% of contract value
                CurrencyCode = currencies[0].Code,
                IssueDate = DateTime.UtcNow.AddDays(-3),
                ExpiryDate = DateTime.UtcNow.AddDays(180),
                Status = GuaranteeStatus.Active,
                ProfitPercentage = 3.0m
            }
        };

        _context.BankGuarantees.AddRange(bankGuarantees);
        await _context.SaveChangesAsync();
    }

    private async Task SeedGovernmentGuarantees()
    {
        if (await _context.GovernmentGuarantees.AnyAsync()) return;

        var quotations = await _context.Quotations.Where(q => q.Status == QuotationStatus.Awarded).ToListAsync();
        var currencies = await _context.Currencies.ToListAsync();

        if (quotations.Count < 1 || currencies.Count < 1)
        {
            throw new InvalidOperationException("Not enough awarded quotations or currencies to create government guarantees. Ensure all dependencies are seeded first.");
        }

        var governmentGuarantees = new List<GovernmentGuarantee>
        {
            new()
            {
                QuotationId = quotations[0].Id,
                GuaranteeNumber = "GG-2024-001",
                AuthorityName = "Ministry of Finance",
                AuthorityType = "Government Agency",
                GuaranteeType = GuaranteeType.PerformanceBond,
                Amount = quotations[0].Amount * 0.05m, // 5% of contract value
                CurrencyCode = currencies[0].Code,
                IssueDate = DateTime.UtcNow.AddDays(-4),
                ExpiryDate = DateTime.UtcNow.AddDays(730),
                Status = GuaranteeStatus.Active,
                ProfitPercentage = 1.5m
            }
        };

        _context.GovernmentGuarantees.AddRange(governmentGuarantees);
        await _context.SaveChangesAsync();
    }

    private async Task SeedSupportMatters()
    {
        if (await _context.SupportMatters.AnyAsync()) return;

        var entities = await _context.Entities.Take(2).ToListAsync();
        var users = await _context.Users.Take(2).ToListAsync();

        if (entities.Count < 2 || users.Count < 2)
        {
            throw new InvalidOperationException("Not enough entities or users to create support matters. Ensure all dependencies are seeded first.");
        }

        var supportMatters = new List<SupportMatter>
        {
            new()
            {
                EntityId = entities[0].Id,
                Title = "System Performance Issue",
                Category = "Technical Support",
                Priority = SupportPriority.High,
                Status = SupportStatus.Open,
                Description = "System running slowly during peak hours",
                TotalAmount = 5000m,
                ProfitPercentage = 15m,
                OpenedBy = users[0].Id
            },
            new()
            {
                EntityId = entities[1].Id,
                Title = "Training Request",
                Category = "Training",
                Priority = SupportPriority.Normal,
                Status = SupportStatus.InProgress,
                Description = "User training for new system features",
                TotalAmount = 3000m,
                ProfitPercentage = 20m,
                OpenedBy = users[1].Id
            }
        };

        _context.SupportMatters.AddRange(supportMatters);
        await _context.SaveChangesAsync();
    }

    private async Task SeedNotifications()
    {
        if (await _context.Notifications.AnyAsync()) return;

        var users = await _context.Users.ToListAsync();

        if (users.Count < 3)
        {
            throw new InvalidOperationException("Not enough users to create notifications. Ensure users are seeded first.");
        }

        var notifications = new List<Notification>
        {
            new()
            {
                UserId = users[0].Id,
                Title = "New Tender Published",
                Message = "A new tender for IT services has been published",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                Priority = SupportPriority.Normal
            },
            new()
            {
                UserId = users[1].Id,
                Title = "Quotation Submitted",
                Message = "Your quotation has been successfully submitted",
                Type = NotificationType.Success,
                Status = NotificationStatus.Read,
                Priority = SupportPriority.Normal
            },
            new()
            {
                UserId = users[2].Id,
                Title = "Contract Expiring Soon",
                Message = "Your contract will expire in 30 days",
                Type = NotificationType.Warning,
                Status = NotificationStatus.Unread,
                Priority = SupportPriority.High
            }
        };

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();
    }

    private async Task SeedOperationLogs()
    {
        if (await _context.OperationLogs.AnyAsync()) return;

        var users = await _context.Users.ToListAsync();

        if (users.Count < 3)
        {
            throw new InvalidOperationException("Not enough users to create operation logs. Ensure users are seeded first.");
        }

        var operationLogs = new List<OperationLog>
        {
            new()
            {
                OperationType = "User Login",
                Action = "Login",
                Description = "User logged into the system",
                UserId = users[0].Id,
                UserName = users[0].Username,
                Timestamp = DateTime.UtcNow.AddHours(-2),
                Status = "Success",
                IpAddress = "192.168.1.100",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            new()
            {
                OperationType = "Tender Creation",
                Action = "Create",
                Description = "New tender created",
                EntityType = "Tender",
                EntityId = Guid.NewGuid(),
                UserId = users[1].Id,
                UserName = users[1].Username,
                Timestamp = DateTime.UtcNow.AddHours(-1),
                Status = "Success",
                IpAddress = "192.168.1.101",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            new()
            {
                OperationType = "Quotation Submission",
                Action = "Submit",
                Description = "Quotation submitted for review",
                EntityType = "Quotation",
                EntityId = Guid.NewGuid(),
                UserId = users[2].Id,
                UserName = users[2].Username,
                Timestamp = DateTime.UtcNow.AddMinutes(-30),
                Status = "Success",
                IpAddress = "192.168.1.102",
                UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
        };

        _context.OperationLogs.AddRange(operationLogs);
        await _context.SaveChangesAsync();
    }

    private async Task SeedFiles()
    {
        if (await _context.TmsFiles.AnyAsync()) return;

        var entities = await _context.Entities.Take(2).ToListAsync();

        if (entities.Count < 2)
        {
            throw new InvalidOperationException("Not enough entities to create files. Ensure entities are seeded first.");
        }

        var files = new List<TmsFile>
        {
            new()
            {
                EntityId = entities[0].Id,
                FileName = "tender_document.pdf",
                OriginalFileName = "IT_Infrastructure_Tender.pdf",
                FilePath = "/uploads/tender_document.pdf",
                FileSize = 2048576, // 2MB
                MimeType = "application/pdf",
                IsPublic = true,
                Description = "Official tender document"
            },
            new()
            {
                EntityId = entities[1].Id,
                FileName = "quotation_response.pdf",
                OriginalFileName = "Quotation_Response_2024.pdf",
                FilePath = "/uploads/quotation_response.pdf",
                FileSize = 1536000, // 1.5MB
                MimeType = "application/pdf",
                IsPublic = false,
                Description = "Supplier quotation response"
            }
        };

        _context.TmsFiles.AddRange(files);
        await _context.SaveChangesAsync();
    }

    public async Task ClearAllDataAsync()
    {
        // Clear in reverse order of dependencies
        _context.TmsFiles.RemoveRange(_context.TmsFiles);
        _context.OperationLogs.RemoveRange(_context.OperationLogs);
        _context.Notifications.RemoveRange(_context.Notifications);
        _context.SupportMatters.RemoveRange(_context.SupportMatters);
        _context.GovernmentGuarantees.RemoveRange(_context.GovernmentGuarantees);
        _context.BankGuarantees.RemoveRange(_context.BankGuarantees);
        _context.SupplyDeliveries.RemoveRange(_context.SupplyDeliveries);
        _context.Contracts.RemoveRange(_context.Contracts);
        _context.AssignmentOrders.RemoveRange(_context.AssignmentOrders);
        _context.Quotations.RemoveRange(_context.Quotations);
        _context.Tenders.RemoveRange(_context.Tenders);
        _context.Suppliers.RemoveRange(_context.Suppliers);
        _context.Addresses.RemoveRange(_context.Addresses);
        _context.Entities.RemoveRange(_context.Entities);
        _context.Currencies.RemoveRange(_context.Currencies);
        _context.UserRoles.RemoveRange(_context.UserRoles);
        _context.Users.RemoveRange(_context.Users);
        _context.Roles.RemoveRange(_context.Roles);

        await _context.SaveChangesAsync();
    }
}
