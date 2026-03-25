using Hestia.Domain.Enums;

namespace Hestia.Application.DTOs;

/// <summary>Request body for creating a help request.</summary>
public class CreateHelpRequestRequest
{
    /// <summary>ID of the active emergency this request is linked to.</summary>
    public Guid EmergencyId { get; set; }
    /// <summary>Type of help needed.</summary>
    public HelpType Type { get; set; }
    /// <summary>Priority level.</summary>
    public HelpRequestPriority Priority { get; set; }
    /// <summary>Short title.</summary>
    public string Title { get; set; } = null!;
    /// <summary>Detailed description of what is needed.</summary>
    public string Description { get; set; } = null!;
    /// <summary>Requester latitude.</summary>
    public double Latitude { get; set; }
    /// <summary>Requester longitude.</summary>
    public double Longitude { get; set; }
    /// <summary>Number of people that need help.</summary>
    public int NumberOfPeople { get; set; }
}

/// <summary>Response returned when a help request is created, including suggested matches.</summary>
public class CreateHelpRequestResponse
{
    /// <summary>The newly created help request.</summary>
    public object Request { get; set; } = null!;
    /// <summary>Top suggested offer matches sorted by score.</summary>
    public List<SuggestedMatch> SuggestedMatches { get; set; } = [];
}

/// <summary>A suggested match between a request and an offer.</summary>
public class SuggestedMatch
{
    /// <summary>ID of the suggested help offer.</summary>
    public Guid OfferId { get; set; }
    /// <summary>Distance to the offer in kilometres (1 decimal).</summary>
    public double DistanceKm { get; set; }
    /// <summary>Match quality score (higher is better).</summary>
    public double Score { get; set; }
}

/// <summary>Request body for creating a help offer.</summary>
public class CreateHelpOfferRequest
{
    /// <summary>ID of the active emergency this offer is for.</summary>
    public Guid EmergencyId { get; set; }
    /// <summary>Type of help being offered.</summary>
    public HelpType Type { get; set; }
    /// <summary>Description of what the volunteer can provide.</summary>
    public string Description { get; set; } = null!;
    /// <summary>Volunteer latitude.</summary>
    public double Latitude { get; set; }
    /// <summary>Volunteer longitude.</summary>
    public double Longitude { get; set; }
    /// <summary>Capacity (seats, beds, etc.).</summary>
    public int? Capacity { get; set; }
}

/// <summary>Result of a manual or auto match operation.</summary>
public class MatchPair
{
    public Guid RequestId { get; set; }
    public Guid OfferId { get; set; }
}
