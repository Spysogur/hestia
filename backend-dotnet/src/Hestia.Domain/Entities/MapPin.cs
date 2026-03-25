using Hestia.Domain.Enums;
using System.Text.Json;

namespace Hestia.Domain.Entities;

/// <summary>Represents a pinned location on the emergency map.</summary>
public class MapPin
{
    public Guid Id { get; private set; }
    public Guid EmergencyId { get; set; }
    public Guid CreatedBy { get; set; }
    public MapPinType Type { get; set; }
    public string Label { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public JsonDocument? Data { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Emergency? Emergency { get; set; }

    private MapPin() { }

    public MapPin(
        Guid emergencyId,
        Guid createdBy,
        MapPinType type,
        string label,
        double latitude,
        double longitude,
        JsonDocument? data = null)
    {
        Id = Guid.NewGuid();
        EmergencyId = emergencyId;
        CreatedBy = createdBy;
        Type = type;
        Label = label;
        Latitude = latitude;
        Longitude = longitude;
        Data = data;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
