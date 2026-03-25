using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class JoinCommunity
{
    private readonly IUserRepository _userRepository;
    private readonly ICommunityRepository _communityRepository;

    public JoinCommunity(IUserRepository userRepository, ICommunityRepository communityRepository)
    {
        _userRepository = userRepository;
        _communityRepository = communityRepository;
    }

    public async Task<User> ExecuteAsync(Guid userId, Guid communityId, CancellationToken ct = default)
    {
        var user = await _userRepository.FindByIdAsync(userId, ct)
            ?? throw new ApplicationException("User not found");

        var community = await _communityRepository.FindByIdAsync(communityId, ct)
            ?? throw new ApplicationException("Community not found");

        if (!community.IsActive)
            throw new ApplicationException("Community is not active");

        user.JoinCommunity(communityId);
        var updated = await _userRepository.UpdateAsync(user, ct);

        community.IncrementMemberCount();
        await _communityRepository.UpdateAsync(community, ct);

        return updated;
    }
}
