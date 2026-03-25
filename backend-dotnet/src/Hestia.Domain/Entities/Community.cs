namespace Hestia.Domain.Entities;

/// <summary>Represents a geographic community that coordinates emergency response.</summary>
public class Community
{
    public Guid Id { get; private set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusKm { get; set; }
    public string Country { get; set; } = null!;
    public string Region { get; set; } = null!;
    public bool IsActive { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<Emergency> Emergencies { get; set; } = [];

    private Community() { }

    public Community(
        string name,
        string description,
        double latitude,
        double longitude,
        double radiusKm,
        string country,
        string region)
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        Latitude = latitude;
        Longitude = longitude;
        RadiusKm = radiusKm;
        Country = country;
        Region = region;
        IsActive = true;
        MemberCount = 0;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void IncrementMemberCount()
    {
        MemberCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DecrementMemberCount()
    {
        if (MemberCount > 0)
        {
            MemberCount--;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public bool IsWithinRadius(double lat, double lng)
        => HaversineDistance(lat, lng) <= RadiusKm;

    private double HaversineDistance(double lat, double lng)
    {
        const double R = 6371;
        var dLat = ToRad(lat - Latitude);
        var dLng = ToRad(lng - Longitude);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(Latitude)) * Math.Cos(ToRad(lat))
              * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRad(double deg) => deg * (Math.PI / 180);
}
