/**
 * @fileoverview Servicio de Gateway (Lightweight Router & Audit)
 * @module WhatsApp/Services
 * @description
 * Recibe Webhooks, normaliza, AUDITA y despacha al flujo.
 */
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { WhatsAppWebhookDto } from '../dto/webhook.schema';
import { ConversationFlowService } from './conversation-flow.service';
import { WhatsAppMapper } from './whatsapp-mapper.service';
import { WhatsAppClient } from './whatsapp-client.service';
import { ConversationLoggerService } from './conversation-logger.service'; // ✅ Nuevo Logger

@Injectable()
export class WhatsAppGatewayService {
  private readonly logger = new Logger(WhatsAppGatewayService.name);

  constructor(
    private readonly flowService: ConversationFlowService,
    private readonly mapper: WhatsAppMapper,
    private readonly client: WhatsAppClient,
    private readonly auditLogger: ConversationLoggerService // ✅ Inyección
  ) {}

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

    // Filtro de ruido: Ignorar notificaciones de estado
    if (changes.statuses) return;

    if (changes.messages && changes.messages.length > 0) {
      for (const rawMsg of changes.messages) {

        // 1. FEEDBACK INMEDIATO (UX)
        this.client.markAsRead(rawMsg.id).catch(e =>
          this.logger.warn(`Non-critical: Could not mark as read: ${e.message}`)
        );

        // 2. NORMALIZACIÓN
        const normalized = this.mapper.normalize(rawMsg);

        if (normalized) {
          const maskedFrom = normalized.from.replace(/\d{4}$/, 'XXXX');
          this.logger.log(`📨 Ingesting: [${normalized.type}] from ${maskedFrom}`);

          // 3. AUDITORÍA FORENSE (DB - Fire & Forget controlado)
          // Registramos que llegó el mensaje ANTES de procesarlo
          this.auditLogger.logIncoming(normalized).catch(err =>
             this.logger.error(`Failed to audit incoming msg: ${err.message}`)
          );

          // 4. DESPACHO AL CÓRTEX
          await this.flowService.dispatch(normalized);
        }
      }
    }
  }
}
