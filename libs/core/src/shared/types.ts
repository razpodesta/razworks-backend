/**
 * @fileoverview Configuración Dinámica de IA (Centralized Versioning)
 * @module AiSystem/Config
 * @author Raz Podestá & LIA Legacy
 * @description
 * Valida y expone la configuración del proveedor seleccionado.
 * Define las versiones de modelos canónicas para evitar drift.
 */
import { z } from 'zod';

const AiEnvSchema = z.object({
  AI_PROVIDER: z.enum(['google', 'openai', 'anthropic']).default('google'),
  GOOGLE_AI_KEY: z.string().optional(),

  // Versiones de Modelos (Sobreescribibles por ENV, defaults seguros)
  AI_MODEL_SMART: z.string().default('gemini-1.5-pro'),   // Para razonamiento (Thinking)
  AI_MODEL_FAST: z.string().default('gemini-1.5-flash'),  // Para chat rápido/tools
  AI_MODEL_EMBED: z.string().default('text-embedding-004'),

  // Límites y Parámetros
  AI_MAX_CONTEXT_TOKENS: z.coerce.number().default(12000), // Aumentado para 1.5 Flash
  AI_TEMPERATURE: z.coerce.number().default(0.7),
});

export class AiConfigService {
  // Parseo seguro: si falla, el servicio no arranca (Fail Fast)
  private static config = AiEnvSchema.parse(process.env);

  static get provider() { return this.config.AI_PROVIDER; }
  static get googleKey() { return this.config.GOOGLE_AI_KEY; }

  // Getters de Modelos Normalizados
  static get modelSmart() { return this.config.AI_MODEL_SMART; }
  static get modelFast() { return this.config.AI_MODEL_FAST; }
  static get modelEmbed() { return this.config.AI_MODEL_EMBED; }

  static get maxTokens() { return this.config.AI_MAX_CONTEXT_TOKENS; }
  static get temperature() { return this.config.AI_TEMPERATURE; }
}
