using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class RegisterUser
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUser(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<User> ExecuteAsync(RegisterRequest dto, CancellationToken ct = default)
    {
        var existing = await _userRepository.FindByEmailAsync(dto.Email, ct);
        if (existing is not null)
            throw new ApplicationException("User with this email already exists");

        var hash = _passwordHasher.Hash(dto.Password);

        var user = new User(
            email: dto.Email,
            passwordHash: hash,
            fullName: dto.FullName,
            phone: dto.Phone,
            skills: dto.Skills,
            vulnerabilities: dto.Vulnerabilities,
            resources: dto.Resources,
            latitude: dto.Latitude,
            longitude: dto.Longitude);

        return await _userRepository.SaveAsync(user, ct);
    }
}
