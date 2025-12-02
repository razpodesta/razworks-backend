import { User } from '../../entities/user.entity';
import { Result } from '@razworks/shared-utils'; // ✅ FIX
import { AppError } from '../../shared/app-error';

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<Result<User | null, AppError.DatabaseError>>;
  abstract findByEmail(email: string): Promise<Result<User | null, AppError.DatabaseError>>;
  abstract save(user: User): Promise<Result<void, AppError.DatabaseError>>;
  abstract exists(email: string): Promise<Result<boolean, AppError.DatabaseError>>;
}
