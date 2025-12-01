/**
 * @fileoverview Mapper de Proyecto (Infra -> Domain)
 * @module Infra/Database/Mappers
 * @author Raz Podestá & LIA Legacy
 * @description
 * Reconstruye la entidad Project a partir de la unión de tablas (Split-Table Pattern).
 */

import { Project, ProjectStatus, Money, Currency } from '@razworks/core';
import { InferSelectModel } from 'drizzle-orm';
import { projectsTable, projectEmbeddingsTable } from '../schema/projects.table';

type DbProject = InferSelectModel<typeof projectsTable>;
type DbProjectDetails = InferSelectModel<typeof projectEmbeddingsTable>;

export class ProjectMapper {
  static toDomain(raw: DbProject, details?: DbProjectDetails): Project {

    // Reconstrucción del Value Object Money
    const budgetResult = Money.create(
      raw.budgetCents,
      raw.currency as Currency
    );

    if (budgetResult.isFailure) {
        throw new Error(`[DATA INTEGRITY] Invalid budget in DB for project ${raw.id}`);
    }

    // Como Project no tiene un Factory estático complejo (usa constructor público en la v1),
    // podemos instanciarlo, pero idealmente deberíamos mover Project a usar Factory también.
    // Por ahora, adaptamos al constructor existente refactorizado en Fase 1.

    return new Project({
      id: raw.id,
      ownerId: raw.ownerId,
      title: raw.title,
      description: details?.fullDescription || '',
      status: raw.status as ProjectStatus,
      budget: budgetResult.getValue(),
      createdAt: raw.createdAt || new Date(),
      embedding: details?.embedding || undefined
    });
  }
}
