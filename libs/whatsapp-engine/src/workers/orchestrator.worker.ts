/**
 * @fileoverview CORTEX ORCHESTRATOR WORKER (Unified Memory & Sentinel)
 * @module WhatsApp/Workers
 * @description
 * El Cerebro Central.
 *
 * OPTIMIZACIONES DE ÉLITE:
 * 1. SINGLE SOURCE OF TRUTH: Usa 'NeuralContextManager' global para memoria.
 * 2. SENTINEL MODE: Detecta hostilidad y dispara notificaciones al Admin (Human Handoff).
 * 3. ATOMICITY: Guarda la interacción usando el gestor neuronal optimizado.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiProviderPort, NeuralContextManager } from '@razworks/ai'; // ✅ Memoria Global
import { NotificationsService } from '@razworks/notifications'; // ✅ Sistema de Alertas
import { InternalMessagePayload } from '../services/conversation-flow.service';
import { OutboundHumanizerService } from '../services/outbound-humanizer.service';
import { PromptEngineeringService } from '../services/prompt-engineering.service';

// --- Interfaces de Contrato ---
interface SentimentResult { mood: string; score: number; }
interface AudioResult { text: string; meta: { duration: number; confidence: number; source: string; }; }
interface VisionResult { description: string; labels: string[]; }
interface SecurityResult { safe: boolean; reason?: string; sanitizedText?: string; }

@Processor('whatsapp-orchestrator')
export class OrchestratorWorker extends WorkerHost {
  private readonly logger = new Logger(OrchestratorWorker.name);

  constructor(
    private readonly outbound: OutboundHumanizerService,
    private readonly memory: NeuralContextManager, // ✅ Inyección del Gestor Neuronal Global
    private readonly promptArchitect: PromptEngineeringService,
    private readonly aiProvider: AiProviderPort,
    private readonly notifications: NotificationsService // ✅ Inyección de Notificaciones
  ) {
    super();
  }

  async process(job: Job<InternalMessagePayload>): Promise<void> {
    const { from, traceId, type } = job.data;
    let textInput = job.data.text || '';

    this.logger.log(`🔮 Cortex Active | Trace: ${traceId} | User: ${from}`);

    try {
      // 1. FUSIÓN SENSORIAL
      const children = await job.getChildrenValues();
      const security = children['security-scan'] as SecurityResult | undefined;

      // A. Defensa
      if (security && !security.safe) {
        this.logger.warn(`🛡️ Blocked by Sentinel: ${security.reason}`);
        return;
      }
      if (security?.sanitizedText) textInput = security.sanitizedText;

      // B. Multimodalidad
      const audio = children['transcribe-audio'] as AudioResult | undefined;
      const vision = children['analyze-vision'] as VisionResult | undefined;
      let multimodalContext = '';

      if (type === 'audio' && audio?.text) {
        textInput = audio.text;
        multimodalContext += `[AUDIO_SOURCE]: "${audio.text}"\n`;
      }
      if (type === 'image' && vision?.description) {
        textInput = `${textInput} \n(Image: ${vision.description})`;
        multimodalContext += `[VISION_SOURCE]: ${vision.description}\n`;
      }

      if (!textInput.trim()) return;

      // C. Análisis Sentimental & Human Handoff
      const sentiment = (children['analyze-sentiment'] as SentimentResult) || { mood: 'Neutral', score: 0 };

      // Si el usuario está furioso (score negativo alto o mood explícito), alertamos.
      if (sentiment.mood === 'Angry' || sentiment.score < -0.7) {
        this.logger.warn(`🚨 HOSTILITY DETECTED (${sentiment.mood}). Triggering Admin Alert.`);

        // Disparamos alerta asíncrona al dashboard
        this.notifications.dispatch({
          userId: 'admin-system-id', // O ID de un pool de soporte
          actionCode: 'SENTIMENT_ALERT', // Requiere estar en el diccionario
          metadata: {
            userPhone: from,
            traceId,
            snippet: textInput.substring(0, 50)
          }
        }).catch(e => this.logger.error('Failed to dispatch sentiment alert', e));
      }

      // 2. MEMORIA NEURONAL (Recuperación Inteligente)
      // El NeuralContextManager ya maneja la conexión a Redis y el parseo.
      // Nota: buildContext ya nos devuelve el prompt formateado con historia, pero
      // aquí necesitamos la historia cruda para el PromptArchitect local si queremos control fino,
      // O podemos delegar la construcción del prompt al NeuralManager si quisiéramos.
      // Para mantener la separación de "Personalidad" (PromptEngineering) vs "Memoria" (Neural),
      // vamos a pedir el contexto al NeuralManager pero usar nuestro Architect.

      // En la implementación actual de NeuralContextManager (del snapshot), 'buildContext' devuelve string.
      // Vamos a refactorizar ligeramente el uso:
      // Como NeuralContextManager del snapshot NO expone 'getHistory' público crudo (solo buildContext),
      // asumiremos que usamos la estrategia "Prompt Injection" del NeuralManager para simplificar,
      // O BIEN, usamos buildContext pasando una directiva vacía para obtener solo la historia formateada.

      // ESTRATEGIA DE ÉLITE: Usamos el NeuralManager para construir el bloque de memoria.
      const contextResult = await this.memory.buildContext(from, '');
      const memoryBlock = contextResult.isSuccess ? contextResult.getValue() : '';

      // 3. ESTRATEGIA (Prompting)
      // Pasamos un array vacío a promptArchitect.buildSystemPrompt en 'history' porque
      // inyectaremos el bloque de memoria ya procesado en 'multimodalContext' o refactorizamos el servicio.
      // *Mejor opción:* Pasamos el bloque de memoria como parte del contexto multimodal o system prompt.

      const systemPrompt = this.promptArchitect.buildSystemPrompt(textInput, {
        userId: from,
        mood: sentiment.mood,
        history: [], // Ya no pasamos array crudo, la memoria la gestiona el NeuralManager internamente
        // Hack táctico: Inyectamos la memoria procesada por NeuralManager aquí
        multimodalContext: `${multimodalContext}\n${memoryBlock}`
      });

      // 4. COGNICIÓN
      const aiResult = await this.aiProvider.generateText(systemPrompt, { temperature: 0.7 });
      if (aiResult.isFailure) throw new Error(aiResult.getError().message);
      const aiResponse = aiResult.getValue();

      // 5. PERSISTENCIA (Neural Write)
      // Usamos el método optimizado 'pushInteraction' del NeuralManager
      await this.memory.pushInteraction(from, textInput, aiResponse);

      // 6. ACTUACIÓN
      const delivery = await this.outbound.sendHumanResponse(from, aiResponse);
      if (delivery.isFailure) throw delivery.getError();

      this.logger.log(`✅ Cycle Complete | Trace: ${traceId}`);

    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.logger.error(`🔥 Cortex Failure: ${error.message}`, error.stack);
      throw error;
    }
  }
}
