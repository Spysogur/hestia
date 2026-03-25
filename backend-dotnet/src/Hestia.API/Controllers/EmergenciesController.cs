using System.Security.Claims;
using Hestia.Application.DTOs;
using Hestia.Application.UseCases;
using Hestia.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hestia.API.Controllers;

/// <summary>Manage active emergencies within communities.</summary>
[ApiController]
[Route("api/v1/emergencies")]
[Produces("application/json")]
public class EmergenciesController : ControllerBase
{
    private readonly IEmergencyRepository _emergencyRepository;
    private readonly ActivateEmergency _activateEmergency;
    private readonly ResolveEmergency _resolveEmergency;
    private readonly EscalateEmergency _escalateEmergency;

    public EmergenciesController(
        IEmergencyRepository emergencyRepository,
        ActivateEmergency activateEmergency,
        ResolveEmergency resolveEmergency,
        EscalateEmergency escalateEmergency)
    {
        _emergencyRepository = emergencyRepository;
        _activateEmergency = activateEmergency;
        _resolveEmergency = resolveEmergency;
        _escalateEmergency = escalateEmergency;
    }

    /// <summary>Get active emergencies, optionally filtered by community.</summary>
    /// <param name="communityId">Optional community UUID filter.</param>
    [HttpGet("active")]
    public async Task<IActionResult> GetActive([FromQuery] Guid? communityId, CancellationToken ct)
    {
        var emergencies = communityId.HasValue
            ? await _emergencyRepository.FindActiveByCommunityAsync(communityId.Value, ct)
            : await _emergencyRepository.FindActiveAsync(ct);

        return Ok(new { status = "success", data = emergencies });
    }

    /// <summary>Activate (create) a new emergency. Requires authentication.</summary>
    /// <response code="201">Emergency created and community notified.</response>
    [HttpPost("activate")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Activate([FromBody] ActivateEmergencyRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var emergency = await _activateEmergency.ExecuteAsync(request, userId, ct);
        return CreatedAtAction(nameof(GetById), new { id = emergency.Id },
            new { status = "success", data = emergency });
    }

    /// <summary>Get an emergency by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var emergency = await _emergencyRepository.FindByIdAsync(id, ct);
        if (emergency is null)
            return NotFound(new { status = "error", message = "Emergency not found" });

        return Ok(new { status = "success", data = emergency });
    }

    /// <summary>Resolve an emergency. Requires authentication.</summary>
    [HttpPut("{id:guid}/resolve")]
    [Authorize]
    public async Task<IActionResult> Resolve(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var emergency = await _resolveEmergency.ExecuteAsync(id, userId, ct);
        return Ok(new { status = "success", data = emergency });
    }

    /// <summary>Escalate an emergency's severity one level. Requires authentication.</summary>
    [HttpPut("{id:guid}/escalate")]
    [Authorize]
    public async Task<IActionResult> Escalate(Guid id, CancellationToken ct)
    {
        var emergency = await _escalateEmergency.ExecuteAsync(id, ct);
        return Ok(new { status = "success", data = emergency });
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue("userId")!);
}
