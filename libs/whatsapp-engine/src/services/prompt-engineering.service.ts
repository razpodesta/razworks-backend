/**
 * @fileoverview Servicio de Ingeniería de Prompts (Neural Compatible)
 * @module WhatsApp/Services
 * @description
 * Construye el Prompt de Sistema consumiendo la estructura de memoria global.
 * Adapta los mensajes neuronales para el contexto específico de WhatsApp.
 */
import { Injectable } from '@nestjs/common';
import { NeuralMessage } from '@razworks/ai'; // ✅ Ahora esto funciona gracias al fix en index.ts

export interface PromptContext {
  userId: string;
  mood: string;
  history: NeuralMessage[];
  multimodalContext?: string;
}

@Injectable()
export class PromptEngineeringService {

  /**
   * Construye el System Prompt Maestro.
   * Integra identidad, contexto de usuario, memoria podada e inyecciones multimodales.
   */
  buildSystemPrompt(input: string, ctx: PromptContext): string {
    const historyBlock = this.formatHistory(ctx.history);
    const dateContext = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    return `
      === IDENTITY DIRECTIVE ===
      You are LIA (Legacy Intelligence Algorithm), the Architect of RazWorks.
      - CURRENT_TIME: ${dateContext}
      - LOCATION_CONTEXT: Florianópolis, Brazil (MetaShark HQ).

      === OPERATIONAL PARAMETERS ===
      - ROLE: Elite Technical Consultant & Project Scoper.
      - TONE: Cyberpunk Professional, Efficient, "Dark Mode" aesthetic, slightly witty but respectful.
      - LANGUAGE: Detect user language (PT-BR/ES/EN) and reply in the SAME language.
      - FORMAT: Keep responses concise (WhatsApp friendly). Avoid markdown headers like "##". Use bold (*text*) for emphasis.

      === USER PROFILE (Dynamic) ===
      - ID: ${ctx.userId}
      - CURRENT MOOD: ${ctx.mood} (Adjust empathy: High for Negative, Efficient for Positive).

      === MEMORY STREAM (Context Window) ===
      ${historyBlock}

      === SENSORY INPUT (Multimodal) ===
      ${ctx.multimodalContext || '[No media content]'}

      === IMMEDIATE TASK ===
      User Input: "${input}"

      INSTRUCTIONS:
      1. Analyze the input + memory to understand intent (New Project? Status Check? Casual?).
      2. If defining a project, ask ONE clarifying technical question at a time. Do not overwhelm.
      3. If media was uploaded, acknowledge it specifically based on the [Multimodal] block.
      4. If the user is angry, de-escalate immediately.

      RESPONSE:
    `.trim();
  }

  /**
   * Formatea el historial neuronal para consumo del LLM.
   * Aplica sanitización y truncado defensivo.
   */
  private formatHistory(history: NeuralMessage[]): string {
    if (!history || history.length === 0) return '[No previous context]';

    return history
      .filter(msg => msg.content && msg.content.trim().length > 0) // Filtrar mensajes vacíos
      .map(msg => {
        // Mapeo de roles neuronales a etiquetas de prompt
        const roleLabel = msg.role === 'user' ? 'USER' : (msg.role === 'model' ? 'LIA' : 'SYSTEM');

        // Limpieza de texto (quitar saltos de línea excesivos para ahorrar tokens)
        const cleanContent = msg.content.replace(/\n+/g, ' ').trim();

        // Truncado de seguridad (Max 500 chars por mensaje histórico para priorizar input reciente)
        const truncated = cleanContent.length > 500
          ? cleanContent.substring(0, 500) + '...'
          : cleanContent;

        return `[${roleLabel}]: ${truncated}`;
      })
      .join('\n');
  }
}
