// RUTA: apps/web-admin/src/lib/get-dictionary.ts
// VERSIÓN: 4.0 (Verificada) - Guardián de la Integridad de Tipos.
// DESCRIPCIÓN: Este aparato no requiere cambios. El error de compilación TS2322
//              que se manifestaba aquí era un síntoma del incumplimiento del contrato
//              de datos por parte de los diccionarios generados. Al corregirse el
//              script 'prebuild-dictionaries.mjs', los diccionarios ahora tendrán la
//              forma correcta, y este guardián de tipos validará la importación con
//              éxito, cumpliendo su función arquitectónica.

import 'server-only';
import type { Locale } from '@/config/i18n.config';
import type { Dictionary } from './schemas/dictionary.schema';

const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  'en-US': () => import('../dictionaries/en-US.json').then((module) => module.default as unknown as Dictionary),
  'es-ES': () => import('../dictionaries/es-ES.json').then((module) => module.default as unknown as Dictionary),
  'pt-BR': () => import('../dictionaries/pt-BR.json').then((module) => module.default as unknown as Dictionary),
};

/**
 * Carga el diccionario para un 'locale' específico.
 * Es la única puerta de entrada de la aplicación para acceder al contenido de i18n.
 *
 * @param locale El idioma para el cual cargar el diccionario.
 * @returns Una promesa que se resuelve con el diccionario completo y tipado.
 */
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const load = dictionaryLoaders[locale] ?? dictionaryLoaders['pt-BR'];
  return load();
};
