using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDTOs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                .OldAnnotation("Npgsql:Enum:assignment_order_status", "issued,confirmed,in_progress,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:contract_status", "active,expired,terminated,completed")
                .OldAnnotation("Npgsql:Enum:contract_type", "fixed_price,time_and_materials,cost_plus")
                .OldAnnotation("Npgsql:Enum:delivery_status", "scheduled,shipped,delivered,accepted,rejected")
                .OldAnnotation("Npgsql:Enum:guarantee_status", "active,expired,claimed,released")
                .OldAnnotation("Npgsql:Enum:guarantee_type", "bid_bond,performance_bond,advance_payment")
                .OldAnnotation("Npgsql:Enum:notification_status", "unread,read")
                .OldAnnotation("Npgsql:Enum:notification_type", "info,warning,error,success")
                .OldAnnotation("Npgsql:Enum:quotation_status", "submitted,under_review,approved,rejected,awarded")
                .OldAnnotation("Npgsql:Enum:support_priority", "low,normal,high,urgent")
                .OldAnnotation("Npgsql:Enum:support_status", "open,in_progress,resolved,closed")
                .OldAnnotation("Npgsql:Enum:tender_status", "draft,open,closed,awarded,cancelled")
                .OldAnnotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "UserRoles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "OperationLogs",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "OperationLogs",
                type: "character varying(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "OperationLogs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Notifications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "Notifications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Notifications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DecimalPlaces",
                table: "Currencies",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletionDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Contracts",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EntityId",
                table: "Addresses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "Addresses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Addresses",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                table: "Addresses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_EntityId",
                table: "Addresses",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_SupplierId",
                table: "Addresses",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Entities_EntityId",
                table: "Addresses",
                column: "EntityId",
                principalTable: "Entities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Suppliers_SupplierId",
                table: "Addresses",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Entities_EntityId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Suppliers_SupplierId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_EntityId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_SupplierId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "Action",
                table: "OperationLogs");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "OperationLogs");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "OperationLogs");

            migrationBuilder.DropColumn(
                name: "Data",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DecimalPlaces",
                table: "Currencies");

            migrationBuilder.DropColumn(
                name: "CompletionDate",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Addresses");

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
                .Annotation("Npgsql:Enum:winner_determination_method", "lowest_bid,highest_score,manual")
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
        }
    }
}
