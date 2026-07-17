using Budget.Domain.Entities;
using Budget.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Budget.Infrastructure.Data;

public class BudgetDbContext
    : IdentityDbContext<ApplicationUser>
{
    public BudgetDbContext(
        DbContextOptions<BudgetDbContext> options)
        : base(options)
    {
    }

    public DbSet<Account> Accounts =>
        Set<Account>();

    public DbSet<Category> Categories =>
        Set<Category>();

    public DbSet<Transaction> Transactions =>
        Set<Transaction>();

    public DbSet<Household> Households =>
        Set<Household>();

    public DbSet<BudgetSheet> BudgetSheets =>
        Set<BudgetSheet>();

    public DbSet<BudgetItem> BudgetItems =>
        Set<BudgetItem>();

    public DbSet<BankImportBatch> BankImportBatches =>
        Set<BankImportBatch>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Account>()
            .Property(account => account.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Account>()
            .Property(account => account.Visibility)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<Household>()
            .Property(household => household.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Household>()
            .Property(household => household.JoinCode)
            .HasMaxLength(12)
            .IsRequired();

        modelBuilder.Entity<Household>()
            .HasIndex(household => household.JoinCode)
            .IsUnique();

        modelBuilder.Entity<BudgetSheet>()
            .Property(sheet => sheet.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<BudgetSheet>()
            .Property(sheet => sheet.Visibility)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<BudgetSheet>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(sheet => sheet.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BudgetSheet>()
            .HasIndex(sheet => sheet.UserId);

        modelBuilder.Entity<BudgetItem>()
            .Property(item => item.Description)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<BudgetItem>()
            .Property(item => item.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<BudgetItem>()
            .HasOne(item => item.BudgetSheet)
            .WithMany(sheet => sheet.Items)
            .HasForeignKey(item => item.BudgetSheetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BudgetItem>()
            .HasOne(item => item.Category)
            .WithMany()
            .HasForeignKey(item => item.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<BankImportBatch>()
            .Property(batch => batch.FileHash)
            .HasMaxLength(64)
            .IsRequired();

        modelBuilder.Entity<BankImportBatch>()
            .HasIndex(batch => new
            {
                batch.UserId,
                batch.AccountId,
                batch.FileHash
            })
            .IsUnique();

        modelBuilder.Entity<BankImportBatch>()
            .HasOne<Account>()
            .WithMany()
            .HasForeignKey(batch => batch.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BankImportBatch>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(batch => batch.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Category>()
            .Property(category => category.Name)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<Transaction>()
            .Property(transaction => transaction.Description)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<Transaction>()
            .HasOne(transaction => transaction.Account)
            .WithMany(account => account.Transactions)
            .HasForeignKey(transaction => transaction.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(transaction => transaction.Category)
            .WithMany(category => category.Transactions)
            .HasForeignKey(transaction => transaction.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Account>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(account => account.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Category>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(category => category.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Account>()
            .HasIndex(account => account.UserId);
            
        modelBuilder.Entity<Category>()
            .HasIndex(category => category.UserId);

        modelBuilder.Entity<ApplicationUser>()
            .HasOne<Household>()
            .WithMany()
            .HasForeignKey(user => user.HouseholdId)
            .OnDelete(DeleteBehavior.SetNull);

    }
}
