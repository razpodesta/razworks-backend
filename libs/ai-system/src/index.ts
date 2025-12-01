/**
 * @fileoverview Public API del Sistema Cognitivo (Córtex)
 * @module Libs/AiSystem
 * @description
 * Punto de entrada único. Exporta puertos, fachadas y tipos de datos críticos.
 */

// 1. Puertos y Contratos (Hexagonal)
export * from './lib/ports/ai-provider.port';

// 2. Fachada de Memoria Neuronal
export * from './lib/neural/neural-context.manager';

// 3. Tipos de Datos Neuronales (✅ FIX: Exposición de NeuralMessage)
export * from './lib/neural/neural.repository';

// 4. Configuración
export * from './lib/config/ai-env.config';

// 5. El Módulo (NestJS Entry Point)
export * from './lib/ai-system.module';
