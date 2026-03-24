import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/use-cases/RegisterUser';
import { IPasswordVerifier } from '../../application/use-cases/LoginUser';

export class BcryptPasswordHasher implements IPasswordHasher, IPasswordVerifier {
  private readonly rounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
