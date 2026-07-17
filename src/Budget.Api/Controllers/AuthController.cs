using Budget.Api.Authentication;
using Budget.Application.DTOs.Auth;
using Budget.Infrastructure.Identity;
using Budget.Infrastructure.Data;
using Budget.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenService _jwtTokenService;
    private readonly BudgetDbContext _dbContext;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        JwtTokenService jwtTokenService,
        BudgetDbContext dbContext)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _dbContext = dbContext;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(
        RegisterDto dto)
    {
        var normalizedEmail = dto.Email
            .Trim()
            .ToLowerInvariant();

        var existingUser =
            await _userManager.FindByEmailAsync(normalizedEmail);

        if (existingUser is not null)
        {
            return Conflict(new
            {
                title = "An account with this email already exists."
            });
        }

        Household household;
        var householdCode = dto.HouseholdCode?.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(householdCode))
        {
            household = new Household
            {
                Id = Guid.NewGuid(),
                Name = $"{dto.DisplayName.Trim()}'s household",
                JoinCode = await CreateUniqueHouseholdCodeAsync()
            };

            _dbContext.Households.Add(household);
        }
        else
        {
            var existingHousehold = await _dbContext.Households
                .SingleOrDefaultAsync(item =>
                    item.JoinCode == householdCode);

            if (existingHousehold is null)
            {
                return BadRequest(new
                {
                    title = "The household code is invalid."
                });
            }

            household = existingHousehold;
        }

        var user = new ApplicationUser
        {
            DisplayName = dto.DisplayName.Trim(),
            Email = normalizedEmail,
            UserName = normalizedEmail,
            HouseholdId = household.Id
        };

        if (_dbContext.Entry(household).State == EntityState.Added)
        {
            await _dbContext.SaveChangesAsync();
        }

        var result = await _userManager.CreateAsync(
            user,
            dto.Password);

        if (!result.Succeeded)
        {
            if (!await _dbContext.Users.AnyAsync(item =>
                    item.HouseholdId == household.Id))
            {
                _dbContext.Households.Remove(household);
                await _dbContext.SaveChangesAsync();
            }

            var errors = result.Errors
                .GroupBy(error => error.Code)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .Select(error => error.Description)
                        .ToArray());

            return BadRequest(new
            {
                title = "Registration failed.",
                status = StatusCodes.Status400BadRequest,
                errors
            });
        }

        return Ok(_jwtTokenService.CreateToken(user, household));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        LoginDto dto)
    {
        var normalizedEmail = dto.Email
            .Trim()
            .ToLowerInvariant();

        var user =
            await _userManager.FindByEmailAsync(normalizedEmail);

        if (user is null)
        {
            return Unauthorized(new
            {
                title = "Invalid email or password."
            });
        }

        var passwordIsValid =
            await _userManager.CheckPasswordAsync(
                user,
                dto.Password);

        if (!passwordIsValid)
        {
            return Unauthorized(new
            {
                title = "Invalid email or password."
            });
        }

        var household = await EnsureHouseholdAsync(user);

        return Ok(_jwtTokenService.CreateToken(user, household));
    }

    private async Task<Household> EnsureHouseholdAsync(
        ApplicationUser user)
    {
        if (user.HouseholdId is Guid householdId)
        {
            var existingHousehold = await _dbContext.Households
                .FindAsync(householdId);

            if (existingHousehold is not null)
            {
                return existingHousehold;
            }
        }

        var household = new Household
        {
            Id = Guid.NewGuid(),
            Name = $"{user.DisplayName}'s household",
            JoinCode = await CreateUniqueHouseholdCodeAsync()
        };

        _dbContext.Households.Add(household);
        user.HouseholdId = household.Id;
        await _dbContext.SaveChangesAsync();

        return household;
    }

    private async Task<string> CreateUniqueHouseholdCodeAsync()
    {
        string code;

        do
        {
            code = Guid.NewGuid()
                .ToString("N")[..8]
                .ToUpperInvariant();
        }
        while (await _dbContext.Households.AnyAsync(
            household => household.JoinCode == code));

        return code;
    }
}
