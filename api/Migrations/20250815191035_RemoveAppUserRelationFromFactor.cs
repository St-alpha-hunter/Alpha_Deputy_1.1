using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAppUserRelationFromFactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Factors_AspNetUsers_AppUserId",
                table: "Factors");

            migrationBuilder.DropIndex(
                name: "IX_Factors_AppUserId",
                table: "Factors");

            migrationBuilder.DropColumn(
                name: "AppUserId",
                table: "Factors");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AppUserId",
                table: "Factors",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Factors_AppUserId",
                table: "Factors",
                column: "AppUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Factors_AspNetUsers_AppUserId",
                table: "Factors",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
