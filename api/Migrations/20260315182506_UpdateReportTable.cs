using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReportTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_AspNetUsers_AppUserId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_AppUserId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "ChartBase64",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "MetricsJson",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "PositionsJson",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Reports");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Reports",
                newName: "ReportId");

            migrationBuilder.AddColumn<string>(
                name: "ResultJson",
                table: "Reports",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResultJson",
                table: "Reports");

            migrationBuilder.RenameColumn(
                name: "ReportId",
                table: "Reports",
                newName: "Id");

            migrationBuilder.AddColumn<string>(
                name: "ChartBase64",
                table: "Reports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Reports",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Reports",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "MetricsJson",
                table: "Reports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PositionsJson",
                table: "Reports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "Reports",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Reports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_AppUserId",
                table: "Reports",
                column: "AppUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_AspNetUsers_AppUserId",
                table: "Reports",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
