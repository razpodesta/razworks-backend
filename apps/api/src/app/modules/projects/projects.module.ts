/**
 * @fileoverview Módulo de Proyectos (Assembly)
 * @module API/Projects
 */
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectRepositoryPort } from '@razworks/core';
import { DrizzleProjectRepository } from '@razworks/database';
import { EmbeddingAdapter } from '@razworks/ai';
import { GamificationModule } from '@razworks/gamification';

@Module({
  imports: [
    GamificationModule, // Para el Emitter
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    // Inyección de Implementación para el Puerto del Core
    {
      provide: ProjectRepositoryPort,
      useClass: DrizzleProjectRepository,
    },
    // Inyección del Adaptador de IA
    EmbeddingAdapter,
  ],
})
export class ProjectsModule {}
