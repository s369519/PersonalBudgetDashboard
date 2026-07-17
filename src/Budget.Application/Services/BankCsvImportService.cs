using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Budget.Application.DTOs.Imports;
using Budget.Application.Exceptions;
using Budget.Application.Interfaces;
using Budget.Domain.Entities;

namespace Budget.Application.Services;

public class BankCsvImportService
{
    private const int MaxFileSize = 5 * 1024 * 1024;
    private const int MaxRows = 5_000;
    private readonly IAccountRepository _accountRepository;
    private readonly IBankImportRepository _importRepository;

    public BankCsvImportService(
        IAccountRepository accountRepository,
        IBankImportRepository importRepository)
    {
        _accountRepository = accountRepository;
        _importRepository = importRepository;
    }

    public BankCsvPreviewDto Preview(byte[] fileBytes)
    {
        var parsed = Parse(fileBytes);
        return new BankCsvPreviewDto
        {
            Month = parsed.Month,
            TransactionDate = parsed.Month,
            RowCount = parsed.Rows.Count,
            TotalIncome = parsed.Rows
                .Where(row => row.Amount > 0)
                .Sum(row => row.Amount),
            TotalExpenses = parsed.Rows
                .Where(row => row.Amount < 0)
                .Sum(row => Math.Abs(row.Amount)),
            Categories = parsed.Rows
                .Select(row => row.Category)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(category => category),
            Rows = parsed.Rows
        };
    }

    public async Task<BankCsvImportResultDto> ImportAsync(
        byte[] fileBytes,
        Guid accountId,
        string userId)
    {
        var account = await _accountRepository.GetByIdAsync(
            accountId,
            userId);

        if (account is null ||
            account.UserId != userId ||
            account.Visibility != AccountVisibility.Personal)
        {
            throw new ValidationException(
                "accountId",
                "CSV files can only be imported to one of your personal accounts.");
        }

        var parsed = Parse(fileBytes);
        var fileHash = Convert.ToHexString(
            SHA256.HashData(fileBytes));

        if (await _importRepository.HasBeenImportedAsync(
                fileHash,
                accountId,
                userId))
        {
            throw new ValidationException(
                "file",
                "This CSV report has already been imported to the selected account.");
        }

        return await _importRepository.ImportAsync(
            fileHash,
            accountId,
            userId,
            parsed.Month,
            parsed.Rows);
    }

    private static ParsedBankCsv Parse(byte[] fileBytes)
    {
        if (fileBytes.Length == 0 || fileBytes.Length > MaxFileSize)
        {
            throw new ValidationException(
                "file",
                "The CSV file must be between 1 byte and 5 MB.");
        }

        var text = Encoding.Latin1.GetString(fileBytes);
        var records = ParseSemicolonCsv(text);

        if (records.Count < 2 || records[0].Count < 5)
        {
            throw new ValidationException(
                "file",
                "The CSV file does not contain the expected five-column bank format.");
        }

        var header = records[0];
        if (!header[0].Trim().Equals(
                "Inntekt/Utgift",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(
                "file",
                "The first column must be 'Inntekt/Utgift'.");
        }

        var monthParts = header[4].Trim().Split('-');
        if (monthParts.Length != 2 ||
            !int.TryParse(monthParts[0], out var year) ||
            !int.TryParse(monthParts[1], out var month) ||
            year is < 2000 or > 2100 ||
            month is < 1 or > 12)
        {
            throw new ValidationException(
                "file",
                "Cell E1 must contain a month in the format YYYY-M.");
        }

        var rows = new List<BankCsvRowDto>();
        foreach (var record in records.Skip(1))
        {
            if (record.All(string.IsNullOrWhiteSpace))
            {
                continue;
            }

            if (record.Count != 5 ||
                !decimal.TryParse(
                    record[4].Trim(),
                    NumberStyles.Number | NumberStyles.AllowLeadingSign,
                    CultureInfo.GetCultureInfo("nb-NO"),
                    out var amount))
            {
                throw new ValidationException(
                    "file",
                    $"CSV row {rows.Count + 2} has an invalid format or amount.");
            }

            var topCategory = record[1].Trim();
            var category = string.IsNullOrWhiteSpace(record[2])
                ? topCategory
                : record[2].Trim();
            category = string.IsNullOrWhiteSpace(category)
                ? "Ikke kategorisert"
                : category[..Math.Min(category.Length, 50)];
            var description = string.IsNullOrWhiteSpace(record[3])
                ? category
                : record[3].Trim();
            description = description[..Math.Min(description.Length, 200)];

            rows.Add(new BankCsvRowDto
            {
                Description = description,
                Category = category,
                TopCategory = topCategory,
                Amount = amount
            });
        }

        if (rows.Count == 0 || rows.Count > MaxRows)
        {
            throw new ValidationException(
                "file",
                $"The CSV file must contain between 1 and {MaxRows} transaction rows.");
        }

        return new ParsedBankCsv(
            new DateOnly(year, month, 1),
            rows);
    }

    private static List<List<string>> ParseSemicolonCsv(string text)
    {
        var records = new List<List<string>>();
        var record = new List<string>();
        var field = new StringBuilder();
        var quoted = false;

        for (var index = 0; index < text.Length; index++)
        {
            var character = text[index];

            if (character == '"')
            {
                if (quoted && index + 1 < text.Length && text[index + 1] == '"')
                {
                    field.Append('"');
                    index++;
                }
                else
                {
                    quoted = !quoted;
                }
            }
            else if (character == ';' && !quoted)
            {
                record.Add(field.ToString());
                field.Clear();
            }
            else if ((character == '\r' || character == '\n') && !quoted)
            {
                if (character == '\r' && index + 1 < text.Length && text[index + 1] == '\n')
                {
                    index++;
                }

                record.Add(field.ToString());
                field.Clear();
                records.Add(record);
                record = [];
            }
            else
            {
                field.Append(character);
            }
        }

        if (field.Length > 0 || record.Count > 0)
        {
            record.Add(field.ToString());
            records.Add(record);
        }

        return records;
    }

    private sealed record ParsedBankCsv(
        DateOnly Month,
        List<BankCsvRowDto> Rows);
}
