using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:address_type", "billing,shipping,other")
                .Annotation("Npgsql:Enum:approval_action_type", "approve,reject,return,delegate,cancel,comment,request_info")
                .Annotation("Npgsql:Enum:approval_role", "branch_contracts_manager,unified_procurement_manager,assistant_unified_procurement_manager,legal_affairs,financial_manager,general_manager,department_head,employee")
                .Annotation("Npgsql:Enum:approval_status", "pending,in_progress,approved,rejected,returned,cancelled,expired,delegated")
                .Annotation("Npgsql:Enum:assignment_order_status", "issued,confirmed,in_progress,completed,cancelled")
                .Annotation("Npgsql:Enum:contract_status", "active,expired,terminated,completed")
                .Annotation("Npgsql:Enum:contract_type", "fixed_price,time_and_materials,cost_plus")
                .Annotation("Npgsql:Enum:delivery_status", "pending,scheduled,in_transit,shipped,delivered,accepted,rejected,cancelled")
                .Annotation("Npgsql:Enum:guarantee_status", "active,expired,claimed,released")
                .Annotation("Npgsql:Enum:guarantee_type", "bid_bond,performance_bond,advance_payment")
                .Annotation("Npgsql:Enum:invoice_status", "draft,sent,paid,overdue,cancelled,partially_paid")
                .Annotation("Npgsql:Enum:notification_status", "unread,read")
                .Annotation("Npgsql:Enum:notification_type", "info,warning,error,success")
                .Annotation("Npgsql:Enum:payment_method", "bank_transfer,check,cash,credit_card,online_payment,letter_of_credit")
                .Annotation("Npgsql:Enum:payment_schedule_status", "pending,due,paid,overdue,cancelled,partially_paid")
                .Annotation("Npgsql:Enum:payment_status", "pending,processing,completed,failed,cancelled,refunded")
                .Annotation("Npgsql:Enum:payment_type", "advance,milestone,final,retention,penalty,bonus")
                .Annotation("Npgsql:Enum:quotation_status", "submitted,under_review,approved,rejected,awarded")
                .Annotation("Npgsql:Enum:support_priority", "low,normal,high,urgent")
                .Annotation("Npgsql:Enum:support_status", "open,in_progress,resolved,closed")
                .Annotation("Npgsql:Enum:tender_status", "draft,open,closed,awarded,cancelled")
                .Annotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual")
                .Annotation("Npgsql:Enum:workflow_type", "tender_approval,contract_approval,assignment_order_approval,support_matter_approval,guarantee_letter_approval,general_approval")
                .OldAnnotation("Npgsql:Enum:address_type", "billing,shipping,other")
                .OldAnnotation("Npgsql:Enum:assignment_order_status", "issued,confirmed,in_progress,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:contract_status", "active,expired,terminated,completed")
                .OldAnnotation("Npgsql:Enum:contract_type", "fixed_price,time_and_materials,cost_plus")
                .OldAnnotation("Npgsql:Enum:delivery_status", "pending,scheduled,in_transit,shipped,delivered,accepted,rejected,cancelled")
                .OldAnnotation("Npgsql:Enum:guarantee_status", "active,expired,claimed,released")
                .OldAnnotation("Npgsql:Enum:guarantee_type", "bid_bond,performance_bond,advance_payment")
                .OldAnnotation("Npgsql:Enum:notification_status", "unread,read")
                .OldAnnotation("Npgsql:Enum:notification_type", "info,warning,error,success")
                .OldAnnotation("Npgsql:Enum:quotation_status", "submitted,under_review,approved,rejected,awarded")
                .OldAnnotation("Npgsql:Enum:support_priority", "low,normal,high,urgent")
                .OldAnnotation("Npgsql:Enum:support_status", "open,in_progress,resolved,closed")
                .OldAnnotation("Npgsql:Enum:tender_status", "draft,open,closed,awarded,cancelled")
                .OldAnnotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual");

            migrationBuilder.CreateTable(
                name: "ApprovalWorkflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    WorkflowType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalWorkflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false, defaultValue: 0m),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false, defaultValue: 0m),
                    TaxType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false, defaultValue: 0m),
                    RemainingAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    PaymentPercentage = table.Column<int>(type: "integer", nullable: true, defaultValue: 25),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentReference = table.Column<string>(type: "text", nullable: true),
                    PaidBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CurrencyId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Invoices_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invoices_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Invoices_Users_PaidBy",
                        column: x => x.PaidBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    RequestTitle = table.Column<string>(type: "text", nullable: false),
                    RequestDescription = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CurrentStepOrder = table.Column<int>(type: "integer", nullable: false),
                    CurrentApproverId = table.Column<Guid>(type: "uuid", nullable: true),
                    CurrentStepDueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    CompletionNotes = table.Column<string>(type: "text", nullable: true),
                    CompletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_ApprovalWorkflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "ApprovalWorkflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_Users_CompletedByUserId",
                        column: x => x.CompletedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_Users_CurrentApproverId",
                        column: x => x.CurrentApproverId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ApprovalSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    StepName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    RequiredRole = table.Column<int>(type: "integer", nullable: false),
                    RequiredUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    TimeLimitDays = table.Column<int>(type: "integer", nullable: false),
                    CanDelegate = table.Column<bool>(type: "boolean", nullable: false),
                    CanReject = table.Column<bool>(type: "boolean", nullable: false),
                    CanReturn = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalSteps_ApprovalWorkflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "ApprovalWorkflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalSteps_Users_RequiredUserId",
                        column: x => x.RequiredUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    BankName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BankAccount = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TransactionReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CheckNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CheckDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CheckDueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BankSwiftCode = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BankIban = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ReceiptNumber = table.Column<string>(type: "text", nullable: true),
                    ConfirmationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConfirmedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ConfirmationNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CurrencyId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payments_Users_ConfirmedBy",
                        column: x => x.ConfirmedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PaymentSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    PaymentPercentage = table.Column<int>(type: "integer", nullable: false, defaultValue: 25),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaidAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false, defaultValue: 0m),
                    RemainingAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    MilestoneDescription = table.Column<string>(type: "text", nullable: true),
                    IsAutomatic = table.Column<bool>(type: "boolean", nullable: false),
                    TriggerCondition = table.Column<string>(type: "text", nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    CurrencyId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentSchedules_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentSchedules_Currencies_CurrencyCode",
                        column: x => x.CurrencyCode,
                        principalTable: "Currencies",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PaymentSchedules_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PaymentSchedules_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalActions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApproverId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: false),
                    ActionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DelegatedToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DelegationReason = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalActions_ApprovalRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "ApprovalRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalActions_ApprovalSteps_StepId",
                        column: x => x.StepId,
                        principalTable: "ApprovalSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalActions_Users_ApproverId",
                        column: x => x.ApproverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalActions_Users_DelegatedToUserId",
                        column: x => x.DelegatedToUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalActions_ApproverId",
                table: "ApprovalActions",
                column: "ApproverId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalActions_DelegatedToUserId",
                table: "ApprovalActions",
                column: "DelegatedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalActions_RequestId",
                table: "ApprovalActions",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalActions_StepId",
                table: "ApprovalActions",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_CompletedByUserId",
                table: "ApprovalRequests",
                column: "CompletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_CurrentApproverId",
                table: "ApprovalRequests",
                column: "CurrentApproverId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_WorkflowId",
                table: "ApprovalRequests",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalSteps_RequiredUserId",
                table: "ApprovalSteps",
                column: "RequiredUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalSteps_WorkflowId",
                table: "ApprovalSteps",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ContractId",
                table: "Invoices",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CurrencyCode",
                table: "Invoices",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CurrencyId",
                table: "Invoices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_DueDate",
                table: "Invoices",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceNumber",
                table: "Invoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_PaidBy",
                table: "Invoices",
                column: "PaidBy");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Status",
                table: "Invoices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ConfirmedBy",
                table: "Payments",
                column: "ConfirmedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CurrencyCode",
                table: "Payments",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CurrencyId",
                table: "Payments",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceId",
                table: "Payments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentDate",
                table: "Payments",
                column: "PaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments",
                column: "PaymentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TransactionReference",
                table: "Payments",
                column: "TransactionReference");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_ContractId",
                table: "PaymentSchedules",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_CurrencyCode",
                table: "PaymentSchedules",
                column: "CurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_CurrencyId",
                table: "PaymentSchedules",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_DueDate",
                table: "PaymentSchedules",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_InvoiceId",
                table: "PaymentSchedules",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_PaymentType",
                table: "PaymentSchedules",
                column: "PaymentType");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_ScheduleNumber",
                table: "PaymentSchedules",
                column: "ScheduleNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_Status",
                table: "PaymentSchedules",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApprovalActions");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "PaymentSchedules");

            migrationBuilder.DropTable(
                name: "ApprovalRequests");

            migrationBuilder.DropTable(
                name: "ApprovalSteps");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "ApprovalWorkflows");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:address_type", "billing,shipping,other")
                .Annotation("Npgsql:Enum:assignment_order_status", "issued,confirmed,in_progress,completed,cancelled")
                .Annotation("Npgsql:Enum:contract_status", "active,expired,terminated,completed")
                .Annotation("Npgsql:Enum:contract_type", "fixed_price,time_and_materials,cost_plus")
                .Annotation("Npgsql:Enum:delivery_status", "pending,scheduled,in_transit,shipped,delivered,accepted,rejected,cancelled")
                .Annotation("Npgsql:Enum:guarantee_status", "active,expired,claimed,released")
                .Annotation("Npgsql:Enum:guarantee_type", "bid_bond,performance_bond,advance_payment")
                .Annotation("Npgsql:Enum:notification_status", "unread,read")
                .Annotation("Npgsql:Enum:notification_type", "info,warning,error,success")
                .Annotation("Npgsql:Enum:quotation_status", "submitted,under_review,approved,rejected,awarded")
                .Annotation("Npgsql:Enum:support_priority", "low,normal,high,urgent")
                .Annotation("Npgsql:Enum:support_status", "open,in_progress,resolved,closed")
                .Annotation("Npgsql:Enum:tender_status", "draft,open,closed,awarded,cancelled")
                .Annotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual")
                .OldAnnotation("Npgsql:Enum:address_type", "billing,shipping,other")
                .OldAnnotation("Npgsql:Enum:approval_action_type", "approve,reject,return,delegate,cancel,comment,request_info")
                .OldAnnotation("Npgsql:Enum:approval_role", "branch_contracts_manager,unified_procurement_manager,assistant_unified_procurement_manager,legal_affairs,financial_manager,general_manager,department_head,employee")
                .OldAnnotation("Npgsql:Enum:approval_status", "pending,in_progress,approved,rejected,returned,cancelled,expired,delegated")
                .OldAnnotation("Npgsql:Enum:assignment_order_status", "issued,confirmed,in_progress,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:contract_status", "active,expired,terminated,completed")
                .OldAnnotation("Npgsql:Enum:contract_type", "fixed_price,time_and_materials,cost_plus")
                .OldAnnotation("Npgsql:Enum:delivery_status", "pending,scheduled,in_transit,shipped,delivered,accepted,rejected,cancelled")
                .OldAnnotation("Npgsql:Enum:guarantee_status", "active,expired,claimed,released")
                .OldAnnotation("Npgsql:Enum:guarantee_type", "bid_bond,performance_bond,advance_payment")
                .OldAnnotation("Npgsql:Enum:invoice_status", "draft,sent,paid,overdue,cancelled,partially_paid")
                .OldAnnotation("Npgsql:Enum:notification_status", "unread,read")
                .OldAnnotation("Npgsql:Enum:notification_type", "info,warning,error,success")
                .OldAnnotation("Npgsql:Enum:payment_method", "bank_transfer,check,cash,credit_card,online_payment,letter_of_credit")
                .OldAnnotation("Npgsql:Enum:payment_schedule_status", "pending,due,paid,overdue,cancelled,partially_paid")
                .OldAnnotation("Npgsql:Enum:payment_status", "pending,processing,completed,failed,cancelled,refunded")
                .OldAnnotation("Npgsql:Enum:payment_type", "advance,milestone,final,retention,penalty,bonus")
                .OldAnnotation("Npgsql:Enum:quotation_status", "submitted,under_review,approved,rejected,awarded")
                .OldAnnotation("Npgsql:Enum:support_priority", "low,normal,high,urgent")
                .OldAnnotation("Npgsql:Enum:support_status", "open,in_progress,resolved,closed")
                .OldAnnotation("Npgsql:Enum:tender_status", "draft,open,closed,awarded,cancelled")
                .OldAnnotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual")
                .OldAnnotation("Npgsql:Enum:workflow_type", "tender_approval,contract_approval,assignment_order_approval,support_matter_approval,guarantee_letter_approval,general_approval");
        }
    }
}
