/**
 * @fileoverview WhatsApp Engine Module (Production Optimized)
 * @module WhatsApp/Root
 * @description
 * Topología final limpia. Integra el Córtex Global y el Sistema de Alertas.
 */

import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiSystemModule } from '@razworks/ai'; // ✅ Córtex Global Correcto
import { NotificationsModule } from '@razworks/notifications';

// Controllers
import { WhatsAppController } from './whatsapp.controller';

// Services
import { WhatsAppGatewayService } from '../services/whatsapp-gateway.service';
import { ConversationFlowService } from '../services/conversation-flow.service';
import { WhatsAppMapper } from '../services/whatsapp-mapper.service';
import { PromptEngineeringService } from '../services/prompt-engineering.service';
import { WhatsAppClient } from '../services/whatsapp-client.service';
import { OutboundHumanizerService } from '../services/outbound-humanizer.service';
import { WhatsAppMediaService } from '../services/media-downloader.service';
import { SecurityScannerService } from '../services/security-scanner.service';

// Workers
import { OrchestratorWorker } from '../workers/orchestrator.worker';
import { AudioWorker } from '../workers/audio.worker';
import { SecurityWorker } from '../workers/security.worker';

@Module({
  imports: [
    BullModule.registerFlowProducer({ name: 'whatsapp-flow' }),
    NotificationsModule,
    AiSystemModule, // ✅ Importamos el módulo, no una clase inexistente
  ],
  controllers: [WhatsAppController],
  providers: [
    // Lógica Core
    WhatsAppGatewayService,
    WhatsAppMapper,
    ConversationFlowService,
    PromptEngineeringService,

    // Infraestructura
    WhatsAppClient,
    WhatsAppMediaService,
    OutboundHumanizerService,
    SecurityScannerService,

    // Workers
    OrchestratorWorker,
    AudioWorker, // ✅ Aseguramos que este provider exista (ver archivo abajo)
    SecurityWorker,
  ],
  exports: [
    WhatsAppGatewayService,
    ConversationFlowService
  ],
})
export class WhatsAppEngineModule implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppEngineModule.name);

  onModuleInit() {
    this.logger.log('🚀 WhatsApp Engine [PROD]: Neural Link Established. Sentinels Active.');
  }
}
