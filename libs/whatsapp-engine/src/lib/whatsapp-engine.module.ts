// libs/whatsapp-engine/src/lib/whatsapp-engine.module.ts
import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppGatewayService } from '../services/whatsapp-gateway.service';
import { ConversationFlowService } from '../services/conversation-flow.service';

// Workers
import { OrchestratorWorker } from '../workers/orchestrator.worker';
import { AudioWorker } from '../workers/audio.worker';
import { SecurityWorker } from '../workers/security.worker'; // ✅ Nuevo

@Module({
  imports: [
    BullModule.registerFlowProducer({
      name: 'whatsapp-flow',
    }),
    // Registramos las colas que consumiremos aquí si es necesario,
    // o confiamos en que BullMQ crea las colas al vuelo al registrar los Workers.
  ],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppGatewayService,
    ConversationFlowService,
    // Workers (Consumers)
    OrchestratorWorker,
    AudioWorker,
    SecurityWorker,
  ],
  exports: [WhatsAppGatewayService, ConversationFlowService],
})
export class WhatsAppEngineModule implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppEngineModule.name);

  onModuleInit() {
    this.logger.log('🚀 WhatsApp Engine Loaded: Workers [Orchestrator, Audio, Security] Ready.');
  }
}
