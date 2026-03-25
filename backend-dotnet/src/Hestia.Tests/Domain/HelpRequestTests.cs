using FluentAssertions;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Tests.Domain;

public class HelpRequestTests
{
    private HelpRequest CreateRequest(HelpRequestPriority priority = HelpRequestPriority.Medium)
    {
        return new HelpRequest(
            emergencyId: Guid.NewGuid(),
            requesterId: Guid.NewGuid(),
            type: HelpType.Medical,
            priority: priority,
            title: "Need medical help",
            description: "Injured person needs medical assistance",
            latitude: 37.9838,
            longitude: 23.7275,
            numberOfPeople: 2);
    }

    [Fact]
    public void New_request_should_be_open()
    {
        var request = CreateRequest();
        request.IsOpen().Should().BeTrue();
        request.Status.Should().Be(HelpRequestStatus.Open);
    }

    [Fact]
    public void MatchVolunteer_should_update_status_and_volunteerId()
    {
        var request = CreateRequest();
        var volunteerId = Guid.NewGuid();

        request.MatchVolunteer(volunteerId);

        request.Status.Should().Be(HelpRequestStatus.Matched);
        request.MatchedVolunteerId.Should().Be(volunteerId);
        request.IsOpen().Should().BeFalse();
    }

    [Fact]
    public void Complete_should_set_status_and_completedAt()
    {
        var request = CreateRequest();
        request.MatchVolunteer(Guid.NewGuid());

        request.Complete();

        request.Status.Should().Be(HelpRequestStatus.Completed);
        request.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void EscalatePriority_should_increase_one_level()
    {
        var request = CreateRequest(HelpRequestPriority.Low);

        request.EscalatePriority();
        request.Priority.Should().Be(HelpRequestPriority.Medium);

        request.EscalatePriority();
        request.Priority.Should().Be(HelpRequestPriority.High);

        request.EscalatePriority();
        request.Priority.Should().Be(HelpRequestPriority.Urgent);
    }

    [Fact]
    public void IsUrgent_should_return_true_for_urgent_priority()
    {
        var request = CreateRequest(HelpRequestPriority.Urgent);
        request.IsUrgent().Should().BeTrue();
    }

    [Fact]
    public void Cancel_should_set_cancelled_status()
    {
        var request = CreateRequest();
        request.Cancel();
        request.Status.Should().Be(HelpRequestStatus.Cancelled);
    }
}
