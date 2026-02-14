using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fincurio.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDeductionFieldsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_category_budgets_budget_goals_budget_goal_id",
                table: "category_budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_category_budgets_categories_category_id",
                table: "category_budgets");

            migrationBuilder.DropColumn(
                name: "monthly_savings_target",
                table: "budget_goals");

            migrationBuilder.DropColumn(
                name: "monthly_spending_cap",
                table: "budget_goals");

            migrationBuilder.RenameColumn(
                name: "budget_goal_id",
                table: "category_budgets",
                newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "idx_category_budgets_goal_category",
                table: "category_budgets",
                newName: "idx_category_budgets_user_category");

            migrationBuilder.AlterColumn<string>(
                name: "state_tax_code",
                table: "income_profiles",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2)",
                oldMaxLength: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pay_frequency",
                table: "income_profiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "employment_type",
                table: "income_profiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "earning_method",
                table: "income_profiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<decimal>(
                name: "health_insurance_per_paycheck",
                table: "income_profiles",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "other_deductions_json",
                table: "income_profiles",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "retirement_percent",
                table: "income_profiles",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "monthly_budget_target",
                table: "budget_goals",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_category_budgets_categories_category_id",
                table: "category_budgets",
                column: "category_id",
                principalTable: "categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_category_budgets_users_user_id",
                table: "category_budgets",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_category_budgets_categories_category_id",
                table: "category_budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_category_budgets_users_user_id",
                table: "category_budgets");

            migrationBuilder.DropColumn(
                name: "health_insurance_per_paycheck",
                table: "income_profiles");

            migrationBuilder.DropColumn(
                name: "other_deductions_json",
                table: "income_profiles");

            migrationBuilder.DropColumn(
                name: "retirement_percent",
                table: "income_profiles");

            migrationBuilder.DropColumn(
                name: "monthly_budget_target",
                table: "budget_goals");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "category_budgets",
                newName: "budget_goal_id");

            migrationBuilder.RenameIndex(
                name: "idx_category_budgets_user_category",
                table: "category_budgets",
                newName: "idx_category_budgets_goal_category");

            migrationBuilder.AlterColumn<string>(
                name: "state_tax_code",
                table: "income_profiles",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pay_frequency",
                table: "income_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "employment_type",
                table: "income_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "earning_method",
                table: "income_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<decimal>(
                name: "monthly_savings_target",
                table: "budget_goals",
                type: "numeric(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "monthly_spending_cap",
                table: "budget_goals",
                type: "numeric(12,2)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_category_budgets_budget_goals_budget_goal_id",
                table: "category_budgets",
                column: "budget_goal_id",
                principalTable: "budget_goals",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_category_budgets_categories_category_id",
                table: "category_budgets",
                column: "category_id",
                principalTable: "categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
