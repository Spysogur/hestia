using System.Security.Claims;
using Hestia.Application.DTOs;
using Hestia.Application.UseCases;
using Hestia.Domain.Repositories;
using Hestia.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hestia.API.Controllers;

/// <summary>Manage help requests and offers during emergencies.</summary>
[ApiController]
[Route("api/v1/help")]
[Authorize]
[Produces("application/json")]
public class HelpController : ControllerBase
{
    private readonly IHelpRequestRepository _helpRequestRepository;
    private readonly IHelpOfferRepository _helpOfferRepository;
    private readonly CreateHelpRequest _createHelpRequest;
    private readonly CreateHelpOffer _createHelpOffer;
    private readonly MatchingService _matchingService;

    public HelpController(
        IHelpRequestRepository helpRequestRepository,
        IHelpOfferRepository helpOfferRepository,
        CreateHelpRequest createHelpRequest,
        CreateHelpOffer createHelpOffer,
        MatchingService matchingService)
    {
        _helpRequestRepository = helpRequestRepository;
        _helpOfferRepository = helpOfferRepository;
        _createHelpRequest = createHelpRequest;
        _createHelpOffer = createHelpOffer;
        _matchingService = matchingService;
    }

    // ── Help Requests ─────────────────────────────────────────────────────────

    /// <summary>Create a help request and receive suggested volunteer matches.</summary>
    /// <response code="201">Request created with top 5 suggested matches.</response>
    [HttpPost("requests")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRequest([FromBody] CreateHelpRequestRequest request, CancellationToken ct)
    {
        var requesterId = GetUserId();
        var result = await _createHelpRequest.ExecuteAsync(request, requesterId, ct);
        return StatusCode(201, new { status = "success", data = result });
    }

    /// <summary>Get all help requests for an emergency.</summary>
    /// <param name="emergencyId">Emergency UUID.</param>
    [HttpGet("requests/emergency/{emergencyId:guid}")]
    public async Task<IActionResult> GetRequestsByEmergency(Guid emergencyId, CancellationToken ct)
    {
        var requests = await _helpRequestRepository.FindByEmergencyAsync(emergencyId, ct);
        return Ok(new { status = "success", data = requests });
    }

    // ── Help Offers ───────────────────────────────────────────────────────────

    /// <summary>Create a help offer as a volunteer.</summary>
    /// <response code="201">Offer created.</response>
    [HttpPost("offers")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateOffer([FromBody] CreateHelpOfferRequest request, CancellationToken ct)
    {
        var volunteerId = GetUserId();
        var offer = await _createHelpOffer.ExecuteAsync(request, volunteerId, ct);
        return StatusCode(201, new { status = "success", data = offer });
    }

    /// <summary>Get all help offers for an emergency.</summary>
    /// <param name="emergencyId">Emergency UUID.</param>
    [HttpGet("offers/emergency/{emergencyId:guid}")]
    public async Task<IActionResult> GetOffersByEmergency(Guid emergencyId, CancellationToken ct)
    {
        var offers = await _helpOfferRepository.FindByEmergencyAsync(emergencyId, ct);
        return Ok(new { status = "success", data = offers });
    }

    // ── Matching ──────────────────────────────────────────────────────────────

    /// <summary>Manually match a specific help request with a specific help offer.</summary>
    /// <param name="requestId">Help request UUID.</param>
    /// <param name="offerId">Help offer UUID.</param>
    [HttpPost("match/{requestId:guid}/{offerId:guid}")]
    public async Task<IActionResult> Match(Guid requestId, Guid offerId, CancellationToken ct)
    {
        var request = await _helpRequestRepository.FindByIdAsync(requestId, ct);
        if (request is null)
            return NotFound(new { status = "error", message = "Help request not found" });

        var offer = await _helpOfferRepository.FindByIdAsync(offerId, ct);
        if (offer is null)
            return NotFound(new { status = "error", message = "Help offer not found" });

        request.MatchVolunteer(offer.VolunteerId);
        offer.MatchToRequest(requestId);

        var updatedRequest = await _helpRequestRepository.UpdateAsync(request, ct);
        var updatedOffer = await _helpOfferRepository.UpdateAsync(offer, ct);

        return Ok(new { status = "success", data = new { request = updatedRequest, offer = updatedOffer } });
    }

    /// <summary>
    /// Auto-match all open requests with available offers for an emergency.
    /// Uses the MatchingService scoring algorithm with urgent-first ordering.
    /// </summary>
    /// <param name="emergencyId">Emergency UUID.</param>
    [HttpPost("auto-match/{emergencyId:guid}")]
    public async Task<IActionResult> AutoMatch(Guid emergencyId, CancellationToken ct)
    {
        var openRequests = await _helpRequestRepository.FindOpenByEmergencyAsync(emergencyId, ct);
        var availableOffers = await _helpOfferRepository.FindAvailableByEmergencyAsync(emergencyId, ct);

        var matchResults = _matchingService.AutoMatch(openRequests, availableOffers);
        var matches = new List<MatchPair>();

        foreach (var result in matchResults)
        {
            result.Request.MatchVolunteer(result.Offer.VolunteerId);
            result.Offer.MatchToRequest(result.Request.Id);

            await _helpRequestRepository.UpdateAsync(result.Request, ct);
            await _helpOfferRepository.UpdateAsync(result.Offer, ct);

            matches.Add(new MatchPair { RequestId = result.Request.Id, OfferId = result.Offer.Id });
        }

        return Ok(new { status = "success", data = new { matches } });
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue("userId")!);
}
