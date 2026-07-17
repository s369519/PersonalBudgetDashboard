using Budget.Application.Interfaces;
using Budget.Application.Services;
using Budget.Domain.Entities;

namespace Budget.Application.Tests;

public class DashboardServiceTests
{
    [Fact]
    public async Task SummaryRequestsOnlyCurrentCalendarMonth()
    {
        var repository = new DashboardRepositoryStub([]);
        var service = new DashboardService(repository);

        await service.GetSummaryAsync("user-1");

        var expectedFrom = new DateTime(
            DateTime.UtcNow.Year,
            DateTime.UtcNow.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);
        Assert.Equal(expectedFrom, repository.RequestedFrom);
        Assert.Equal(expectedFrom.AddMonths(1), repository.RequestedTo);
    }

    [Fact]
    public async Task TrendsGroupsIncomeAndExpensesByMonth()
    {
        var currentMonth = new DateTime(
            DateTime.UtcNow.Year,
            DateTime.UtcNow.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);
        var previousMonth = currentMonth.AddMonths(-1);
        var repository = new DashboardRepositoryStub(
        [
            new Transaction { Date = previousMonth.AddDays(2), Amount = 10_000 },
            new Transaction { Date = previousMonth.AddDays(3), Amount = -4_000 },
            new Transaction { Date = currentMonth.AddDays(2), Amount = 12_000 },
            new Transaction { Date = currentMonth.AddDays(3), Amount = -5_000 }
        ]);
        var service = new DashboardService(repository);

        var trends = (await service.GetMonthlyTrendsAsync("user-1", 2))
            .ToList();

        Assert.Equal(2, trends.Count);
        Assert.Equal(10_000, trends[0].Income);
        Assert.Equal(4_000, trends[0].Expenses);
        Assert.Equal(6_000, trends[0].Net);
        Assert.Equal(60, trends[0].SavingsRate);
        Assert.Equal(7_000, trends[1].Net);
    }

    private sealed class DashboardRepositoryStub(
        IEnumerable<Transaction> transactions)
        : IDashboardRepository
    {
        public DateTime RequestedFrom { get; private set; }
        public DateTime RequestedTo { get; private set; }

        public Task<IEnumerable<Transaction>> GetTransactionsAsync(
            string userId,
            DateTime from,
            DateTime to)
        {
            RequestedFrom = from;
            RequestedTo = to;
            return Task.FromResult(transactions);
        }

        public Task<decimal> GetTotalBalanceAsync(string userId) =>
            Task.FromResult(0m);
    }
}
