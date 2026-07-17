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

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Account>()
            .Property(account => account.Name)
            .HasMaxLength(100)
            .IsRequired();

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
    }
}