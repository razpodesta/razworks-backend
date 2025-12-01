/**
 * @fileoverview Public API del Sistema Cognitivo (Córtex v2)
 * @module Libs/AiSystem
 * @description
 * Punto de entrada único para consumidores externos (API, WhatsApp, Workers).
 * Exporta solo lo necesario para interactuar con el cerebro del sistema.
 */

// 1. Contratos y Puertos
export * from './lib/ports/ai-provider.port';

// 2. Configuración
export * from './lib/config/ai-env.config';

// 3. Subsistema Neuronal (Memoria)
export * from './lib/neural/neural-context.manager';
export * from './lib/neural/neural.repository'; // Exportamos tipos como NeuralMessage

// 4. Fachadas de Inteligencia (Servicios Principales)
export * from './lib/facades/cognitive-core.service';
export * from './lib/services/agentic-coordinator.service';

// 5. Utilidades de Soporte
export * from './lib/prompts/prompt.registry';
export * from './lib/adapters/gemini-schema.mapper';
export * from './lib/cache/semantic-cache.service';

// 6. El Módulo (NestJS Entry Point)
export * from './lib/ai-system.module';
