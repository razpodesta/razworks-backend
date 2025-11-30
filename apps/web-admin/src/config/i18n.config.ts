// RUTA: apps/web-admin/src/config/i18n.config.ts
// VERSIÓN: 5.1 - Configuración Maestra de Internacionalización
// DESCRIPCIÓN: Define 'pt-BR' como el idioma por defecto innegociable y tipa los locales permitidos.

export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
  cookieName: 'NEXT_LOCALE', // Centralizamos el nombre de la cookie
} as const;

export type Locale = (typeof i18n)['locales'][number];
