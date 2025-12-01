/**
 * @fileoverview Puerto del Repositorio de Usuarios (Hexagonal)
 * @module Core/Ports
 * @author Raz Podestá & LIA Legacy
 * @description
 * Contrato estricto para la persistencia de usuarios.
 * Retorna Results para manejo de errores explícito (sin throw).
 */

import { User } from '../../entities/user.entity';
import { Result } from '@razworks/shared/utils';
import { AppError } from '../../shared/app-error';

export abstract class UserRepositoryPort {
  /**
   * Busca un usuario por su ID único.
   */
  abstract findById(id: string): Promise<Result<User | null, AppError.DatabaseError>>;

  /**
   * Busca un usuario por su email exacto.
   */
  abstract findByEmail(email: string): Promise<Result<User | null, AppError.DatabaseError>>;

  /**
   * Persiste un usuario (Creación o Actualización completa).
   * Debe manejar la transaccionalidad interna.
   */
  abstract save(user: User): Promise<Result<void, AppError.DatabaseError>>;

  /**
   * Verificación ligera de existencia.
   */
  abstract exists(email: string): Promise<Result<boolean, AppError.DatabaseError>>;
}
