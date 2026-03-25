using Hestia.Application.DTOs;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class CreateCommunity
{
    private readonly ICommunityRepository _communityRepository;

    public CreateCommunity(ICommunityRepository communityRepository)
        => _communityRepository = communityRepository;

    public async Task<Community> ExecuteAsync(CreateCommunityRequest dto, CancellationToken ct = default)
    {
        var existing = await _communityRepository.FindByNameAsync(dto.Name, ct);
        if (existing is not null)
            throw new ApplicationException("A community with this name already exists");

        var community = new Community(
            dto.Name, dto.Description,
            dto.Latitude, dto.Longitude,
            dto.RadiusKm, dto.Country, dto.Region);

        return await _communityRepository.SaveAsync(community, ct);
    }
}
