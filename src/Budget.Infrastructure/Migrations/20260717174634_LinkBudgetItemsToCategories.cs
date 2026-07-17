using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Budget.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkBudgetItemsToCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "BudgetItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_CategoryId",
                table: "BudgetItems",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetItems_Categories_CategoryId",
                table: "BudgetItems",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetItems_Categories_CategoryId",
                table: "BudgetItems");

            migrationBuilder.DropIndex(
                name: "IX_BudgetItems_CategoryId",
                table: "BudgetItems");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "BudgetItems");
        }
    }
}
