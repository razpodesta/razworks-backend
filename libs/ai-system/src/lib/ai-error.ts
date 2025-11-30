/**
 * @fileoverview MANEJADOR DE ERRORES IA
 * @module Libs/AiSystem/Error
 */

import { InternalServerErrorException, Logger } from '@nestjs/common';

export class AiErrorHandler {
  private static readonly logger = new Logger('AiSystem');

  static handle(error: unknown, contextModel: string): never {
    // SAFETY: Type Guard para unknown
    const err = error instanceof Error ? error : new Error(String(error));
    const msg = err.message || 'Unknown Error';

    this.logger.error(`❌ Fallo Cognitivo [${contextModel}]: ${msg}`);

    // Análisis semántico del error
    if (msg.includes('404') || msg.includes('not found')) {
      this.logger.warn(`⚠️ Modelo no disponible en este Tier. Sugerencia: Usar Flash.`);
    }

    if (msg.includes('429')) {
      this.logger.warn(`⚠️ Rate Limit Excedido (Quota).`);
    }

    // Siempre lanzamos una excepción HTTP safe para el API Gateway
    throw new InternalServerErrorException(`AI Engine Failure: ${msg}`);
  }
}
