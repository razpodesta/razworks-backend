// libs/core/src/entities/user.entity.ts
/**
 * @fileoverview Entidad de Usuario (Dominio Puro)
 * @module Core/Entities
 * @description Modelo agnóstico de infraestructura. Incluye lógica de Tiers para Gamificación.
 */

export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';
export type RazterTier = 'PLANKTON' | 'BARRACUDA' | 'TIGER_SHARK' | 'MEGALODON';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly tier: RazterTier = 'PLANKTON', // Default para nuevos usuarios
    public readonly createdAt: Date,
    public readonly avatarUrl?: string,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  /**
   * Verifica si es Administrador del sistema.
   */
  public isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  /**
   * Verifica si el usuario tiene nivel suficiente para acceder a una feature.
   * @param requiredTier Nivel mínimo requerido
   */
  public hasAccessToTier(requiredTier: RazterTier): boolean {
    const levels: Record<RazterTier, number> = {
      'PLANKTON': 1,
      'BARRACUDA': 2,
      'TIGER_SHARK': 3,
      'MEGALODON': 4
    };

    return levels[this.tier] >= levels[requiredTier];
  }

  /**
   * Retorna el nombre de visualización seguro.
   */
  public get displayName(): string {
    return this.fullName || this.email.split('@')[0];
  }
}
