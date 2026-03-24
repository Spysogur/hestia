import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { JwtService } from '../../infrastructure/auth/jwt';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface IPasswordVerifier {
  compare(password: string, hash: string): Promise<boolean>;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    communityId?: string;
  };
}

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordVerifier: IPasswordVerifier,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: LoginUserDTO): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await this.passwordVerifier.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        communityId: user.communityId,
      },
    };
  }
}
