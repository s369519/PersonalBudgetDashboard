using Budget.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Budget.Application.Interfaces;
using Budget.Application.Services;
using Budget.Infrastructure.Repositories;
using Budget.Application.Interfaces;
using Budget.Application.Services;
using Budget.Infrastructure.Repositories;
using Budget.Infrastructure.Repositories;
using Budget.Application.Services;
using Budget.Application.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<BudgetDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<AccountService>();


builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<CategoryService>();

builder.Services.AddScoped<
    ITransactionRepository,
    TransactionRepository>();

builder.Services.AddScoped<TransactionService>();

builder.Services.AddScoped<
    IDashboardRepository,
    DashboardRepository>();

builder.Services.AddScoped<DashboardService>();


// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

