/**
 * @fileoverview Servicio de Auditoría de Conversaciones (Forensics)
 * @module WhatsApp/Services
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Intercepta mensajes entrantes y salientes para persistirlos en el registro inmutable
 * de auditoría (`audit_logs`).
 *
 * RESPONSABILIDAD ÚNICA: Trazabilidad Legal y Debugging.
 */

import { Injectable, Logger } from '@nestjs/common';
import { DrizzleAuditRepository } from '@razworks/database';
import { InternalMessagePayload } from './conversation-flow.service';

@Injectable()
export class ConversationLoggerService {
  private readonly logger = new Logger(ConversationLoggerService.name);

  constructor(private readonly auditRepo: DrizzleAuditRepository) {}

  /**
   * Registra un mensaje entrante (Webhook) en la auditoría.
   */
  async logIncoming(msg: Omit<InternalMessagePayload, 'traceId'>): Promise<void> {
    // Usamos un código de acción específico que debe existir en el seed
    // Sugerencia: Asegurar que 'WA_MSG_IN' esté en seed-codes.ts
    const ACTION_CODE = 'WA_MSG_IN';

    await this.auditRepo.log({
      // Usamos el número de teléfono como User ID temporal si no hay mapeo aún
      // En un sistema ideal, buscaríamos el UUID del usuario por su teléfono primero.
      // Por ahora, guardamos null en userId y el teléfono en metadata.
      userId: undefined,
      actionCode: ACTION_CODE,
      metadata: {
        from: msg.from,
        type: msg.type,
        whatsappId: msg.id,
        textSnippet: msg.text?.substring(0, 100) || '[MEDIA]',
        hasMedia: !!msg.mediaUrl
      }
    });
  }

  /**
   * Registra un error de procesamiento o seguridad.
   */
  async logSecurityEvent(traceId: string, from: string, reason: string): Promise<void> {
    await this.auditRepo.log({
      actionCode: 'WA_SEC_BLOCK',
      metadata: {
        traceId,
        from,
        reason,
        severity: 'HIGH'
      }
    });
  }
}
