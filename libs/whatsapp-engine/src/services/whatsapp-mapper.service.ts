/**
 * @fileoverview Mapper de Mensajes WhatsApp (Pure Logic)
 * @module WhatsApp/Services
 * @description
 * Transforma el payload crudo de Meta (RawWhatsAppMessage) en nuestra
 * estructura interna canónica (InternalMessagePayload).
 *
 * PRINCIPIO: Single Responsibility (Data Transformation).
 */
import { Injectable, Logger } from '@nestjs/common';
import { RawWhatsAppMessage } from '../dto/webhook.schema';
import { InternalMessagePayload, MessageType } from './conversation-flow.service';

@Injectable()
export class WhatsAppMapper {
  private readonly logger = new Logger(WhatsAppMapper.name);

  /**
   * Convierte un mensaje crudo en un payload interno normalizado.
   * Retorna null si el tipo de mensaje no es soportado.
   */
  public normalize(rawMsg: RawWhatsAppMessage): Omit<InternalMessagePayload, 'traceId'> | null {
    const base = {
      id: rawMsg.id,
      from: rawMsg.from,
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
        // Extracción inteligente de botones y listas
        const type = rawMsg.interactive?.type;
        let textContent = '';

        if (type === 'button_reply') {
          textContent = rawMsg.interactive?.button_reply?.title || '';
        } else if (type === 'list_reply') {
          textContent = rawMsg.interactive?.list_reply?.title || '';
        }

        // Tratamos la respuesta interactiva como texto simple para el flujo
        return { ...base, type: 'text', text: textContent };
      }

      default:
        this.logger.debug(`Unsupported message type skipped: ${rawMsg.type}`);
        return null;
    }
  }
}
