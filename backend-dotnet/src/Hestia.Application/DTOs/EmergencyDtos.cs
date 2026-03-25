using Hestia.Domain.Enums;

namespace Hestia.Application.DTOs;

/// <summary>Request body for activating a new emergency.</summary>
public class ActivateEmergencyRequest
{
    /// <summary>Community this emergency belongs to.</summary>
    public Guid CommunityId { get; set; }
    /// <summary>Type of natural disaster or emergency.</summary>
    public EmergencyType Type { get; set; }
    /// <summary>Initial severity level.</summary>
    public EmergencySeverity Severity { get; set; }
    /// <summary>Short descriptive title.</summary>
    public string Title { get; set; } = null!;
    /// <summary>Full description of the situation.</summary>
    public string Description { get; set; } = null!;
    /// <summary>Epicentre latitude.</summary>
    public double Latitude { get; set; }
    /// <summary>Epicentre longitude.</summary>
    public double Longitude { get; set; }
    /// <summary>Affected radius in kilometres.</summary>
    public double RadiusKm { get; set; }
}
