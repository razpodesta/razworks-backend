/**
 * @fileoverview Contrato Base para Herramientas RazWorks (AI-Compatible)
 * @module Toolbox/Shared/Base
 *
 * @author Raz Podestá & LIA Legacy
 * @description
 * Clase abstracta que todas las herramientas deben heredar.
 * Garantiza compatibilidad con:
 * 1. Validación Zod (Input seguro).
 * 2. OpenAI/Gemini Function Calling (Metadata).
 * 3. Sistema de Gamificación (Control de Acceso por Reinos).
 */

import { z } from 'zod';
import { RazterRealm } from '@razworks/core';
import { Result } from '@razworks/shared/utils';

export interface ToolMetadata {
  name: string;        // Nombre técnico para la IA (ej: 'calculate_budget')
  description: string; // Instrucción para la IA (ej: 'Estimates project cost based on complexity')
  requiredRealm: RazterRealm; // Nivel mínimo para desbloquear
}

export abstract class RazTool<Input, Output> {
  public readonly metadata: ToolMetadata;
  public readonly schema: z.ZodSchema<Input>;

  constructor(metadata: ToolMetadata, schema: z.ZodSchema<Input>) {
    this.metadata = metadata;
    this.schema = schema;
  }

  /**
   * Ejecución segura con validación de esquema automática.
   */
  public async run(input: unknown, userRealm: RazterRealm): Promise<Result<Output, Error>> {
    // 1. Validación de Acceso (Gatekeeper)
    if (!this.hasAccess(userRealm)) {
      return Result.fail(new Error(`Access Denied: Requires ${this.metadata.requiredRealm}, user is ${userRealm}`));
    }

    // 2. Validación de Datos (Zod)
    const parseResult = this.schema.safeParse(input);
    if (!parseResult.success) {
      return Result.fail(new Error(`Invalid Tool Input: ${parseResult.error.message}`));
    }

    // 3. Ejecución Concreta
    try {
      return await this.execute(parseResult.data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return Result.fail(err);
    }
  }

  protected abstract execute(params: Input): Promise<Result<Output, Error>>;

  /**
   * Lógica de jerarquía de reinos (Centralizada o delegada al GatekeeperService en el futuro).
   * Por ahora, implementación simple de jerarquía lineal.
   */
  private hasAccess(userRealm: RazterRealm): boolean {
    const hierarchy: Record<RazterRealm, number> = {
      'THE_SCRIPT': 1,
      'THE_COMPILER': 2,
      'THE_KERNEL': 3,
      'THE_NETWORK': 4,
      'THE_SOURCE': 5
    };
    return hierarchy[userRealm] >= hierarchy[this.metadata.requiredRealm];
  }

  /**
   * Genera la definición JSON para inyectar en el prompt de la IA (Gemini Tools).
   */
  public toAiDefinition() {
    // Aquí se convertiría el Zod Schema a JSON Schema compatible con OpenAI/Gemini
    // Por brevedad del snippet, retornamos la estructura base.
    // En producción usaríamos 'zod-to-json-schema'.
    return {
      name: this.metadata.name,
      description: this.metadata.description,
      // parameters: zodToJsonSchema(this.schema)
    };
  }
}
