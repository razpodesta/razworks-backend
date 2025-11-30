/**
 * @fileoverview Gateway Controller (REST)
 * @module WhatsApp/Gateway
 */
import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WhatsAppGatewayService } from '../services/whatsapp-gateway.service';
import { WhatsAppWebhookSchema, WhatsAppWebhookDto } from '../dto/webhook.schema';
import { ZodValidationPipe } from '@razworks/shared/utils';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly gatewayService: WhatsAppGatewayService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    this.logger.log(`🔍 Verifying Webhook...`);
    return this.gatewayService.verifyWebhook(mode, token, challenge);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleIncomingWebhook(
    @Body(new ZodValidationPipe(WhatsAppWebhookSchema)) body: WhatsAppWebhookDto
  ) {
    // ⚡ Fast Response Pattern:
    // Respondemos 200 OK a Meta en <200ms para evitar reintentos.
    // La lógica pesada corre en background (Fire & Forget controlado).

    this.gatewayService.processWebhook(body).catch(err => {
      // Capturamos errores asíncronos para que no tumben el proceso
      this.logger.error(`⚠️ Background Webhook Error: ${err.message}`, err.stack);
    });

    return { status: 'acknowledged' };
  }
}
