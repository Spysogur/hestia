using FluentAssertions;
using Hestia.Application.DTOs;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class CreateCommunityTests
{
    private readonly Mock<ICommunityRepository> _repo = new();
    private readonly CreateCommunity _sut;

    public CreateCommunityTests() => _sut = new CreateCommunity(_repo.Object);

    [Fact]
    public async Task Should_create_community_successfully()
    {
        _repo.Setup(r => r.FindByNameAsync("Athens", It.IsAny<CancellationToken>())).ReturnsAsync((Community?)null);
        _repo.Setup(r => r.SaveAsync(It.IsAny<Community>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Community c, CancellationToken _) => c);

        var result = await _sut.ExecuteAsync(new CreateCommunityRequest
        {
            Name = "Athens", Description = "Athens community",
            Latitude = 37.98, Longitude = 23.73, RadiusKm = 5,
            Country = "GR", Region = "Attica"
        });

        result.Should().NotBeNull();
        result.Name.Should().Be("Athens");
    }

    [Fact]
    public async Task Should_throw_when_name_exists()
    {
        var existing = new Community("Athens", "Desc", 37.98, 23.73, 5, "GR", "Attica");
        _repo.Setup(r => r.FindByNameAsync("Athens", It.IsAny<CancellationToken>())).ReturnsAsync(existing);

        var act = () => _sut.ExecuteAsync(new CreateCommunityRequest
        {
            Name = "Athens", Description = "Dup", Latitude = 37.98, Longitude = 23.73,
            RadiusKm = 5, Country = "GR", Region = "Attica"
        });

        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*already exists*");
    }
}
