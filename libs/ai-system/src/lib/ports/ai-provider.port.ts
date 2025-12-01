/**
 * @fileoverview Puerto Universal de IA (Hexagonal - v2 Agentic)
 * @module AiSystem/Ports
 * @description Contrato agnóstico extendido para soporte de Function Calling.
 */
import { Result } from '@razworks/shared/utils';

// Definición genérica de herramienta para el proveedor (agnóstica de Gemini)
export interface AiToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export interface AiGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  systemInstruction?: string;
  // ✅ NUEVO: Lista de herramientas disponibles
  tools?: AiToolDefinition[];
}

export interface MultimodalInput {
  mimeType: string;
  data: Buffer;
}

// Respuesta enriquecida para detectar llamadas a función
export interface AiResponse {
  text: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export abstract class AiProviderPort {
  // ✅ Actualizado para devolver AiResponse (o string compatible)
  // Para mantener compatibilidad hacia atrás, retornamos string,
  // pero internamente el adaptador debe manejar la lógica si es function call.
  // En una refactorización mayor, cambiaríamos Promise<Result<string>> a Promise<Result<AiResponse>>.
  // Por ahora, mantenemos string y asumimos que el Adapter serializa la llamada si ocurre,
  // o (mejor) lanzamos la Fase 7 para cambiar el tipo de retorno globalmente.

  abstract generateText(prompt: string, options?: AiGenerationOptions): Promise<Result<string, Error>>;
  abstract generateMultimodal(prompt: string, file: MultimodalInput, options?: AiGenerationOptions): Promise<Result<string, Error>>;
  abstract embedText(text: string): Promise<Result<number[], Error>>;
}
