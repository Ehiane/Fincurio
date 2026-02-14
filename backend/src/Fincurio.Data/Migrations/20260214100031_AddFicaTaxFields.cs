using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fincurio.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFicaTaxFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "medicare_tax",
                table: "income_profiles",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "social_security_tax",
                table: "income_profiles",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "medicare_tax",
                table: "income_profiles");

            migrationBuilder.DropColumn(
                name: "social_security_tax",
                table: "income_profiles");
        }
    }
}
