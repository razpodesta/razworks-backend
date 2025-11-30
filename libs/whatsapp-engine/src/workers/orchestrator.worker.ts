/**
 * @fileoverview CORTEX EXECUTOR (Fixed & Optimized)
 * @description
 * Cerebro central que orquesta la síntesis de resultados (Fan-In),
 * razonamiento cognitivo y ejecución de respuestas.
 *
 * Correcciones:
 * - TS2345: Manejo seguro de 'text' opcional.
 * - Robustez: Lógica de fallback para mensajes vacíos.
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { aiAdapter } from '@razworks/ai';
import { InternalMessagePayload } from '../services/conversation-flow.service';

// --- Interfaces de Resultados (Strict Types) ---
interface SentimentResult {
  mood: string;
  score: number;
}

interface AudioResult {
  text: string;
  meta: { duration: number; confidence: number };
}

interface VisionResult {
  description: string;
  labels: string[];
}

interface SecurityResult {
  safe: boolean;
  reason?: string;
}

interface CortexContext {
  mood: string;
  transcription?: string;
  visualAnalysis?: string;
  securityAlert?: string;
}

@Processor('whatsapp-orchestrator')
export class OrchestratorWorker extends WorkerHost {
  private readonly logger = new Logger(OrchestratorWorker.name);

  async process(job: Job<InternalMessagePayload>): Promise<void> {
    const { from, traceId, type } = job.data;

    // FIX TS2345: Inicialización defensiva. Si 'text' es undefined, usamos string vacío.
    let text = job.data.text || '';

    this.logger.log(`🔮 Cortex Thinking | Trace: ${traceId} | Input: ${type}`);

    try {
      // 1. NEURO-FUSION (Fan-In)
      const childrenRaw = await job.getChildrenValues();
      const ctx = this.fuseContext(childrenRaw);

      // 2. ENRIQUECIMIENTO MULTIMODAL
      // Inyección de Transcripción de Audio
      if (type === 'audio' && ctx.transcription) {
        const audioTag = `[AUDIO_TRANSCRIPT]: "${ctx.transcription}"`;
        // Si había texto previo (ej: caption), lo concatenamos
        text = text ? `${text}\n${audioTag}` : audioTag;
        this.logger.log(`🎤 Voice Integrated: ${ctx.transcription.substring(0, 30)}...`);
      }

      // Inyección de Análisis Visual
      if (type === 'image' && ctx.visualAnalysis) {
        const visualTag = `[VISUAL_CONTEXT]: The user sent an image depicting: ${ctx.visualAnalysis}`;
        text = text ? `${text}\n${visualTag}` : visualTag;
      }

      // 3. VALIDACIÓN DE CONTENIDO MÍNIMO
      // Si después de todo, el texto sigue vacío, no podemos razonar.
      if (!text.trim()) {
        this.logger.warn(`⚠️ Empty context after fusion. Skipping AI generation.`);
        return;
      }

      // 4. PROTOCOLO DE SEGURIDAD
      if (ctx.securityAlert) {
        this.logger.warn(`🛡️ Cortex Blocked: ${ctx.securityAlert}`);
        return;
      }

      // 5. RAZONAMIENTO ESTRATÉGICO
      // Ahora 'text' está garantizado como string y no vacío.
      const prompt = this.buildStrategyPrompt(from, ctx.mood, text);

      // 6. GENERACIÓN (Thinking Mode)
      const responseText = await aiAdapter.generateText(prompt, true);

      // 7. ACCIÓN DE SALIDA
      await this.sendWhatsAppResponse(from, responseText);

      // 8. GAMIFICACIÓN
      if (type !== 'text') {
        this.logger.log(`🎮 XP Awarded: Multimodal Interaction (+50XP)`);
      }

    } catch (e) {
      const error = this.normalizeError(e);
      this.logger.error(`🔥 Cortex Burnout: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapeo y validación de resultados de workers hijos.
   */
  private fuseContext(children: Record<string, unknown>): CortexContext {
    const sentiment = (children['analyze-sentiment'] as SentimentResult) || { mood: 'Neutral' };
    const audio = children['transcribe-audio'] as AudioResult | undefined;
    const vision = children['analyze-vision'] as VisionResult | undefined;
    const security = children['security-scan'] as SecurityResult | undefined;

    return {
      mood: sentiment.mood,
      transcription: audio?.text,
      visualAnalysis: vision?.description,
      securityAlert: (security && !security.safe) ? security.reason : undefined
    };
  }

  /**
   * Construcción del Prompt de Sistema.
   * SAFETY: 'input' ahora recibe string garantizado.
   */
  private buildStrategyPrompt(user: string, mood: string, input: string): string {
    return `
      IDENTITY: RazWorks AI (Elite Freelance Architect).
      USER ID: ${user} (Current Mood: ${mood}).

      CONTEXT/INPUT:
      ${input}

      MISSION:
      1. Analyze the input for technical requirements or queries.
      2. If it's a transcription/image description, acknowledge it naturally.
      3. Adapt tone to user's mood (De-escalate if Angry).
      4. Goal: Guide user to define a project ("Speak to Hire").

      OUTPUT FORMAT:
      Clean text response for WhatsApp. No markdown headers.
    `.trim();
  }

  private async sendWhatsAppResponse(to: string, text: string): Promise<void> {
    // TODO: Inyectar servicio real
    this.logger.log(`📤 [WHATSAPP] To: ${to} | Body: "${text.substring(0, 50)}..."`);
  }

  private normalizeError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (typeof e === 'string') return new Error(e);
    return new Error(JSON.stringify(e));
  }
}
