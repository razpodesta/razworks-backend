/**
 * @fileoverview CORTEX FLOW DISPATCHER (DAG Architect) - FINAL
 * @module WhatsApp/Services
 * @description
 * Construye y ejecuta el Grafo Acíclico Dirigido (DAG) de procesamiento.
 *
 * OPTIMIZACIONES ELITE:
 * 1. IDEMPOTENCIA: Usa WAMID como llave de deduplicación.
 * 2. LIMPIEZA: Políticas de retención estrictas en Redis.
 * 3. TIPADO: Manejo seguro de errores 'unknown' en bloques catch.
 */

import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer, FlowJob } from 'bullmq';
import { InjectFlowProducer } from '@nestjs/bullmq';

// --- Definiciones de Tipos (Soberanía de Datos) ---
export type MessageType = 'text' | 'audio' | 'image' | 'interactive' | 'flow_response';

export interface InternalMessagePayload {
  readonly id: string;          // WhatsApp Message ID (WAMID)
  readonly from: string;        // User ID (Phone)
  readonly type: MessageType;
  readonly text?: string;
  readonly mediaUrl?: string;   // Media ID
  readonly mimeType?: string;
  readonly timestamp: string;
  readonly traceId: string;     // Observability Trace
}

@Injectable()
export class ConversationFlowService {
  private readonly logger = new Logger(ConversationFlowService.name);

  // Configuración de Jobs para higiene de Redis
  private readonly JOB_OPTS = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 }, // Guardar 1h o 1000 items
    removeOnFail: { age: 24 * 3600, count: 500 }, // Guardar 24h para debug
  };

  constructor(
    @InjectFlowProducer('whatsapp-flow') private flowProducer: FlowProducer
  ) {}

  /**
   * Punto de entrada del Sistema Nervioso.
   * Construye el Grafo de Procesamiento (DAG) y lo inyecta en Redis.
   */
  async dispatch(msg: Omit<InternalMessagePayload, 'traceId'>): Promise<void> {
    const traceId = `trace-${msg.id}-${Date.now()}`;
    const payload: InternalMessagePayload = { ...msg, traceId };

    this.logger.log(`🧠 [FLOW] Constructing DAG | Trace: ${traceId} | Type: ${msg.type}`);

    // 1. Construcción de Nodos Sensoriales (Hijos)
    const senses = this.buildSenses(payload);

    // 2. Definición del Nodo Orquestador (Padre)
    const flowStructure: FlowJob = {
      name: 'orchestrator-job',
      queueName: 'whatsapp-orchestrator',
      data: payload,
      children: senses,
      opts: {
        ...this.JOB_OPTS,
        // IDEMPOTENCIA CRÍTICA:
        // Usamos el ID del mensaje. Si Meta reenvía, BullMQ ignora el duplicado.
        jobId: `orch:${msg.id}`,
      }
    };

    // 3. Inyección Atómica en Redis
    try {
      await this.flowProducer.add(flowStructure);
      this.logger.debug(`🚀 DAG Injected into Redis | JobID: orch:${msg.id}`);
    } catch (error: unknown) {
      // ✅ FIX TS18046: Type Guarding para error desconocido
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(`❌ Failed to inject flow: ${err.message}`, err.stack);

      // Relanzamos para que el Gateway sepa que falló la ingesta
      throw err;
    }
  }

  /**
   * Fabrica los nodos hijos (Sentidos) basándose en el tipo de mensaje.
   * Patrón Factory interno para limpieza de código.
   */
  private buildSenses(payload: InternalMessagePayload): FlowJob[] {
    const senses: FlowJob[] = [];

    // A. Lóbulo de Seguridad (Siempre Activo - Bloqueante)
    // Si este falla, el padre NO debe ejecutarse para proteger al sistema (Fail Fast).
    senses.push({
      name: 'security-scan',
      queueName: 'whatsapp-security',
      data: { text: payload.text || '', mediaUrl: payload.mediaUrl, traceId: payload.traceId },
      opts: {
        ...this.JOB_OPTS,
        failParentOnFailure: true, // 🛡️ KILL SWITCH
        jobId: `sec:${payload.id}` // Idempotencia por nodo
      }
    });

    // B. Lóbulo Emocional (Contexto - No Bloqueante)
    // Si falla el análisis de sentimiento, podemos seguir operando (Degradación Grácil).
    senses.push({
      name: 'analyze-sentiment',
      queueName: 'whatsapp-sentiment',
      data: { text: payload.text || '[MEDIA]', traceId: payload.traceId },
      opts: {
        ...this.JOB_OPTS,
        failParentOnFailure: false,
        jobId: `sent:${payload.id}`
      }
    });

    // C. Lóbulos Perceptivos (Condicionales)
    if (payload.type === 'audio') {
      senses.push({
        name: 'transcribe-audio',
        queueName: 'whatsapp-audio',
        data: {
          mediaUrl: payload.mediaUrl,
          mimeType: payload.mimeType,
          traceId: payload.traceId
        },
        opts: {
          ...this.JOB_OPTS,
          failParentOnFailure: true, // Si no podemos transcribir, no podemos responder
          jobId: `audio:${payload.id}`
        }
      });
    } else if (payload.type === 'image') {
      senses.push({
        name: 'analyze-vision',
        queueName: 'whatsapp-vision',
        data: {
          mediaUrl: payload.mediaUrl,
          traceId: payload.traceId
        },
        opts: {
          ...this.JOB_OPTS,
          failParentOnFailure: true,
          jobId: `vision:${payload.id}`
        }
      });
    }

    return senses;
  }
}
