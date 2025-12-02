/**
 * @fileoverview Servicio de Ejecución de Herramientas (The Hand)
 * @module AiSystem/Services
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Componente crítico que materializa la intención de la IA.
 * Responsabilidades:
 * 1. Buscar la herramienta en el Registro (vía Inyección).
 * 2. Validar permisos de ejecución (Realm Gatekeeper).
 * 3. Ejecutar la herramienta dentro de un bloque Try/Catch seguro.
 * 4. Registrar la ejecución en Auditoría.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ToolRegistryService } from '@razworks/toolbox-shared';
import { Result } from '@razworks/shared/utils';
import { RazterRealm } from '@razworks/core';
import { DrizzleAuditRepository } from '@razworks/database';

export interface ExecutionContext {
  userId: string;
  realm: RazterRealm;
  traceId: string;
}

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly auditRepo: DrizzleAuditRepository
  ) {}

  /**
   * Ejecuta una herramienta solicitada por el LLM.
   * @param toolName Nombre técnico de la herramienta (ej: 'estimate_budget')
   * @param args Argumentos extraídos por el LLM (JSON)
   * @param context Contexto del usuario y trazabilidad
   */
  async execute(
    toolName: string,
    args: unknown,
    context: ExecutionContext
  ): Promise<Result<string, Error>> {
    this.logger.debug(`🔧 Attempting to execute tool: [${toolName}] | User: ${context.userId}`);

    // 1. Descubrimiento
    const tool = this.registry.getToolByName(toolName);
    if (!tool) {
      const errorMsg = `Tool '${toolName}' not found in registry.`;
      this.logger.warn(errorMsg);
      return Result.fail(new Error(errorMsg));
    }

    // 2. Ejecución Segura (El método run del RazTool ya valida Zod y Realm)
    const start = performance.now();
    const result = await tool.run(args, context.realm);
    const duration = Math.round(performance.now() - start);

    // 3. Auditoría de Uso (Side Effect)
    await this.auditRepo.log({
      userId: context.userId,
      actionCode: 'TOOL_EXECUTION', // Requiere seed
      metadata: {
        tool: toolName,
        success: result.isSuccess,
        durationMs: duration,
        traceId: context.traceId
      },
      durationMs: duration
    });

    // 4. Retorno Normalizado
    if (result.isFailure) {
      const error = result.getError();
      this.logger.error(`❌ Tool Execution Failed: ${error.message}`);
      // Retornamos el error como string para que la IA lo entienda y se disculpe
      return Result.ok(`SYSTEM_ERROR: The tool failed to execute. Reason: ${error.message}`);
    }

    const output = result.getValue();
    this.logger.log(`✅ Tool Executed Successfully: ${toolName} (${duration}ms)`);

    // Serializamos la salida para que el LLM la consuma como contexto
    return Result.ok(JSON.stringify(output));
  }
}
