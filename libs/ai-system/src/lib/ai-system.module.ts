/**
 * @fileoverview Módulo del Sistema Cognitivo (Córtex v2 - Full Stack)
 * @module AiSystem
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Configura y exporta la totalidad del aparato cognitivo.
 * Integra:
 * 1. Adaptadores de IA (Google).
 * 2. Subsistema Neuronal (Memoria).
 * 3. Capa de Optimización (Caché y Costos).
 * 4. Capa Agéntica (Coordinación de Herramientas).
 */

import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from '@razworks/database'; // ✅ Requerido para TokenMeter y Persistencia

// --- CONFIGURACIÓN & FACTORIES ---
import { AiProviderFactory } from './factories/ai-provider.factory';
import { AiProviderPort } from './ports/ai-provider.port';
import { AiConfigService } from './config/ai-env.config';

// --- SUBSISTEMA NEURONAL (MEMORIA) ---
import { NeuralContextManager } from './neural/neural-context.manager';
import { NeuralRepository } from './neural/neural.repository';
import { ContextAssemblerService } from './neural/context-assembler.service';

// --- SUBSISTEMA DE OPTIMIZACIÓN (EFICIENCIA) ---
import { SemanticCacheService } from './cache/semantic-cache.service';
import { TokenMeterService } from './usage/token-meter.service';
import { CognitiveCoreService } from './facades/cognitive-core.service';

// --- SUBSISTEMA AGÉNTICO (HERRAMIENTAS) ---
import { GeminiSchemaMapper } from './adapters/gemini-schema.mapper';
import { AgenticCoordinatorService } from './services/agentic-coordinator.service';
import { PromptRegistry } from './prompts/prompt.registry';

@Global()
@Module({
  imports: [
    DatabaseModule // Inyección cruzada para auditoría y métricas
  ],
  providers: [
    // 1. Infraestructura Base
    AiProviderFactory,
    {
      provide: AiProviderPort,
      useFactory: (factory: AiProviderFactory) => {
        const logger = new Logger('AiSystemInit');
        const provider = factory.create();
        logger.log(`🧠 AI Adapter Loaded: [${AiConfigService.provider.toUpperCase()}]`);
        return provider;
      },
      inject: [AiProviderFactory],
    },

    // 2. Memoria
    NeuralRepository,
    ContextAssemblerService,
    NeuralContextManager,

    // 3. Optimización
    SemanticCacheService,
    TokenMeterService,
    CognitiveCoreService,

    // 4. Agencia
    GeminiSchemaMapper,
    AgenticCoordinatorService,
  ],
  exports: [
    // Exponemos las Fachadas de Alto Nivel para el resto del sistema
    AiProviderPort,            // Acceso crudo (Legacy/Low-level)
    NeuralContextManager,      // Gestión de Memoria Conversacional
    CognitiveCoreService,      // Pensamiento con Caché y Métricas
    AgenticCoordinatorService, // Pensamiento con Uso de Herramientas
    SemanticCacheService,      // Utilidad de caché expuesta
    GeminiSchemaMapper         // Utilidad de mapeo
  ],
})
export class AiSystemModule implements OnModuleInit {
  private readonly logger = new Logger(AiSystemModule.name);

  onModuleInit() {
    // Validación de integridad al arranque
    const promptCount = Object.keys(PromptRegistry).length; // Dummy check para asegurar carga de clase estática
    this.logger.log(`🧠 Córtex Cognitivo Online. Prompts Cargados: ${promptCount}`);
  }
}
