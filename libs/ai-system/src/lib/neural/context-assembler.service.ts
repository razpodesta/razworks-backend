/**
 * @fileoverview Ensamblador de Contexto (Token Logic)
 * @module AiSystem/Neural
 * @description
 * Responsabilidad Única: Gestión de ventana de contexto y formateo de prompts.
 * Realiza la "Poda Inteligente" para asegurar que no excedamos el presupuesto de tokens.
 */
import { Injectable } from '@nestjs/common';
import { NeuralMessage } from './neural.repository';
import { AiConfigService } from '../config/ai-env.config';

@Injectable()
export class ContextAssemblerService {
  // Heurística conservadora: 1 Token ~= 4 caracteres (Inglés/Español)
  // Para código o idiomas complejos, esto da un margen de seguridad.
  private readonly CHARS_PER_TOKEN = 3.5;

  /**
   * Aplica poda inteligente al historial para encajar en la ventana.
   * Estrategia: "Latest Priority" (Prioridad a lo más reciente).
   */
  public pruneHistory(history: NeuralMessage[]): NeuralMessage[] {
    const maxTokens = AiConfigService.maxTokens;
    let currentTokens = 0;
    const allowedMessages: NeuralMessage[] = [];

    // Recorremos de atrás hacia adelante (del más reciente al más antiguo)
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const estimatedTokens = this.estimateTokens(msg.content);

      // Si agregar este mensaje rompe el banco, paramos.
      if (currentTokens + estimatedTokens > maxTokens) {
        break;
      }

      allowedMessages.unshift(msg); // Re-insertamos en orden cronológico
      currentTokens += estimatedTokens;
    }

    return allowedMessages;
  }

  /**
   * Renderiza el bloque de texto final para el LLM.
   */
  public formatPrompt(systemDirective: string, history: NeuralMessage[]): string {
    const contextBlock = history.map(msg =>
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    return `
${systemDirective}

=== CONVERSATION MEMORY START ===
${contextBlock}
=== CONVERSATION MEMORY END ===

(Continue the conversation naturally based on the above context)
    `.trim();
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / this.CHARS_PER_TOKEN);
  }
}
