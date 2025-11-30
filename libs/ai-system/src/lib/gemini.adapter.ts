/**
 * @fileoverview MOTOR DE ORQUESTACIÓN GEMINI
 * @module Libs/AiSystem/Engine
 * @description Coordina Configuración, Cliente, Parser y Errores.
 */

import { GoogleGenAI } from '@google/genai';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { AI_MODELS, AI_CONFIG } from './ai-config';
import { AiResponseParser } from './ai-parser';
import { AiErrorHandler } from './ai-error';

export class GeminiEngine {
  private readonly client: GoogleGenAI;
  private readonly logger = new Logger(GeminiEngine.name);

  constructor() {
    const apiKey = process.env['GOOGLE_AI_KEY'];
    if (!apiKey) {
      this.logger.error('GOOGLE_AI_KEY missing');
      throw new InternalServerErrorException('AI Configuration Error');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string, useThinking = false): Promise<string> {
    const modelName = useThinking ? AI_MODELS.THINKING : AI_MODELS.FAST;

    try {
      this.logger.log(`🧠 Thinking [${modelName}]...`);

      const response = await this.client.models.generateContent({
        model: modelName,
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        config: {
          temperature: useThinking ? AI_CONFIG.TEMPERATURE.CREATIVE : AI_CONFIG.TEMPERATURE.PRECISE,
        }
      });

      // Delegamos la complejidad de extracción al Parser (Atomicity)
      return AiResponseParser.extractText(response);

    } catch (error: unknown) {
      // Delegamos el manejo de errores al Handler (Atomicity)
      AiErrorHandler.handle(error, modelName);
      return ''; // Unreachable
    }
  }
}

// Singleton exportado para consumo fácil
export const aiAdapter = new GeminiEngine();
