namespace Budget.Domain.Entities;

public class Household
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string JoinCode { get; set; } = string.Empty;
}
