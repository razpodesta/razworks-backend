/**
 * @fileoverview Entidad de Usuario (Dominio Puro - Refactored)
 * @module Core/Entities
 * @description
 * Modelo agnóstico de infraestructura.
 * Implementa Factory Pattern para validación y creación segura.
 */

import { Result } from '@razworks/shared/utils';
import { UserRole, RazterRealm } from '../shared/types'; // ✅ Importamos los Enums centralizados

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly realm: RazterRealm,
    public readonly createdAt: Date,
    public readonly avatarUrl?: string,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  /**
   * Factory Method: Única forma válida de instanciar un Usuario.
   * Aquí irían validaciones de dominio (ej: email válido, nombre no vacío).
   */
  public static create(
    id: string,
    email: string,
    fullName: string,
    role: UserRole,
    realm: RazterRealm = RazterRealm.THE_SCRIPT,
    createdAt: Date = new Date(),
    avatarUrl?: string,
    metadata?: Record<string, unknown>
  ): Result<User, Error> {

    // Validaciones de Invariantes de Dominio
    if (!email.includes('@')) {
      return Result.fail(new Error('Invalid email format in Domain Entity'));
    }
    if (fullName.length < 2) {
      return Result.fail(new Error('Full name is too short'));
    }

    const user = new User(
      id,
      email,
      fullName,
      role,
      realm,
      createdAt,
      avatarUrl,
      metadata
    );

    return Result.ok(user);
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Verifica acceso basado en la jerarquía de Reinos.
   */
  public hasAccessToRealm(requiredRealm: RazterRealm): boolean {
    const hierarchy: Record<RazterRealm, number> = {
      [RazterRealm.THE_SCRIPT]: 1,
      [RazterRealm.THE_COMPILER]: 2,
      [RazterRealm.THE_KERNEL]: 3,
      [RazterRealm.THE_NETWORK]: 4,
      [RazterRealm.THE_SOURCE]: 5
    };

    return hierarchy[this.realm] >= hierarchy[requiredRealm];
  }

  public get displayName(): string {
    return this.fullName || this.email.split('@')[0];
  }
}
