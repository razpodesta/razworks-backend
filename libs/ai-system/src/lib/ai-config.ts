/**
 * @fileoverview CONFIGURACIÓN DE MODELOS IA
 * @module Libs/AiSystem/Config
 * @description Fuente de verdad para nombres de modelos y temperaturas.
 */

export const AI_MODELS = {
  FAST: 'gemini-2.5-flash',
  THINKING: 'gemini-2.5-pro',
  LEGACY: 'gemini-1.5-flash',
} as const;

export const AI_CONFIG = {
  TEMPERATURE: {
    CREATIVE: 0.7,
    PRECISE: 0.1,
  },
} as const;
