namespace Budget.Application.DTOs.Imports;

public class BankCsvRowDto
{
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string TopCategory { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
