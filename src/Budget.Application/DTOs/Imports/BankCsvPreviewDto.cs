namespace Budget.Application.DTOs.Imports;

public class BankCsvPreviewDto
{
    public DateOnly Month { get; set; }
    public DateOnly TransactionDate { get; set; }
    public int RowCount { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public IEnumerable<string> Categories { get; set; } = [];
    public IEnumerable<BankCsvRowDto> Rows { get; set; } = [];
}
