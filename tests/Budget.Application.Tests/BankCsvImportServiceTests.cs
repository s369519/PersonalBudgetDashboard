using System.Text;
using Budget.Application.DTOs.Imports;
using Budget.Application.Interfaces;
using Budget.Application.Services;
using Budget.Domain.Entities;

namespace Budget.Application.Tests;

public class BankCsvImportServiceTests
{
    [Fact]
    public void PreviewReadsLatin1MonthAmountsAndCategories()
    {
        const string csv =
            "Inntekt/Utgift;Toppkategori;Underkategori;Brukersted;2026-5\n" +
            "Inntekter;Andre inntekter;Diverse andre inntekter;Arbeidsgiver;28417,68\n" +
            "Utgifter;Levekostnader;Helse, behandling og velvære;Apotek;-132,66\n";
        var service = new BankCsvImportService(
            new AccountRepositoryStub(),
            new ImportRepositoryStub());

        var preview = service.Preview(Encoding.Latin1.GetBytes(csv));

        Assert.Equal(new DateOnly(2026, 5, 1), preview.Month);
        Assert.Equal(new DateOnly(2026, 5, 1), preview.TransactionDate);
        Assert.Equal(2, preview.RowCount);
        Assert.Equal(28_417.68m, preview.TotalIncome);
        Assert.Equal(132.66m, preview.TotalExpenses);
        Assert.Contains("Helse, behandling og velvære", preview.Categories);
    }

    private sealed class AccountRepositoryStub : IAccountRepository
    {
        public Task<IEnumerable<Account>> GetAllAsync(string userId) =>
            Task.FromResult<IEnumerable<Account>>([]);
        public Task<Account?> GetByIdAsync(Guid id, string userId) =>
            Task.FromResult<Account?>(null);
        public Task<Account> AddAsync(Account value) => Task.FromResult(value);
        public Task UpdateAsync(Account value) => Task.CompletedTask;
        public Task DeleteAsync(Account value) => Task.CompletedTask;
    }

    private sealed class ImportRepositoryStub : IBankImportRepository
    {
        public Task<bool> HasBeenImportedAsync(
            string fileHash,
            Guid accountId,
            string userId) => Task.FromResult(false);

        public Task<BankCsvImportResultDto> ImportAsync(
            string fileHash,
            Guid accountId,
            string userId,
            DateOnly month,
            IReadOnlyCollection<BankCsvRowDto> rows) =>
            Task.FromResult(new BankCsvImportResultDto());
    }
}
