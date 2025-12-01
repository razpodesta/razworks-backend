/**
 * @fileoverview GESTOR DE CONTEXTO NEURONAL (Facade)
 * @module AiSystem/Neural
 * @description
 * Orquestador del subsistema de memoria.
 * Consume el Repositorio (IO) y el Ensamblador (Lógica) para proveer
 * una API limpia al resto del sistema.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@razworks/shared/utils';
import { NeuralRepository, NeuralMessage } from './neural.repository';
import { ContextAssemblerService } from './context-assembler.service';

@Injectable()
export class NeuralContextManager {
  private readonly logger = new Logger(NeuralContextManager.name);

  constructor(
    private readonly repo: NeuralRepository,
    private readonly assembler: ContextAssemblerService
  ) {}

  /**
   * Construye el Prompt Maestro con memoria inyectada.
   */
  async buildContext(userId: string, systemDirective: string): Promise<Result<string, Error>> {
    // 1. Recuperación (IO)
    const historyResult = await this.repo.getRawHistory(userId);

    if (historyResult.isFailure) {
      // Degradación Grácil: Si falla Redis, devolvemos solo la directiva sin memoria.
      // No rompemos la aplicación por falta de caché.
      this.logger.warn(`Memory Fetch Failed for ${userId}. Proceeding stateless.`);
      return Result.ok(systemDirective);
    }

    const fullHistory = historyResult.getValue();

    // 2. Procesamiento (Logic)
    const prunedHistory = this.assembler.pruneHistory(fullHistory);
    const finalPrompt = this.assembler.formatPrompt(systemDirective, prunedHistory);

    return Result.ok(finalPrompt);
  }

  /**
   * Guarda una interacción (Q&A) en la memoria.
   */
  async pushInteraction(userId: string, input: string, output: string): Promise<void> {
    const now = Date.now();

    const userMsg: NeuralMessage = {
      role: 'user',
      content: input,
      timestamp: now
    };

    const aiMsg: NeuralMessage = {
      role: 'model',
      content: output,
      timestamp: now + 1
    };

    const saveResult = await this.repo.saveInteraction(userId, userMsg, aiMsg);

    if (saveResult.isFailure) {
      this.logger.error(`Failed to save interaction for ${userId}: ${saveResult.getError().message}`);
    }
  }
}
