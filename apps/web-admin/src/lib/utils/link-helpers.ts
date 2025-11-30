// RUTA: apps/web-admin/src/lib/utils/link-helpers.ts
// VERSIÓN: 1.0 - Generador de Rutas Localizadas
// DESCRIPCIÓN: Inyecta el idioma actual en rutas internas, respetando anclas y enlaces externos.

import { type Locale } from '@/config/i18n.config';

/**
 * Transforma una ruta abstracta (ej: /#contact) en una ruta localizada (ej: /pt-BR/#contact).
 * Ignora enlaces externos (http/https/mailto).
 */
export function getLocalizedHref(href: string | undefined, currentLang: Locale): string {
  if (!href) return '#';

  // 1. Enlaces externos o anclas vacías: se retornan tal cual.
  if (href.startsWith('http') || href.startsWith('mailto:') || href === '#') {
    return href;
  }

  // 2. Si la ruta ya tiene el idioma (edge case), no lo duplicamos.
  if (href.startsWith(`/${currentLang}`)) {
    return href;
  }

  // 3. Limpieza: Asegurar que la ruta empiece con / si no es un ancla directa en la misma página
  // Si es solo '#id', asumimos navegación en la misma página y no tocamos (o prefijamos si queremos forzar home).
  // Para la arquitectura actual donde los links del menú van a la home, forzamos la ruta completa.
  const cleanHref = href.startsWith('/') ? href : `/${href}`;

  // 4. Construcción de la ruta localizada.
  // Se elimina la barra final para evitar trailing slashes innecesarios.
  return `/${currentLang}${cleanHref}`.replace(/\/$/, '');
}
