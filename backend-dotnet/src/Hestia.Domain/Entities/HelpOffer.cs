using Hestia.Domain.Enums;

namespace Hestia.Domain.Entities;

/// <summary>Represents a volunteer's offer to help during an emergency.</summary>
public class HelpOffer
{
    public Guid Id { get; private set; }
    public Guid EmergencyId { get; set; }
    public Guid VolunteerId { get; set; }
    public HelpType Type { get; set; }
    public HelpOfferStatus Status { get; set; }
    public string Description { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int Capacity { get; set; }
    public Guid? MatchedRequestId { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Emergency? Emergency { get; set; }

    private HelpOffer() { }

    public HelpOffer(
        Guid emergencyId,
        Guid volunteerId,
        HelpType type,
        string description,
        double latitude,
        double longitude,
        int capacity = 1)
    {
        Id = Guid.NewGuid();
        EmergencyId = emergencyId;
        VolunteerId = volunteerId;
        Type = type;
        Status = HelpOfferStatus.Available;
        Description = description;
        Latitude = latitude;
        Longitude = longitude;
        Capacity = capacity;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsAvailable() => Status == HelpOfferStatus.Available;

    public void MatchToRequest(Guid requestId)
    {
        MatchedRequestId = requestId;
        Status = HelpOfferStatus.Matched;
        UpdatedAt = DateTime.UtcNow;
    }

    public void StartProgress()
    {
        Status = HelpOfferStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = HelpOfferStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Withdraw()
    {
        Status = HelpOfferStatus.Withdrawn;
        UpdatedAt = DateTime.UtcNow;
    }
}
