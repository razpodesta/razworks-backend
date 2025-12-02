/**
 * @fileoverview Repositorio de Proyectos (Implementación Drizzle)
 * @module Infra/Database/Repositories
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Project, ProjectRepositoryPort, AppError } from '@razworks/core';
import { Result } from '@razworks/shared/utils';
import { db } from '../client';
import { projectsTable, projectEmbeddingsTable } from '../schema/projects.table';
import { eq, sql, desc } from 'drizzle-orm'; // ✅ Eliminado 'and' no usado

@Injectable()
export class DrizzleProjectRepository implements ProjectRepositoryPort {
  private readonly logger = new Logger(DrizzleProjectRepository.name);

  async create(project: Project): Promise<Result<void, Error>> {
    this.logger.log(`💾 Persisting Project [${project.id}]...`);

    try {
      await db.transaction(async (tx) => {
        await tx.insert(projectsTable).values({
          id: project.id,
          ownerId: project.ownerId,
          title: project.title,
          slug: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${project.id.slice(0, 4)}`,
          status: project.status,
          budgetCents: project.budgetCents,
          currency: project.currency,
          createdAt: project.createdAt,
        });

        if (project.embedding && project.embedding.length > 0) {
          await tx.insert(projectEmbeddingsTable).values({
            projectId: project.id,
            fullDescription: project.description,
            embedding: project.embedding,
          });
        }
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error(`❌ Transaction Failed for Project ${project.id}`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }

  async searchBySimilarity(vector: number[], limit: number): Promise<Result<Project[], Error>> {
    try {
      const similarity = sql<number>`1 - (${projectEmbeddingsTable.embedding} <=> ${JSON.stringify(vector)})`;

      const results = await db
        .select({
          project: projectsTable,
          details: projectEmbeddingsTable,
          score: similarity,
        })
        .from(projectEmbeddingsTable)
        .innerJoin(projectsTable, eq(projectsTable.id, projectEmbeddingsTable.projectId))
        .where(eq(projectsTable.status, 'OPEN'))
        .orderBy(desc(similarity))
        .limit(limit);

      // ✅ FIX: Eliminado 'any' mediante casting al tipo Status válido
      const domainProjects = results.map(row => new Project(
        row.project.id,
        row.project.ownerId,
        row.project.title,
        row.details.fullDescription || '',
        row.project.status as 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED',
        row.project.budgetCents,
        row.project.currency,
        row.project.createdAt || new Date(),
        row.details.embedding
      ));

      return Result.ok(domainProjects);

    } catch (error) {
      this.logger.error(`❌ Vector Search Failed`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }
}
