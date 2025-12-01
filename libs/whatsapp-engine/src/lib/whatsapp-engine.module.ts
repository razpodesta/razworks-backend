/**
 * @fileoverview WhatsApp Engine Module (Production Optimized v3 - Agentic)
 * @module WhatsApp/Root
 * @description
 * Topología final.
 * - Conecta con Database (Audit/User).
 * - Conecta con AI System (Agentic Coordinator).
 * - Conecta con Toolbox (Herramientas concretas).
 */

import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiSystemModule } from '@razworks/ai';
import { NotificationsModule } from '@razworks/notifications';
import { DatabaseModule } from '@razworks/database';
// ✅ Importación de Módulos de Herramientas
import { ToolboxClientModule } from '@razworks/toolbox-client';
import { ToolboxRazterModule } from '@razworks/toolbox-razter';
import { ToolboxSharedModule } from '@razworks/toolbox-shared'; // Para el ToolRegistryService

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
import { ConversationLoggerService } from '../services/conversation-logger.service';
import { WhatsAppToolingService } from '../services/whatsapp-tooling.service'; // ✅ Nuevo Servicio

// Workers
import { OrchestratorWorker } from '../workers/orchestrator.worker';
import { AudioWorker } from '../workers/audio.worker';
import { SecurityWorker } from '../workers/security.worker';

@Module({
  imports: [
    BullModule.registerFlowProducer({ name: 'whatsapp-flow' }),
    NotificationsModule,
    AiSystemModule,
    DatabaseModule,
    // ✅ Importamos los módulos de Toolbox para acceder a sus providers exportados
    ToolboxSharedModule,
    ToolboxClientModule,
    ToolboxRazterModule
  ],
  controllers: [WhatsAppController],
  providers: [
    // Logic & Core
    WhatsAppGatewayService,
    WhatsAppMapper,
    ConversationFlowService,
    PromptEngineeringService,
    ConversationLoggerService,
    WhatsAppToolingService, // ✅ Inicializador de Herramientas

    // Infrastructure
    WhatsAppClient,
    WhatsAppMediaService,
    OutboundHumanizerService,
    SecurityScannerService,

    // Workers
    OrchestratorWorker,
    AudioWorker,
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
    this.logger.log('🚀 WhatsApp Engine: Agents Deployed & Tools Armed.');
  }
}
