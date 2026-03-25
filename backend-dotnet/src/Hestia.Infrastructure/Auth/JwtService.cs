using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Hestia.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Hestia.Infrastructure.Auth;

public class JwtService : IJwtService
{
    private readonly string _secret;
    private readonly int _expiryHours;

    public JwtService(IConfiguration configuration)
    {
        _secret = configuration["JwtSettings:Secret"]
                  ?? "hestia-dev-secret-change-in-production-min-32-chars";
        _expiryHours = int.TryParse(configuration["JwtSettings:ExpiryHours"], out var h) ? h : 24;
    }

    public string GenerateToken(Guid userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("userId", userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: "hestia-api",
            audience: "hestia-client",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_expiryHours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public JwtClaims? ValidateToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var handler = new JwtSecurityTokenHandler();

            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "hestia-api",
                ValidateAudience = true,
                ValidAudience = "hestia-client",
                ValidateLifetime = true,
                IssuerSigningKey = key
            }, out var validated);

            var jwt = (JwtSecurityToken)validated;
            var userId = Guid.Parse(jwt.Claims.First(c => c.Type == "userId").Value);
            var email = jwt.Claims.First(c => c.Type == ClaimTypes.Email).Value;
            var role = jwt.Claims.First(c => c.Type == ClaimTypes.Role).Value;

            return new JwtClaims(userId, email, role);
        }
        catch
        {
            return null;
        }
    }
}
