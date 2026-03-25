using Hestia.Domain.Enums;

namespace Hestia.Domain.Entities;

/// <summary>Represents an active emergency event within a community.</summary>
public class Emergency
{
    public Guid Id { get; private set; }
    public Guid CommunityId { get; set; }
    public EmergencyType Type { get; set; }
    public EmergencySeverity Severity { get; set; }
    public EmergencyStatus Status { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusKm { get; set; }
    public Guid ActivatedBy { get; set; }
    public Guid? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Community? Community { get; set; }
    public ICollection<HelpRequest> HelpRequests { get; set; } = [];
    public ICollection<HelpOffer> HelpOffers { get; set; } = [];

    private Emergency() { }

    public Emergency(
        Guid communityId,
        EmergencyType type,
        EmergencySeverity severity,
        string title,
        string description,
        double latitude,
        double longitude,
        double radiusKm,
        Guid activatedBy)
    {
        Id = Guid.NewGuid();
        CommunityId = communityId;
        Type = type;
        Severity = severity;
        Status = EmergencyStatus.Active;
        Title = title;
        Description = description;
        Latitude = latitude;
        Longitude = longitude;
        RadiusKm = radiusKm;
        ActivatedBy = activatedBy;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsActive() => Status == EmergencyStatus.Active;

    public bool IsCritical() => Severity == EmergencySeverity.Critical;

    public void Escalate()
    {
        Severity = Severity switch
        {
            EmergencySeverity.Low => EmergencySeverity.Medium,
            EmergencySeverity.Medium => EmergencySeverity.High,
            EmergencySeverity.High => EmergencySeverity.Critical,
            _ => Severity
        };
        UpdatedAt = DateTime.UtcNow;
    }

    public void Resolve(Guid resolvedBy)
    {
        Status = EmergencyStatus.Resolved;
        ResolvedBy = resolvedBy;
        ResolvedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(Guid cancelledBy)
    {
        Status = EmergencyStatus.Cancelled;
        ResolvedBy = cancelledBy;
        ResolvedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ExpandRadius(double additionalKm)
    {
        RadiusKm += additionalKm;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsLocationAffected(double lat, double lng)
    {
        const double R = 6371;
        var dLat = (lat - Latitude) * Math.PI / 180;
        var dLng = (lng - Longitude) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(Latitude * Math.PI / 180)
              * Math.Cos(lat * Math.PI / 180)
              * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c <= RadiusKm;
    }
}
