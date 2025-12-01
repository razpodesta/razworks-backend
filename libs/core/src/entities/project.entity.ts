/**
 * @fileoverview Entidad de Proyecto (Dominio)
 * @module Core/Entities
 */

export type ProjectStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';

export class Project {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly title: string,
    public readonly description: string, // Texto largo (Split Table)
    public readonly status: ProjectStatus,
    public readonly budgetCents: number,
    public readonly currency: string,
    public readonly createdAt: Date,
    public readonly embedding?: number[] // Opcional, solo existe si ya se procesó
  ) {}

  public isOpen(): boolean {
    return this.status === 'OPEN';
  }
}
