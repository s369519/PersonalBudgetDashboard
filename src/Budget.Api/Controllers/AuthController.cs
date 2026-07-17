using Budget.Api.Authentication;
using Budget.Application.DTOs.Auth;
using Budget.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        JwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
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

        var user = new ApplicationUser
        {
            DisplayName = dto.DisplayName.Trim(),
            Email = normalizedEmail,
            UserName = normalizedEmail
        };

        var result = await _userManager.CreateAsync(
            user,
            dto.Password);

        if (!result.Succeeded)
        {
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

        return Ok(_jwtTokenService.CreateToken(user));
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

        return Ok(_jwtTokenService.CreateToken(user));
    }
}