using Hestia.Domain.Enums;

namespace Hestia.Domain.Entities;

/// <summary>Represents a request for help during an emergency.</summary>
public class HelpRequest
{
    public Guid Id { get; private set; }
    public Guid EmergencyId { get; set; }
    public Guid RequesterId { get; set; }
    public HelpType Type { get; set; }
    public HelpRequestPriority Priority { get; set; }
    public HelpRequestStatus Status { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int NumberOfPeople { get; set; }
    public Guid? MatchedVolunteerId { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation
    public Emergency? Emergency { get; set; }

    private HelpRequest() { }

    public HelpRequest(
        Guid emergencyId,
        Guid requesterId,
        HelpType type,
        HelpRequestPriority priority,
        string title,
        string description,
        double latitude,
        double longitude,
        int numberOfPeople)
    {
        Id = Guid.NewGuid();
        EmergencyId = emergencyId;
        RequesterId = requesterId;
        Type = type;
        Priority = priority;
        Status = HelpRequestStatus.Open;
        Title = title;
        Description = description;
        Latitude = latitude;
        Longitude = longitude;
        NumberOfPeople = numberOfPeople;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsOpen() => Status == HelpRequestStatus.Open;

    public bool IsUrgent() => Priority == HelpRequestPriority.Urgent;

    public void MatchVolunteer(Guid volunteerId)
    {
        MatchedVolunteerId = volunteerId;
        Status = HelpRequestStatus.Matched;
        UpdatedAt = DateTime.UtcNow;
    }

    public void StartProgress()
    {
        Status = HelpRequestStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = HelpRequestStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        Status = HelpRequestStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void EscalatePriority()
    {
        Priority = Priority switch
        {
            HelpRequestPriority.Low => HelpRequestPriority.Medium,
            HelpRequestPriority.Medium => HelpRequestPriority.High,
            HelpRequestPriority.High => HelpRequestPriority.Urgent,
            _ => Priority
        };
        UpdatedAt = DateTime.UtcNow;
    }
}
