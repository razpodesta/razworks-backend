/**
 * @fileoverview Servicio de Gateway (Lightweight Router & Humanizer)
 * @module WhatsApp/Services
 * @description
 * Recibe Webhooks, normaliza y DISPARA EL CHECK AZUL inmediatamente.
 */
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { WhatsAppWebhookDto } from '../dto/webhook.schema';
import { ConversationFlowService } from './conversation-flow.service';
import { WhatsAppMapper } from './whatsapp-mapper.service';
import { WhatsAppClient } from './whatsapp-client.service'; // ✅ Inyección del Cliente

@Injectable()
export class WhatsAppGatewayService {
  private readonly logger = new Logger(WhatsAppGatewayService.name);

  constructor(
    private readonly flowService: ConversationFlowService,
    private readonly mapper: WhatsAppMapper,
    private readonly client: WhatsAppClient // ✅ Cliente Inyectado
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

    // Filtro de ruido: Ignorar notificaciones de estado (sent, delivered, read)
    if (changes.statuses) return;

    if (changes.messages && changes.messages.length > 0) {
      for (const rawMsg of changes.messages) {

        // 1. FEEDBACK INMEDIATO: Marcar como leído (Human Behavior)
        // Fire & Forget: No esperamos a que termine para no bloquear la ingesta
        this.client.markAsRead(rawMsg.id).catch(e =>
          this.logger.warn(`Non-critical: Could not mark ${rawMsg.id} as read: ${e.message}`)
        );

        // 2. Normalización (Delegada al Mapper)
        const normalized = this.mapper.normalize(rawMsg);

        if (normalized) {
          const maskedFrom = normalized.from.replace(/\d{4}$/, 'XXXX');
          this.logger.log(`📨 Ingesting: [${normalized.type}] from ${maskedFrom}`);

          // 3. Despacho al Sistema Nervioso (BullMQ)
          await this.flowService.dispatch(normalized);
        }
      }
    }
  }
}
