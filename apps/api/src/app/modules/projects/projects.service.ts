/**
 * @fileoverview Servicio de Proyectos (Orchestrator)
 * @module API/Projects
 * @description Coordina IA, DB y Eventos. Implementa Result Pattern.
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateProjectDto, SearchProjectDto } from '@razworks/dtos';
import { Project, ProjectRepositoryPort, AppError } from '@razworks/core';
import { Result } from '@razworks/shared/utils';
import { EmbeddingAdapter } from '@razworks/ai';
import { GamificationEmitter } from '@razworks/gamification';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectRepo: ProjectRepositoryPort,
    private readonly embeddingAdapter: EmbeddingAdapter,
    private readonly gamification: GamificationEmitter
  ) {}

  /**
   * Crea un proyecto, genera su ADN vectorial y recompensa al creador.
   */
  async create(userId: string, dto: CreateProjectDto): Promise<Result<string, Error>> {
    this.logger.log(`Iniciando creación de proyecto para ${userId}: "${dto.title}"`);

    // 1. GENERACIÓN VECTORIAL (IA)
    // El texto vectorizable es la combinación de título y descripción
    const textToEmbed = `${dto.title}\n\n${dto.description}`;
    const embeddingResult = await this.embeddingAdapter.getEmbedding(textToEmbed);

    if (embeddingResult.isFailure) {
      // Fallo de IA: Podemos decidir abortar o guardar sin vector (elegimos abortar por calidad)
      this.logger.error('Fallo al generar embedding. Abortando creación.');
      return Result.fail(embeddingResult.getError());
    }

    // 2. CONSTRUCCIÓN DE ENTIDAD (DOMINIO)
    const projectId = randomUUID();
    const newProject = new Project(
      projectId,
      userId,
      dto.title,
      dto.description,
      'OPEN', // Estado inicial
      dto.budgetCents,
      dto.currency,
      new Date(),
      embeddingResult.getValue() // Inyectamos el vector calculado
    );

    // 3. PERSISTENCIA TRANSACCIONAL (DB)
    const saveResult = await this.projectRepo.create(newProject);

    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    // 4. EFECTOS SECUNDARIOS (GAMIFICACIÓN) - Fire & Forget
    // No esperamos (await) a que termine, pero manejamos el error de la promesa
    this.gamification.award({
      userId,
      amount: 150, // XP generosa por crear proyecto
      reason: 'PROJECT_CREATED',
      source: 'api'
    }).catch(err => this.logger.error('Error emitiendo XP', err));

    return Result.ok(projectId);
  }

  /**
   * Búsqueda Semántica Híbrida.
   */
  async search(dto: SearchProjectDto): Promise<Result<Project[], Error>> {
    // 1. Vectorizar la consulta del usuario
    const embeddingResult = await this.embeddingAdapter.getEmbedding(dto.query);

    if (embeddingResult.isFailure) {
      return Result.fail(embeddingResult.getError());
    }

    // 2. Búsqueda por similitud de cosenos en DB
    return this.projectRepo.searchBySimilarity(
      embeddingResult.getValue(),
      dto.limit
    );
  }
}
