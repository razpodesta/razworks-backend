// libs/core/src/entities/user.entity.ts
/**
 * @fileoverview Entidad de Usuario (Dominio Puro - Updated)
 * @module Core/Entities
 * @description Modelo agnóstico de infraestructura. Alineado con GAMIFICATION_CODEX.
 */

export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';

// CAMBIO CRÍTICO: De Peces a Reinos
export type RazterRealm =
  | 'THE_SCRIPT'
  | 'THE_COMPILER'
  | 'THE_KERNEL'
  | 'THE_NETWORK'
  | 'THE_SOURCE';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly realm: RazterRealm = 'THE_SCRIPT', // Nuevo Default
    public readonly createdAt: Date,
    public readonly avatarUrl?: string,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  public isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  /**
   * Verifica acceso basado en la jerarquía de Reinos.
   */
  public hasAccessToRealm(requiredRealm: RazterRealm): boolean {
    const hierarchy: Record<RazterRealm, number> = {
      'THE_SCRIPT': 1,
      'THE_COMPILER': 2,
      'THE_KERNEL': 3,
      'THE_NETWORK': 4,
      'THE_SOURCE': 5
    };

    return hierarchy[this.realm] >= hierarchy[requiredRealm];
  }

  public get displayName(): string {
    return this.fullName || this.email.split('@')[0];
  }
}
