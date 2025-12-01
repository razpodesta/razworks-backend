/**
 * @fileoverview Puerto Universal de IA (Hexagonal)
 * @module AiSystem/Ports
 * @description Contrato agnóstico. El resto del sistema SOLO debe depender de esto.
 */
import { Result } from '@razworks/shared/utils';

export interface AiGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  systemInstruction?: string;
}

export interface MultimodalInput {
  mimeType: string;
  data: Buffer;
}

export abstract class AiProviderPort {
  abstract generateText(prompt: string, options?: AiGenerationOptions): Promise<Result<string, Error>>;
  abstract generateMultimodal(prompt: string, file: MultimodalInput, options?: AiGenerationOptions): Promise<Result<string, Error>>;
  abstract embedText(text: string): Promise<Result<number[], Error>>;
}
