namespace Hestia.Application.DTOs;

/// <summary>Request body for creating a new community.</summary>
public class CreateCommunityRequest
{
    /// <summary>Unique community name.</summary>
    public string Name { get; set; } = null!;
    /// <summary>Short description of the community.</summary>
    public string Description { get; set; } = null!;
    /// <summary>Center latitude of the community area.</summary>
    public double Latitude { get; set; }
    /// <summary>Center longitude of the community area.</summary>
    public double Longitude { get; set; }
    /// <summary>Coverage radius in kilometres.</summary>
    public double RadiusKm { get; set; }
    /// <summary>Country name.</summary>
    public string Country { get; set; } = null!;
    /// <summary>Region / state / province.</summary>
    public string Region { get; set; } = null!;
}
