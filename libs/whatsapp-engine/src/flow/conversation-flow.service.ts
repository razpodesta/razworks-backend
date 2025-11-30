/**
 * @fileoverview Orquestador Omnicanal (Cortex Dispatcher)
 * @module WhatsApp/Services
 * @description Soporte para Audio, Imagen, Herramientas y Contexto Rico.
 */
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer } from 'bullmq';
import { InjectFlowProducer } from '@nestjs/bullmq';

// --- DEFINICIONES DE DOMINIO INTERNO ---
// No importamos del DTO para mantener el desacoplamiento estricto.

export type MessageType = 'text' | 'audio' | 'image' | 'interactive' | 'flow_response';

export interface InternalMessagePayload {
  readonly id: string;
  readonly from: string;
  readonly type: MessageType;
  readonly text?: string;       // Contenido textual (o caption)
  readonly mediaUrl?: string;   // URL temporal de Meta para Audio/Imagen
  readonly mimeType?: string;   // 'audio/ogg', 'image/jpeg'
  readonly timestamp: string;
  readonly traceId: string;
}

@Injectable()
export class ConversationFlowService {
  private readonly logger = new Logger(ConversationFlowService.name);

  constructor(
    @InjectFlowProducer('whatsapp-flow') private flowProducer: FlowProducer
  ) {}

  async dispatch(msg: Omit<InternalMessagePayload, 'traceId'>): Promise<void> {
    const traceId = `cortex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload: InternalMessagePayload = { ...msg, traceId };

    this.logger.log(`🧠 [CORTEX] Activating Lobes | Type: ${msg.type} | Trace: ${traceId}`);

    // CONFIGURACIÓN DE FLUJO DINÁMICO (DAG)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childrenJobs: any[] = [];

    // 1. Lóbulo Emocional (Siempre activo para contexto)
    childrenJobs.push({
      name: 'analyze-sentiment',
      queueName: 'whatsapp-sentiment',
      data: { text: payload.text || '[MEDIA]', traceId },
      opts: { failParentOnFailure: false }
    });

    // 2. Lóbulo de Seguridad (Siempre activo)
    childrenJobs.push({
      name: 'security-scan',
      queueName: 'whatsapp-security',
      data: { text: payload.text || '', mediaUrl: payload.mediaUrl, traceId },
      opts: { failParentOnFailure: true }
    });

    // 3. Lóbulo Perceptivo (Solo si hay media)
    if (payload.type === 'audio') {
      childrenJobs.push({
        name: 'transcribe-audio',
        queueName: 'whatsapp-audio',
        data: { mediaUrl: payload.mediaUrl, mimeType: payload.mimeType, traceId }
      });
    } else if (payload.type === 'image') {
      childrenJobs.push({
        name: 'analyze-vision',
        queueName: 'whatsapp-vision',
        data: { mediaUrl: payload.mediaUrl, traceId }
      });
    }

    // El Orquestador espera a que todos los sentidos terminen
    await this.flowProducer.add({
      name: 'orchestrator-job',
      queueName: 'whatsapp-orchestrator',
      data: payload,
      children: childrenJobs,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true
      }
    });
  }
}
