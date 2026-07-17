namespace Budget.Application.DTOs.Imports;

public class BankCsvImportResultDto
{
    public DateOnly Month { get; set; }
    public int ImportedTransactions { get; set; }
    public int CreatedCategories { get; set; }
}
