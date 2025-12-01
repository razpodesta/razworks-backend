/**
 * @fileoverview Repositorio de Proyectos (Implementación Drizzle)
 * @module Infra/Database/Repositories
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Implementa el puerto hexagonal `ProjectRepositoryPort`.
 * Maneja la estrategia "Split-Table" separando metadatos ligeros de embeddings pesados.
 * Utiliza transacciones ACID para garantizar integridad referencial.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Project, ProjectRepositoryPort, AppError } from '@razworks/core';
import { Result } from '@razworks/shared/utils';
import { db } from '../client';
import { projectsTable, projectEmbeddingsTable } from '../schema/projects.table';
import { eq, sql, desc, and } from 'drizzle-orm';

@Injectable()
export class DrizzleProjectRepository implements ProjectRepositoryPort {
  private readonly logger = new Logger(DrizzleProjectRepository.name);

  /**
   * Persiste un proyecto y su vector embedding atómicamente.
   * Si falla la inserción del vector, se revierte la creación del proyecto.
   */
  async create(project: Project): Promise<Result<void, Error>> {
    this.logger.log(`💾 Persisting Project [${project.id}]...`);

    try {
      await db.transaction(async (tx) => {
        // 1. Insertar Metadatos (Tabla Ligera - Acceso frecuente)
        await tx.insert(projectsTable).values({
          id: project.id,
          ownerId: project.ownerId,
          title: project.title,
          // Slug simple para URLs amigables
          slug: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${project.id.slice(0, 4)}`,
          status: project.status,
          budgetCents: project.budgetCents,
          currency: project.currency,
          createdAt: project.createdAt,
        });

        // 2. Insertar Embeddings (Tabla Pesada - Acceso IA/Search)
        // Solo si el vector existe (podría ser un borrador sin procesar)
        if (project.embedding && project.embedding.length > 0) {
          await tx.insert(projectEmbeddingsTable).values({
            projectId: project.id,
            fullDescription: project.description, // Texto completo para RAG
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

  /**
   * Búsqueda semántica usando distancia de coseno.
   * Optimizado para usar índice HNSW en la tabla de embeddings.
   */
  async searchBySimilarity(vector: number[], limit: number): Promise<Result<Project[], Error>> {
    try {
      // Fórmula de similitud coseno: 1 - distancia
      // (1 es idéntico, 0 es opuesto/ortogonal)
      const similarity = sql<number>`1 - (${projectEmbeddingsTable.embedding} <=> ${JSON.stringify(vector)})`;

      const results = await db
        .select({
          project: projectsTable,
          details: projectEmbeddingsTable,
          score: similarity,
        })
        .from(projectEmbeddingsTable)
        .innerJoin(projectsTable, eq(projectsTable.id, projectEmbeddingsTable.projectId))
        // Filtro opcional: Solo buscar proyectos abiertos
        .where(eq(projectsTable.status, 'OPEN'))
        .orderBy(desc(similarity))
        .limit(limit);

      // Mapeo Infraestructura -> Dominio
      const domainProjects = results.map(row => new Project(
        row.project.id,
        row.project.ownerId,
        row.project.title,
        row.details.fullDescription || '',
        row.project.status as any, // Casting seguro validado por Zod en capas superiores
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
