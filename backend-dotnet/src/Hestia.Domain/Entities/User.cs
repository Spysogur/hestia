using Hestia.Domain.Enums;

namespace Hestia.Domain.Entities;

/// <summary>Represents a registered Hestia user.</summary>
public class User
{
    public Guid Id { get; private set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public UserRole Role { get; set; }
    public List<string> Skills { get; set; } = [];
    public List<VulnerabilityType> Vulnerabilities { get; set; } = [];
    public List<string> Resources { get; set; } = [];
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public Guid? CommunityId { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }

    private User() { }

    public User(
        string email,
        string passwordHash,
        string fullName,
        string phone,
        UserRole role = UserRole.Member,
        List<string>? skills = null,
        List<VulnerabilityType>? vulnerabilities = null,
        List<string>? resources = null,
        double? latitude = null,
        double? longitude = null,
        Guid? communityId = null)
    {
        Id = Guid.NewGuid();
        Email = email;
        PasswordHash = passwordHash;
        FullName = fullName;
        Phone = phone;
        Role = role;
        Skills = skills ?? [];
        Vulnerabilities = vulnerabilities ?? [];
        Resources = resources ?? [];
        Latitude = latitude;
        Longitude = longitude;
        CommunityId = communityId;
        IsVerified = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLocation(double lat, double lng)
    {
        Latitude = lat;
        Longitude = lng;
        UpdatedAt = DateTime.UtcNow;
    }

    public void JoinCommunity(Guid communityId)
    {
        CommunityId = communityId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddSkill(string skill)
    {
        if (!Skills.Contains(skill))
        {
            Skills.Add(skill);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void AddResource(string resource)
    {
        if (!Resources.Contains(resource))
        {
            Resources.Add(resource);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public bool IsVulnerable() => Vulnerabilities.Count > 0;

    public bool HasVehicle() => !Vulnerabilities.Contains(VulnerabilityType.NoVehicle);
}
