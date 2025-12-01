/**
 * @fileoverview Repositorio de Proyectos (Split-Table Transactional)
 * @module Infra/Database/Repositories
 */
import { Injectable, Logger } from '@nestjs/common';
import { Project, ProjectRepositoryPort, AppError } from '@razworks/core';
import { Result } from '@razworks/shared/utils';
import { db } from '../client';
import { projectsTable, projectEmbeddingsTable } from '../schema/projects.table';
import { eq, sql, cosineDistance, desc } from 'drizzle-orm';

@Injectable()
export class DrizzleProjectRepository implements ProjectRepositoryPort {
  private readonly logger = new Logger(DrizzleProjectRepository.name);

  async create(project: Project): Promise<Result<void, Error>> {
    this.logger.log(`Creating Project [${project.id}] with Transaction`);

    try {
      // INICIO TRANSACCIÓN ACID
      await db.transaction(async (tx) => {
        // 1. Insertar Metadatos (Light Table)
        await tx.insert(projectsTable).values({
          id: project.id,
          ownerId: project.ownerId,
          title: project.title,
          slug: `${project.title.toLowerCase().replace(/\s+/g, '-')}-${project.id.slice(0, 4)}`, // Simple slug generation
          status: project.status,
          budgetCents: project.budgetCents,
          currency: project.currency,
          createdAt: project.createdAt,
        });

        // 2. Insertar Datos Pesados + Vector (Heavy Table)
        if (project.embedding) {
          await tx.insert(projectEmbeddingsTable).values({
            projectId: project.id,
            fullDescription: project.description,
            embedding: project.embedding,
          });
        }
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error(`Transaction Failed for Project ${project.id}`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }

  async searchBySimilarity(vector: number[], limit: number): Promise<Result<Project[], Error>> {
    try {
      // Búsqueda vectorial usando cosineDistance
      // Unimos (JOIN) las dos tablas para reconstruir la entidad completa
      const similarity = sql<number>`1 - (${cosineDistance(projectEmbeddingsTable.embedding, vector)})`;

      const results = await db
        .select({
          project: projectsTable,
          details: projectEmbeddingsTable,
          similarity: similarity,
        })
        .from(projectEmbeddingsTable)
        .innerJoin(projectsTable, eq(projectsTable.id, projectEmbeddingsTable.projectId))
        .orderBy(desc(similarity))
        .limit(limit);

      // Mapeo a Dominio
      const projects = results.map(row => new Project(
        row.project.id,
        row.project.ownerId,
        row.project.title,
        row.details.fullDescription || '',
        row.project.status as any,
        row.project.budgetCents,
        row.project.currency,
        row.project.createdAt || new Date()
      ));

      return Result.ok(projects);

    } catch (error) {
      this.logger.error(`Vector Search Failed`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }
}
