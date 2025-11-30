/**
 * @fileoverview Configuración Maestra de Internacionalización
 * @module Config/i18n
 */

export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
} as const;

// Exportamos el tipo 'Locale' derivado de la constante para uso estricto
export type Locale = (typeof i18n)['locales'][number];