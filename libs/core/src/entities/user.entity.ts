/**
 * @fileoverview Entidad de Usuario (Agnóstica)
 * @module Core/Entities
 */

export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly avatarUrl?: string,
  ) {}

  // Lógica de dominio pura (ej: validaciones de negocio)
  public isAdmin(): boolean {
    return this.role === 'ADMIN';
  }
}
