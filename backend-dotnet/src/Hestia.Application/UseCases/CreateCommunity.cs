using Hestia.Application.DTOs;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class CreateCommunity
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;

    public CreateCommunity(ICommunityRepository communityRepository, IUserRepository userRepository)
    {
        _communityRepository = communityRepository;
        _userRepository = userRepository;
    }

    public async Task<Community> ExecuteAsync(CreateCommunityRequest dto, Guid creatorId, CancellationToken ct = default)
    {
        var existing = await _communityRepository.FindByNameAsync(dto.Name, ct);
        if (existing is not null)
            throw new ApplicationException("A community with this name already exists");

        var community = new Community(
            dto.Name, dto.Description,
            dto.Latitude, dto.Longitude,
            dto.RadiusKm, dto.Country, dto.Region);

        var saved = await _communityRepository.SaveAsync(community, ct);

        // Auto-join creator as coordinator
        var creator = await _userRepository.FindByIdAsync(creatorId, ct);
        if (creator is not null)
        {
            creator.JoinCommunity(saved.Id);
            creator.Role = UserRole.Coordinator;
            await _userRepository.UpdateAsync(creator, ct);
            saved.IncrementMemberCount();
            await _communityRepository.UpdateAsync(saved, ct);
        }

        return saved;
    }
}
