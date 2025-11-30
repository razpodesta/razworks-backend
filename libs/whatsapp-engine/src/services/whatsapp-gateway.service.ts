// libs/whatsapp-engine/src/services/whatsapp-gateway.service.ts
/**
 * @fileoverview Servicio de Gateway (Hardened)
 * @module WhatsApp/Services
 * @description Normaliza eventos y protege PII en logs.
 */
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { WhatsAppWebhookDto, RawWhatsAppMessage } from '../dto/webhook.schema';
import { ConversationFlowService, InternalMessagePayload, MessageType } from './conversation-flow.service';

@Injectable()
export class WhatsAppGatewayService {
  private readonly logger = new Logger(WhatsAppGatewayService.name);

  constructor(private readonly flowService: ConversationFlowService) {}

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const MY_VERIFY_TOKEN = process.env['WHATSAPP_VERIFY_TOKEN'];
    if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
      this.logger.log('🔐 Webhook Verified.');
      return challenge;
    }
    throw new ForbiddenException('Invalid Verify Token');
  }

  async processWebhook(payload: WhatsAppWebhookDto): Promise<void> {
    const changes = payload.entry?.[0]?.changes?.[0]?.value;
    if (!changes) return;

    // Ignorar estados (read/delivered) para reducir ruido
    if (changes.statuses) return;

    if (changes.messages && changes.messages.length > 0) {
      for (const rawMsg of changes.messages) {
        const normalized = this.normalizeOmnichannel(rawMsg);
        if (normalized) {
          // LOG SEGURO: Enmascarar el remitente (PII)
          const maskedFrom = rawMsg.from.replace(/\d{4}$/, 'XXXX');
          this.logger.log(`📨 Msg Received | From: ${maskedFrom} | Type: ${rawMsg.type}`);

          await this.flowService.dispatch(normalized);
        }
      }
    }
  }

  private normalizeOmnichannel(rawMsg: RawWhatsAppMessage): Omit<InternalMessagePayload, 'traceId'> | null {
    const base = {
      id: rawMsg.id,
      from: rawMsg.from, // Mantenemos el real para el proceso interno
      timestamp: rawMsg.timestamp,
      type: rawMsg.type as MessageType,
    };

    switch (rawMsg.type) {
      case 'text':
        return { ...base, text: rawMsg.text?.body || '' };

      case 'audio':
        return {
          ...base,
          mediaUrl: rawMsg.audio?.id,
          mimeType: rawMsg.audio?.mime_type
        };

      case 'image':
        return {
          ...base,
          mediaUrl: rawMsg.image?.id,
          mimeType: rawMsg.image?.mime_type,
          text: rawMsg.image?.caption || ''
        };

      case 'interactive': {
        // Manejo de respuestas a botones o listas
        const type = rawMsg.interactive?.type;
        let textContent = '';

        if (type === 'button_reply') {
          textContent = rawMsg.interactive?.button_reply?.title || '';
        } else if (type === 'list_reply') {
          textContent = rawMsg.interactive?.list_reply?.title || '';
        }

        return { ...base, text: textContent };
      }

      default:
        // Tipos no soportados (Stickers, Location, etc.) se ignoran explícitamente
        // Esto satisface el requisito de retorno de la función
        this.logger.debug(`Ignored message type: ${rawMsg.type}`);
        return null;
    }
  }
}
