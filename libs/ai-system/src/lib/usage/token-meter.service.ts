/**
 * @fileoverview Medidor de Consumo de Tokens (FinOps)
 * @module AiSystem/Usage
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Registra el consumo de tokens de cada operación cognitiva.
 * Utiliza el DrizzleAuditRepository existente para persistencia unificada.
 */

import { Injectable } from '@nestjs/common';
import { DrizzleAuditRepository } from '@razworks/database';

@Injectable()
export class TokenMeterService {
  constructor(private readonly auditRepo: DrizzleAuditRepository) {}

  async track(model: string, inputTokens: number, outputTokens: number, userId?: string): Promise<void> {
    // "Fire & Forget" para no bloquear la respuesta
    this.auditRepo.log({
      userId,
      actionCode: 'AI_TOKEN_USAGE', // Requiere seed update
      metadata: {
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost: this.estimateCost(model, inputTokens, outputTokens)
      }
    }).catch(err => console.error('Failed to track tokens', err));
  }

  private estimateCost(model: string, input: number, output: number): number {
    // Tarifas aproximadas (Gemini Flash) - $0.35 / 1M input, $0.70 / 1M output
    // Retornamos micro-centavos
    if (model.includes('flash')) {
      return (input * 0.35 + output * 0.70) / 1_000_000;
    }
    // Tarifas Pro
    return (input * 3.50 + output * 10.50) / 1_000_000;
  }
}
