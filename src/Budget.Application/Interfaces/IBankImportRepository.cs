using Budget.Application.DTOs.Imports;

namespace Budget.Application.Interfaces;

public interface IBankImportRepository
{
    Task<bool> HasBeenImportedAsync(
        string fileHash,
        Guid accountId,
        string userId);

    Task<BankCsvImportResultDto> ImportAsync(
        string fileHash,
        Guid accountId,
        string userId,
        DateOnly month,
        IReadOnlyCollection<BankCsvRowDto> rows);
}
