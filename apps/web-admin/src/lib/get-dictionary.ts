// RUTA: apps/web-admin/src/lib/get-dictionary.ts
/**
 * @fileoverview Cargador de Diccionarios Tipado
 * @module Lib/i18n
 */
import 'server-only';
import type { Locale } from '@/config/i18n.config';
// Asumimos que existe un esquema, si no, usamos Record<string, any> temporalmente para desbloquear
// Lo ideal es importar el tipo Dictionary real generado.
type Dictionary = Record<string, any>; 

const dictionaries = {
  'en-US': () => import('../dictionaries/en-US.json').then((module) => module.default),
  'es-ES': () => import('../dictionaries/es-ES.json').then((module) => module.default),
  'pt-BR': () => import('../dictionaries/pt-BR.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // Fallback seguro a pt-BR si el locale no existe en el mapa
  const loader = dictionaries[locale] || dictionaries['pt-BR'];
  return loader();
};
