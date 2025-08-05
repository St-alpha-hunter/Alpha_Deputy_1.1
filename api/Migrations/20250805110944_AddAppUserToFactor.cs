using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddAppUserToFactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
    }
}
