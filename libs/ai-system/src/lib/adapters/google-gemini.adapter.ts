/**
 * @fileoverview Adaptador Google Gemini (SDK v1 Consolidated) - LINT FREE
 * @module AiSystem/Adapters
 * @description
 * Implementación única y oficial para Google GenAI.
 * Integra correcciones de tipado, parsing y manejo de errores explícito.
 */
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Part } from '@google/genai';
import { AiProviderPort, AiGenerationOptions, MultimodalInput } from '../ports/ai-provider.port';
import { AiConfigService } from '../config/ai-env.config';
import { Result } from '@razworks/shared/utils';

@Injectable()
export class GoogleGeminiAdapter implements AiProviderPort {
  private readonly client: GoogleGenAI;
  private readonly logger = new Logger(GoogleGeminiAdapter.name);

  // Constantes de Modelo (Internalizadas para Cohesión)
  private readonly MODEL_TEXT = 'gemini-2.0-flash';
  private readonly MODEL_MULTIMODAL = 'gemini-2.0-flash';
  private readonly MODEL_EMBED = 'text-embedding-004';

  constructor() {
    const key = AiConfigService.googleKey;
    if (!key) throw new Error('FATAL: GOOGLE_AI_KEY missing in environment');
    this.client = new GoogleGenAI({ apiKey: key });
  }

  /**
   * Generación de Texto Puro.
   */
  async generateText(prompt: string, options?: AiGenerationOptions): Promise<Result<string, Error>> {
    try {
      const response = await this.client.models.generateContent({
        model: this.MODEL_TEXT,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: options?.temperature ?? AiConfigService.temperature,
          systemInstruction: options?.systemInstruction,
        }
      });

      return this.parseResponse(response);
    } catch (error) {
      return this.handleError<string>(error);
    }
  }

  /**
   * Generación Multimodal (Audio/Video/Imagen).
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
          temperature: 0.2, // Precisión técnica
          systemInstruction: options?.systemInstruction
        }
      });

      return this.parseResponse(response);
    } catch (error) {
      return this.handleError<string>(error);
    }
  }

  /**
   * Generación de Embeddings (Vectorización).
   */
  async embedText(text: string): Promise<Result<number[], Error>> {
    try {
      // Validación previa para ahorrar llamada API
      if (!text || text.trim().length < 2) {
        return Result.fail(new Error('Text too short for embedding'));
      }

      const response = await this.client.models.embedContent({
        model: this.MODEL_EMBED,
        // SDK v1 structure
        contents: [{ role: 'user', parts: [{ text }] }]
      });

      const vector = response.embeddings?.[0]?.values;

      if (!vector || vector.length === 0) {
        throw new Error('Google AI returned empty embedding vector');
      }

      return Result.ok(vector);
    } catch (error) {
      return this.handleError<number[]>(error);
    }
  }

  // --- HELPERS PRIVADOS (High Cohesion) ---

  /**
   * Parser robusto integrado.
   * CORRECCIÓN ESLINT: Se captura y usa el error de parseo.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseResponse(response: any): Result<string, Error> {
    try {
      // Acceso seguro a la propiedad .text (SDK v1)
      const text = response.text;

      if (typeof text === 'string' && text.length > 0) {
        return Result.ok(text.trim());
      }

      // Fallback a candidatos
      const candidate = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return Result.ok(candidate.trim());
      }

      throw new Error('Empty or malformed response from Gemini API');
    } catch (error: unknown) {
      // ✅ FIX: Usamos la variable error para no perder contexto
      const errMessage = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to parse AI response: ${errMessage}`));
    }
  }

  private handleError<T>(error: unknown): Result<T, Error> {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error(`Gemini Adapter Error: ${err.message}`);
    return Result.fail<T, Error>(err);
  }
}
