import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { AiProviderFactory } from './factories/ai-provider.factory';
import { AiProviderPort } from './ports/ai-provider.port';
import { AiConfigService } from './config/ai-env.config';

// Subsistema Neuronal (Atomizado)
import { NeuralContextManager } from './neural/neural-context.manager';
import { NeuralRepository } from './neural/neural.repository';
import { ContextAssemblerService } from './neural/context-assembler.service';

@Global()
@Module({
  providers: [
    // Core AI Services
    AiProviderFactory,

    // Neural Subsystem
    NeuralRepository,      // Infra
    ContextAssemblerService, // Lógica Pura
    NeuralContextManager,  // Fachada

    // Dynamic AI Provider
    {
      provide: AiProviderPort,
      useFactory: (factory: AiProviderFactory) => {
        const logger = new Logger('AiSystemInit');
        const provider = factory.create();
        logger.log(`🧠 Cognitive Core Online: [${AiConfigService.provider.toUpperCase()}]`);
        return provider;
      },
      inject: [AiProviderFactory],
    },
  ],
  exports: [
    AiProviderPort,       // Para generar texto/embeddings
    NeuralContextManager, // Para gestionar memoria
  ],
})
export class AiSystemModule implements OnModuleInit {
  onModuleInit() {
    // Bootstrap checks if needed
  }
}
