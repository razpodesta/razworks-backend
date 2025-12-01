// libs/core/src/ports/repositories/user.repository.port.ts
/**
 * @fileoverview Puerto del Repositorio de Usuarios (Result Pattern)
 * @module Core/Ports
 * @description Contrato actualizado para retornar Result<User, Error>.
 */
import { User } from '../../entities/user.entity';
import { Result } from '@razworks/shared/utils';

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<Result<User | null, Error>>;
  abstract findByEmail(email: string): Promise<Result<User | null, Error>>;
  abstract save(user: User): Promise<Result<void, Error>>;
  abstract exists(email: string): Promise<Result<boolean, Error>>;
}
