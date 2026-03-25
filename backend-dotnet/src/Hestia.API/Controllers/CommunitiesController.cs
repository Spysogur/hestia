using System.Security.Claims;
using Hestia.Application.DTOs;
using Hestia.Application.UseCases;
using Hestia.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hestia.API.Controllers;

/// <summary>Manage emergency-response communities.</summary>
[ApiController]
[Route("api/v1/communities")]
[Produces("application/json")]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunityRepository _communityRepository;
    private readonly CreateCommunity _createCommunity;
    private readonly JoinCommunity _joinCommunity;

    public CommunitiesController(
        ICommunityRepository communityRepository,
        CreateCommunity createCommunity,
        JoinCommunity joinCommunity)
    {
        _communityRepository = communityRepository;
        _createCommunity = createCommunity;
        _joinCommunity = joinCommunity;
    }

    /// <summary>List all communities.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var communities = await _communityRepository.FindAllAsync(ct);
        return Ok(new { status = "success", data = communities });
    }

    /// <summary>Find communities near a geographic point.</summary>
    /// <param name="lat">Latitude.</param>
    /// <param name="lng">Longitude.</param>
    /// <param name="radius">Search radius in kilometres (default 50).</param>
    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearby(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromQuery] double radius = 50,
        CancellationToken ct = default)
    {
        var communities = await _communityRepository.FindNearbyAsync(lat, lng, radius, ct);
        return Ok(new { status = "success", data = communities });
    }

    /// <summary>Create a new community. Requires authentication.</summary>
    /// <response code="201">Community created.</response>
    /// <response code="400">Name already taken.</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCommunityRequest request, CancellationToken ct)
    {
        var community = await _createCommunity.ExecuteAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = community.Id },
            new { status = "success", data = community });
    }

    /// <summary>Get a community by ID.</summary>
    /// <param name="id">Community UUID.</param>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var community = await _communityRepository.FindByIdAsync(id, ct);
        if (community is null)
            return NotFound(new { status = "error", message = "Community not found" });

        return Ok(new { status = "success", data = community });
    }

    /// <summary>Join a community. Requires authentication.</summary>
    /// <param name="id">Community UUID.</param>
    [HttpPost("{id:guid}/join")]
    [Authorize]
    public async Task<IActionResult> Join(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _joinCommunity.ExecuteAsync(userId, id, ct);
        return Ok(new { status = "success", data = user });
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue("userId")!);
}
