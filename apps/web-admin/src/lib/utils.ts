// INICIO DEL ARCHIVO [apps/web-admin/src/lib/utils.ts]
/**
 * @fileoverview Utilidades de Estilo (App Internal)
 * @module WebAdmin/Lib/Utils
 * @description Fusión inteligente de clases Tailwind.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// FIN DEL ARCHIVO [apps/web-admin/src/lib/utils.ts]
