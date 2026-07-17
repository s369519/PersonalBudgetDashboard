using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Budget.Application.DTOs.Auth;
using Budget.Infrastructure.Identity;
using Budget.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Budget.Api.Authentication;

public class JwtTokenService
{
    private readonly JwtSettings _settings;

    public JwtTokenService(
        IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public AuthResponseDto CreateToken(
        ApplicationUser user,
        Household household)
    {
        if (string.IsNullOrWhiteSpace(_settings.Key))
        {
            throw new InvalidOperationException(
                "JWT signing key is not configured.");
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(
            _settings.ExpirationMinutes);

        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id),

            new(
                JwtRegisteredClaimNames.Email,
                user.Email ?? string.Empty),

            new(
                JwtRegisteredClaimNames.UniqueName,
                user.UserName ?? string.Empty),

            new(
                ClaimTypes.NameIdentifier,
                user.Id),

            new(
                ClaimTypes.Name,
                user.DisplayName),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_settings.Key));

        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler()
                .WriteToken(token),

            ExpiresAt = expiresAt,
            UserId = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email ?? string.Empty,
            HouseholdName = household.Name,
            HouseholdCode = household.JoinCode
        };
    }
}
