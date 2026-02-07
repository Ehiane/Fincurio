using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fincurio.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixEmailVerificationColumnNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PasswordResetTokenExpiry",
                table: "users",
                newName: "password_reset_token_expiry");

            migrationBuilder.RenameColumn(
                name: "PasswordResetToken",
                table: "users",
                newName: "password_reset_token");

            migrationBuilder.RenameColumn(
                name: "IsEmailVerified",
                table: "users",
                newName: "is_email_verified");

            migrationBuilder.RenameColumn(
                name: "EmailVerificationTokenExpiry",
                table: "users",
                newName: "email_verification_token_expiry");

            migrationBuilder.RenameColumn(
                name: "EmailVerificationToken",
                table: "users",
                newName: "email_verification_token");

            migrationBuilder.AlterColumn<bool>(
                name: "is_email_verified",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "password_reset_token_expiry",
                table: "users",
                newName: "PasswordResetTokenExpiry");

            migrationBuilder.RenameColumn(
                name: "password_reset_token",
                table: "users",
                newName: "PasswordResetToken");

            migrationBuilder.RenameColumn(
                name: "is_email_verified",
                table: "users",
                newName: "IsEmailVerified");

            migrationBuilder.RenameColumn(
                name: "email_verification_token_expiry",
                table: "users",
                newName: "EmailVerificationTokenExpiry");

            migrationBuilder.RenameColumn(
                name: "email_verification_token",
                table: "users",
                newName: "EmailVerificationToken");

            migrationBuilder.AlterColumn<bool>(
                name: "IsEmailVerified",
                table: "users",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);
        }
    }
}
