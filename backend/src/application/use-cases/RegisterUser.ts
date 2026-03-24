import { User, UserRole, VulnerabilityType } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface RegisterUserDTO {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  skills?: string[];
  vulnerabilities?: VulnerabilityType[];
  resources?: string[];
  latitude?: number;
  longitude?: number;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: RegisterUserDTO): Promise<User> {
    // Check if user already exists
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = new User({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      role: UserRole.MEMBER,
      skills: dto.skills ?? [],
      vulnerabilities: dto.vulnerabilities ?? [],
      resources: dto.resources ?? [],
      latitude: dto.latitude,
      longitude: dto.longitude,
      isVerified: false,
    });

    return this.userRepository.save(user);
  }
}
