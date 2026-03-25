namespace Hestia.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(Guid userId, string email, string role);
    JwtClaims? ValidateToken(string token);
}

public record JwtClaims(Guid UserId, string Email, string Role);
