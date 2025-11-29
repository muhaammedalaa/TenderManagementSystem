using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:address_type", "billing,shipping,other")
                .Annotation("Npgsql:Enum:assignment_order_status", "issued,confirmed,in_progress,completed,cancelled")
                .Annotation("Npgsql:Enum:contract_status", "active,expired,terminated,completed")
                .Annotation("Npgsql:Enum:contract_type", "fixed_price,time_and_materials,cost_plus")
                .Annotation("Npgsql:Enum:delivery_status", "scheduled,shipped,delivered,accepted,rejected")
                .Annotation("Npgsql:Enum:guarantee_status", "active,expired,claimed,released")
                .Annotation("Npgsql:Enum:guarantee_type", "bid_bond,performance_bond,advance_payment")
                .Annotation("Npgsql:Enum:notification_status", "unread,read")
                .Annotation("Npgsql:Enum:notification_type", "info,warning,error,success")
                .Annotation("Npgsql:Enum:quotation_status", "submitted,under_review,approved,rejected,awarded")
                .Annotation("Npgsql:Enum:support_priority", "low,normal,high,urgent")
                .Annotation("Npgsql:Enum:support_status", "open,in_progress,resolved,closed")
                .Annotation("Npgsql:Enum:tender_status", "draft,open,closed,awarded,cancelled")
                .Annotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual");

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AddressLine1 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AddressLine2 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                    table.UniqueConstraint("AK_Currencies_Code", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "Entities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entities_Entities_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LastName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LastLoginUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrimaryAddressId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RegistrationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContactPerson = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    FinancialCapacity = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    ExperienceYears = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Suppliers_Addresses_PrimaryAddressId",
                        column: x => x.PrimaryAddressId,
                        principalTable: "Addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Suppliers_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RelatedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReadAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OperationLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationType = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EntityType = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Details = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SupportMatters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    ProfitPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    CalculatedProfit = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    OpenedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OpenedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ClosedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    OpenedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ClosedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportMatters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportMatters_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupportMatters_Users_ClosedByUserId",
                        column: x => x.ClosedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SupportMatters_Users_OpenedByUserId",
                        column: x => x.OpenedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TmsFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UploadedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TmsFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TmsFiles_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TmsFiles_Users_UploadedByUserId",
                        column: x => x.UploadedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentOrders_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentOrders_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contracts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignmentOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContractNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContractType = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    DeliveryTerms = table.Column<string>(type: "text", nullable: true),
                    WarrantyPeriod = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TerminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TerminationReason = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contracts_AssignmentOrders_AssignmentOrderId",
                        column: x => x.AssignmentOrderId,
                        principalTable: "AssignmentOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Contracts_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SupplyDeliveries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    DeliveryLocation = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ActualDeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AcceptanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplyDeliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplyDeliveries_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BankGuarantees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    GuaranteeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BankName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    BankBranch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuaranteeType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    TaxType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    TaxRegistrationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsTaxIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    CalculatedProfit = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    BankSwiftCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BankAccountNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BankContactPerson = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BankContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BankContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    GuaranteeTerms = table.Column<string>(type: "text", nullable: true),
                    IsRenewable = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalPeriodDays = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankGuarantees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankGuarantees_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GovernmentGuarantees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    GuaranteeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AuthorityName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AuthorityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuaranteeType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    TaxType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    TaxRegistrationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsTaxIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    CalculatedProfit = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    AuthorityCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AuthorityContactPerson = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AuthorityContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AuthorityContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    GuaranteeTerms = table.Column<string>(type: "text", nullable: true),
                    IsRenewable = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalPeriodDays = table.Column<int>(type: "integer", nullable: true),
                    ApprovalNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GovernmentGuarantees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GovernmentGuarantees_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GuaranteeLetters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    GuaranteeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Supplier = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Tender = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Winner = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProfitPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    CalculatedProfit = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: true),
                    BankGuaranteeId = table.Column<Guid>(type: "uuid", nullable: true),
                    GovernmentGuaranteeId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuaranteeLetters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuaranteeLetters_BankGuarantees_BankGuaranteeId",
                        column: x => x.BankGuaranteeId,
                        principalTable: "BankGuarantees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuaranteeLetters_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuaranteeLetters_GovernmentGuarantees_GovernmentGuaranteeId",
                        column: x => x.GovernmentGuaranteeId,
                        principalTable: "GovernmentGuarantees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Quotations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ValidityPeriod = table.Column<int>(type: "integer", nullable: true),
                    DeliveryPeriod = table.Column<int>(type: "integer", nullable: true),
                    TechnicalScore = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    FinancialScore = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    TotalScore = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SubmissionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EvaluationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EvaluationNotes = table.Column<string>(type: "text", nullable: true),
                    EvaluatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    EvaluatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quotations_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quotations_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Quotations_Users_EvaluatedByUserId",
                        column: x => x.EvaluatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Tenders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    SubmissionDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OpeningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Requirements = table.Column<string>(type: "text", nullable: true),
                    TermsConditions = table.Column<string>(type: "text", nullable: true),
                    WinnerQuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                    AwardedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AwardedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    AutoDetermineWinner = table.Column<bool>(type: "boolean", nullable: false),
                    WinnerDeterminationMethod = table.Column<int>(type: "integer", nullable: true),
                    LowestBidAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    LowestBidQuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                    HighestScore = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    HighestScoreQuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                    AwardedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tenders_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tenders_Quotations_HighestScoreQuotationId",
                        column: x => x.HighestScoreQuotationId,
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tenders_Quotations_LowestBidQuotationId",
                        column: x => x.LowestBidQuotationId,
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tenders_Quotations_WinnerQuotationId",
                        column: x => x.WinnerQuotationId,
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tenders_Users_AwardedByUserId",
                        column: x => x.AwardedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CreatedBy",
                table: "Addresses",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UpdatedBy",
                table: "Addresses",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentOrders_CreatedBy",
                table: "AssignmentOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentOrders_CurrencyCode",
                table: "AssignmentOrders",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentOrders_EntityId",
                table: "AssignmentOrders",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentOrders_OrderNumber",
                table: "AssignmentOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentOrders_QuotationId",
                table: "AssignmentOrders",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentOrders_UpdatedBy",
                table: "AssignmentOrders",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_BankGuarantees_CreatedBy",
                table: "BankGuarantees",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_BankGuarantees_CurrencyCode",
                table: "BankGuarantees",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_BankGuarantees_GuaranteeNumber",
                table: "BankGuarantees",
                column: "GuaranteeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BankGuarantees_QuotationId",
                table: "BankGuarantees",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_BankGuarantees_UpdatedBy",
                table: "BankGuarantees",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_AssignmentOrderId",
                table: "Contracts",
                column: "AssignmentOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractNumber",
                table: "Contracts",
                column: "ContractNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_CreatedBy",
                table: "Contracts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_CurrencyCode",
                table: "Contracts",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_Status",
                table: "Contracts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_UpdatedBy",
                table: "Contracts",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_Code",
                table: "Currencies",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_CreatedBy",
                table: "Currencies",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_UpdatedBy",
                table: "Currencies",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Entities_Code",
                table: "Entities",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Entities_CreatedBy",
                table: "Entities",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Entities_ParentId",
                table: "Entities",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entities_UpdatedBy",
                table: "Entities",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_GovernmentGuarantees_CreatedBy",
                table: "GovernmentGuarantees",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_GovernmentGuarantees_CurrencyCode",
                table: "GovernmentGuarantees",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_GovernmentGuarantees_GuaranteeNumber",
                table: "GovernmentGuarantees",
                column: "GuaranteeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GovernmentGuarantees_QuotationId",
                table: "GovernmentGuarantees",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_GovernmentGuarantees_UpdatedBy",
                table: "GovernmentGuarantees",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_GuaranteeLetters_BankGuaranteeId",
                table: "GuaranteeLetters",
                column: "BankGuaranteeId");

            migrationBuilder.CreateIndex(
                name: "IX_GuaranteeLetters_ContractId",
                table: "GuaranteeLetters",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_GuaranteeLetters_CreatedBy",
                table: "GuaranteeLetters",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_GuaranteeLetters_GovernmentGuaranteeId",
                table: "GuaranteeLetters",
                column: "GovernmentGuaranteeId");

            migrationBuilder.CreateIndex(
                name: "IX_GuaranteeLetters_GuaranteeNumber",
                table: "GuaranteeLetters",
                column: "GuaranteeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuaranteeLetters_UpdatedBy",
                table: "GuaranteeLetters",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedBy",
                table: "Notifications",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UpdatedBy",
                table: "Notifications",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationLogs_CreatedBy",
                table: "OperationLogs",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OperationLogs_UpdatedBy",
                table: "OperationLogs",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OperationLogs_UserId",
                table: "OperationLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_CreatedBy",
                table: "Quotations",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_CurrencyCode",
                table: "Quotations",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_EvaluatedByUserId",
                table: "Quotations",
                column: "EvaluatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_ReferenceNumber",
                table: "Quotations",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_Status",
                table: "Quotations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_SupplierId",
                table: "Quotations",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenderId",
                table: "Quotations",
                column: "TenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_UpdatedBy",
                table: "Quotations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_CreatedBy",
                table: "Roles",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_UpdatedBy",
                table: "Roles",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_CreatedBy",
                table: "Suppliers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_EntityId",
                table: "Suppliers",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_PrimaryAddressId",
                table: "Suppliers",
                column: "PrimaryAddressId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_UpdatedBy",
                table: "Suppliers",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyDeliveries_ContractId",
                table: "SupplyDeliveries",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyDeliveries_CreatedBy",
                table: "SupplyDeliveries",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyDeliveries_DeliveryNumber",
                table: "SupplyDeliveries",
                column: "DeliveryNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplyDeliveries_UpdatedBy",
                table: "SupplyDeliveries",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_ClosedByUserId",
                table: "SupportMatters",
                column: "ClosedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_CreatedBy",
                table: "SupportMatters",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_EntityId",
                table: "SupportMatters",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_OpenedByUserId",
                table: "SupportMatters",
                column: "OpenedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_Priority",
                table: "SupportMatters",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_Status",
                table: "SupportMatters",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMatters_UpdatedBy",
                table: "SupportMatters",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_AwardedByUserId",
                table: "Tenders",
                column: "AwardedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_CreatedBy",
                table: "Tenders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_EntityId",
                table: "Tenders",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_HighestScoreQuotationId",
                table: "Tenders",
                column: "HighestScoreQuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_LowestBidQuotationId",
                table: "Tenders",
                column: "LowestBidQuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_ReferenceNumber",
                table: "Tenders",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_Status",
                table: "Tenders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_UpdatedBy",
                table: "Tenders",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Tenders_WinnerQuotationId",
                table: "Tenders",
                column: "WinnerQuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_TmsFiles_CreatedBy",
                table: "TmsFiles",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TmsFiles_EntityId",
                table: "TmsFiles",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_TmsFiles_UpdatedBy",
                table: "TmsFiles",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TmsFiles_UploadedByUserId",
                table: "TmsFiles",
                column: "UploadedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_AssignedBy",
                table: "UserRoles",
                column: "AssignedBy");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedBy",
                table: "Users",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_UpdatedBy",
                table: "Users",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentOrders_Quotations_QuotationId",
                table: "AssignmentOrders",
                column: "QuotationId",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BankGuarantees_Quotations_QuotationId",
                table: "BankGuarantees",
                column: "QuotationId",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GovernmentGuarantees_Quotations_QuotationId",
                table: "GovernmentGuarantees",
                column: "QuotationId",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Quotations_Tenders_TenderId",
                table: "Quotations",
                column: "TenderId",
                principalTable: "Tenders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotations_Currencies_CurrencyCode",
                table: "Quotations");

            migrationBuilder.DropForeignKey(
                name: "FK_Suppliers_Entities_EntityId",
                table: "Suppliers");

            migrationBuilder.DropForeignKey(
                name: "FK_Tenders_Entities_EntityId",
                table: "Tenders");

            migrationBuilder.DropForeignKey(
                name: "FK_Tenders_Quotations_HighestScoreQuotationId",
                table: "Tenders");

            migrationBuilder.DropForeignKey(
                name: "FK_Tenders_Quotations_LowestBidQuotationId",
                table: "Tenders");

            migrationBuilder.DropForeignKey(
                name: "FK_Tenders_Quotations_WinnerQuotationId",
                table: "Tenders");

            migrationBuilder.DropTable(
                name: "GuaranteeLetters");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "OperationLogs");

            migrationBuilder.DropTable(
                name: "SupplyDeliveries");

            migrationBuilder.DropTable(
                name: "SupportMatters");

            migrationBuilder.DropTable(
                name: "TmsFiles");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "BankGuarantees");

            migrationBuilder.DropTable(
                name: "GovernmentGuarantees");

            migrationBuilder.DropTable(
                name: "Contracts");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "AssignmentOrders");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropTable(
                name: "Entities");

            migrationBuilder.DropTable(
                name: "Quotations");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropTable(
                name: "Tenders");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
