using Hestia.Domain.Enums;

namespace Hestia.Application.DTOs;

/// <summary>Request body for user registration.</summary>
public class RegisterRequest
{
    /// <summary>User's email address.</summary>
    public string Email { get; set; } = null!;
    /// <summary>Plaintext password (min 8 chars).</summary>
    public string Password { get; set; } = null!;
    /// <summary>Full display name.</summary>
    public string FullName { get; set; } = null!;
    /// <summary>Contact phone number.</summary>
    public string Phone { get; set; } = null!;
    /// <summary>Skills the user can offer (e.g. first-aid, driving).</summary>
    public List<string>? Skills { get; set; }
    /// <summary>Vulnerability flags for priority SMS alerts.</summary>
    public List<VulnerabilityType>? Vulnerabilities { get; set; }
    /// <summary>Physical resources the user can provide (e.g. truck, generator).</summary>
    public List<string>? Resources { get; set; }
    /// <summary>Initial latitude.</summary>
    public double? Latitude { get; set; }
    /// <summary>Initial longitude.</summary>
    public double? Longitude { get; set; }
}

/// <summary>Request body for login.</summary>
public class LoginRequest
{
    /// <summary>Registered email address.</summary>
    public string Email { get; set; } = null!;
    /// <summary>Plaintext password.</summary>
    public string Password { get; set; } = null!;
}

/// <summary>Successful login response.</summary>
public class LoginResponse
{
    /// <summary>JWT bearer token.</summary>
    public string Token { get; set; } = null!;
    /// <summary>Basic user info.</summary>
    public UserSummary User { get; set; } = null!;
}

/// <summary>Summary of authenticated user info embedded in the login response.</summary>
public class UserSummary
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public Guid? CommunityId { get; set; }
}
