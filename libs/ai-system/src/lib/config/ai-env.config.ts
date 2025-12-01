/**
 * @fileoverview Configuración Dinámica de IA
 * @module AiSystem/Config
 * @description Valida y expone la configuración del proveedor seleccionado.
 */
import { z } from 'zod';

const AiEnvSchema = z.object({
  AI_PROVIDER: z.enum(['google', 'openai', 'anthropic']).default('google'),
  GOOGLE_AI_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Límites y Parámetros
  AI_MAX_CONTEXT_TOKENS: z.coerce.number().default(8000), // Aumentado para Gemini 1.5/2.0
  AI_TEMPERATURE: z.coerce.number().default(0.7),
});

export class AiConfigService {
  // Parseo seguro: si falla, el servicio no arranca (Fail Fast)
  private static config = AiEnvSchema.parse(process.env);

  static get provider() { return this.config.AI_PROVIDER; }
  static get googleKey() { return this.config.GOOGLE_AI_KEY; }
  static get maxTokens() { return this.config.AI_MAX_CONTEXT_TOKENS; }
  static get temperature() { return this.config.AI_TEMPERATURE; }
}
