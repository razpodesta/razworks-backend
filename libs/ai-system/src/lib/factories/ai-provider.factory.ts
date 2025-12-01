/**
 * @fileoverview Fábrica de Proveedores de IA
 * @module AiSystem/Factory
 * @description Instancia la implementación correcta según .env
 */
import { Injectable } from '@nestjs/common';
import { AiProviderPort } from '../ports/ai-provider.port';
import { GoogleGeminiAdapter } from '../adapters/google-gemini.adapter';
import { AiConfigService } from '../config/ai-env.config';

@Injectable()
export class AiProviderFactory {
  create(): AiProviderPort {
    const provider = AiConfigService.provider;

    switch (provider) {
      case 'google':
        return new GoogleGeminiAdapter();
      // case 'openai': return new OpenAiAdapter();
      default:
        throw new Error(`Unsupported AI Provider: ${provider}`);
    }
  }
}
