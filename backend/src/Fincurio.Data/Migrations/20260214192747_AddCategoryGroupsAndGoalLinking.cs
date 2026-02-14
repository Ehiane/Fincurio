using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fincurio.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryGroupsAndGoalLinking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "goal_id",
                table: "transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "category_group",
                table: "categories",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "idx_transactions_goal",
                table: "transactions",
                column: "goal_id");

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_goals_goal_id",
                table: "transactions",
                column: "goal_id",
                principalTable: "goals",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_transactions_goals_goal_id",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "idx_transactions_goal",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "goal_id",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "category_group",
                table: "categories");
        }
    }
}
