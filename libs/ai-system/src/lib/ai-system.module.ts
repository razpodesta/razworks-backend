/**
 * @fileoverview Módulo del Sistema Cognitivo (Córtex v2.2 - Clean)
 * @module AiSystem
 */

import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from '@razworks/database';
import { ToolboxSharedModule } from '@razworks/toolbox-shared';

import { AiProviderFactory } from './factories/ai-provider.factory';
import { AiProviderPort } from './ports/ai-provider.port';
// AiConfigService removido de imports porque no se usa explícitamente en el módulo
import { NeuralContextManager } from './neural/neural-context.manager';
import { NeuralRepository } from './neural/neural.repository';
import { ContextAssemblerService } from './neural/context-assembler.service';
import { SemanticCacheService } from './cache/semantic-cache.service';
import { TokenMeterService } from './usage/token-meter.service';
import { CognitiveCoreService } from './facades/cognitive-core.service';
import { GeminiSchemaMapper } from './adapters/gemini-schema.mapper';
import { AgenticCoordinatorService } from './services/agentic-coordinator.service';
import { ToolExecutorService } from './services/tool-executor.service';
import { PromptRegistry } from './prompts/prompt.registry';

@Global()
@Module({
  imports: [
    DatabaseModule,
    ToolboxSharedModule
  ],
  providers: [
    AiProviderFactory,
    {
      provide: AiProviderPort,
      useFactory: (factory: AiProviderFactory) => factory.create(),
      inject: [AiProviderFactory],
    },
    NeuralRepository,
    ContextAssemblerService,
    NeuralContextManager,
    SemanticCacheService,
    TokenMeterService,
    CognitiveCoreService,
    GeminiSchemaMapper,
    AgenticCoordinatorService,
    ToolExecutorService,
  ],
  exports: [
    AiProviderPort,
    NeuralContextManager,
    CognitiveCoreService,
    AgenticCoordinatorService,
    SemanticCacheService,
    GeminiSchemaMapper
  ],
})
export class AiSystemModule implements OnModuleInit {
  private readonly logger = new Logger(AiSystemModule.name);

  onModuleInit() {
    const promptCount = Object.keys(PromptRegistry).length;
    this.logger.log(`🧠 Córtex Cognitivo Online. Prompts: ${promptCount}`);
  }
}
