using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fincurio.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlannedContribution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "planned_contribution",
                table: "goals",
                type: "numeric(12,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "planned_contribution",
                table: "goals");
        }
    }
}
