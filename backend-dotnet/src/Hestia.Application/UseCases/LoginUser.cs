using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class LoginUser
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public LoginUser(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> ExecuteAsync(LoginRequest dto, CancellationToken ct = default)
    {
        var user = await _userRepository.FindByEmailAsync(dto.Email, ct);
        if (user is null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new ApplicationException("Invalid email or password");

        var token = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString().ToUpperInvariant());

        return new LoginResponse
        {
            Token = token,
            User = new UserSummary
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString().ToUpperInvariant(),
                CommunityId = user.CommunityId
            }
        };
    }
}
