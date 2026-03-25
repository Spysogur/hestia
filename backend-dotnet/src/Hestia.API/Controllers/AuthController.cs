using Hestia.Application.DTOs;
using Hestia.Application.UseCases;
using Microsoft.AspNetCore.Mvc;

namespace Hestia.API.Controllers;

/// <summary>Authentication — register and login.</summary>
[ApiController]
[Route("api/v1/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly RegisterUser _registerUser;
    private readonly LoginUser _loginUser;

    public AuthController(RegisterUser registerUser, LoginUser loginUser)
    {
        _registerUser = registerUser;
        _loginUser = loginUser;
    }

    /// <summary>Register a new user account.</summary>
    /// <response code="201">Registration successful.</response>
    /// <response code="400">Email already in use or validation error.</response>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var user = await _registerUser.ExecuteAsync(request, ct);
        return CreatedAtAction(nameof(Register), new
        {
            status = "success",
            data = new
            {
                user.Id,
                user.Email,
                user.FullName,
                user.Phone,
                Role = user.Role.ToString().ToUpperInvariant(),
                user.Skills,
                user.Vulnerabilities,
                user.Resources,
                user.IsVerified,
                user.CommunityId,
                user.CreatedAt
            }
        });
    }

    /// <summary>Login and receive a JWT bearer token.</summary>
    /// <response code="200">Login successful, token returned.</response>
    /// <response code="400">Invalid credentials.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _loginUser.ExecuteAsync(request, ct);
        return Ok(new { status = "success", data = result });
    }
}
