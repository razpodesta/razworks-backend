/**
 * @fileoverview Adaptador Google Gemini (SDK v1 Consolidated - Agentic Ready)
 * @module AiSystem/Adapters
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Implementación oficial para Google GenAI.
 * Evolucionada para soportar "Function Calling" (Uso de Herramientas).
 * Traduce las definiciones agnósticas de RazWorks al formato específico de Google.
 */

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Part, Tool, FunctionDeclaration, SchemaType } from '@google/genai';
import { AiProviderPort, AiGenerationOptions, MultimodalInput } from '../ports/ai-provider.port';
import { AiConfigService } from '../config/ai-env.config';
import { Result } from '@razworks/shared/utils';

@Injectable()
export class GoogleGeminiAdapter implements AiProviderPort {
  private readonly client: GoogleGenAI;
  private readonly logger = new Logger(GoogleGeminiAdapter.name);

  // Constantes de Modelo (Internalizadas para Cohesión y fácil actualización)
  private readonly MODEL_TEXT = 'gemini-2.0-flash';
  private readonly MODEL_MULTIMODAL = 'gemini-2.0-flash';
  private readonly MODEL_EMBED = 'text-embedding-004';

  constructor() {
    const key = AiConfigService.googleKey;
    if (!key) throw new Error('FATAL: GOOGLE_AI_KEY missing in environment configuration.');
    this.client = new GoogleGenAI({ apiKey: key });
  }

  /**
   * Generación de Texto Puro con Soporte Agéntico.
   * Si se proporcionan herramientas, el modelo puede decidir retornar una llamada a función.
   */
  async generateText(prompt: string, options?: AiGenerationOptions): Promise<Result<string, Error>> {
    try {
      // 1. Mapeo de Herramientas (Si existen)
      let googleTools: Tool[] | undefined;

      if (options?.tools && options.tools.length > 0) {
        googleTools = [{
          functionDeclarations: options.tools.map((t): FunctionDeclaration => ({
            name: t.name,
            description: t.description,
            // Casting seguro: Nuestras herramientas ya generan JSON Schema compatible
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters: t.parameters as any
          }))
        }];
      }

      // 2. Petición al Modelo
      const response = await this.client.models.generateContent({
        model: this.MODEL_TEXT,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: options?.temperature ?? AiConfigService.temperature,
          systemInstruction: options?.systemInstruction,
          tools: googleTools, // ✅ Inyección de Capacidades
        }
      });

      // 3. Detección de Intención de Función (Agentic Branch)
      const candidate = response.candidates?.[0];
      const functionCall = candidate?.content?.parts?.[0]?.functionCall;

      if (functionCall) {
        this.logger.log(`🤖 Agentic Intent Detected: Calling [${functionCall.name}]`);

        // Retornamos un protocolo serializado para que el AgenticCoordinator lo intercepte.
        // Esto mantiene la firma de retorno string simple sin romper interfaces legacy.
        return Result.ok(JSON.stringify({
          _type: 'FUNCTION_CALL',
          name: functionCall.name,
          args: functionCall.args
        }));
      }

      // 4. Respuesta de Texto Estándar
      return this.parseResponse(response);

    } catch (error) {
      return this.handleError<string>(error, 'generateText');
    }
  }

  /**
   * Generación Multimodal (Audio/Video/Imagen).
   * Actualmente optimizada para percepción, no para uso de herramientas (Fase 7+).
   */
  async generateMultimodal(prompt: string, file: MultimodalInput, options?: AiGenerationOptions): Promise<Result<string, Error>> {
    try {
      const base64Data = file.data.toString('base64');
      const parts: Part[] = [
        { text: prompt },
        { inlineData: { mimeType: file.mimeType, data: base64Data } }
      ];

      const response = await this.client.models.generateContent({
        model: this.MODEL_MULTIMODAL,
        contents: [{ role: 'user', parts }],
        config: {
          temperature: 0.2, // Precisión técnica para análisis de imagen/audio
          systemInstruction: options?.systemInstruction
        }
      });

      return this.parseResponse(response);

    } catch (error) {
      return this.handleError<string>(error, 'generateMultimodal');
    }
  }

  /**
   * Generación de Embeddings (Vectorización).
   * Vital para el sistema de búsqueda semántica y RAG.
   */
  async embedText(text: string): Promise<Result<number[], Error>> {
    try {
      // Validación previa para ahorrar llamada API y latencia
      if (!text || text.trim().length < 2) {
        return Result.fail(new Error('Text too short for embedding generation.'));
      }

      const response = await this.client.models.embedContent({
        model: this.MODEL_EMBED,
        contents: [{ role: 'user', parts: [{ text }] }]
      });

      const vector = response.embeddings?.[0]?.values;

      if (!vector || vector.length === 0) {
        throw new Error('Google AI returned empty embedding vector.');
      }

      return Result.ok(vector);

    } catch (error) {
      return this.handleError<number[]>(error, 'embedText');
    }
  }

  // --- HELPERS PRIVADOS (High Cohesion) ---

  /**
   * Parser robusto para normalizar la respuesta del SDK de Google.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseResponse(response: any): Result<string, Error> {
    try {
      // Acceso directo a la propiedad .text (SDK v1 modern syntax)
      const text = response.text;

      if (typeof text === 'string' && text.length > 0) {
        return Result.ok(text.trim());
      }

      // Fallback a inspección profunda de candidatos
      const candidate = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return Result.ok(candidate.trim());
      }

      throw new Error('Empty or malformed response structure from Gemini API.');

    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to parse AI response: ${errMessage}`));
    }
  }

  private handleError<T>(error: unknown, context: string): Result<T, Error> {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error(`Gemini Adapter Error [${context}]: ${err.message}`, err.stack);
    return Result.fail<T, Error>(err);
  }
}
