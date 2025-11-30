// RUTA: apps/web-admin/src/components/layout/NavigationTracker.tsx
// VERSIÓN: 2.0 - Admin Audit Trail (Silent)
// DESCRIPCIÓN: Registra el historial de navegación en una cookie.
//              Vital para la UX de "volver atrás" y auditoría de sesión.
//              Sin logs de consola para cumplir con las reglas de producción.

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';

const HISTORY_COOKIE_NAME = 'raz_admin_trace';
const MAX_HISTORY_LENGTH = 10; // Guardamos menos pasos para optimizar cookie

export function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Referencia para evitar duplicados en React Strict Mode
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Construimos la URL completa
    const params = searchParams.toString();
    const url = params ? `${pathname}?${params}` : pathname;

    // Filtros de ruido:
    // 1. Evitar duplicados consecutivos
    // 2. Ignorar rutas internas de Next.js o API
    if (url === lastTrackedPath.current || url.startsWith('/_next') || url.includes('/api/')) {
      return;
    }

    lastTrackedPath.current = url;

    try {
      // Gestión de la Pila de Historia (LIFO Stack)
      const existingCookie = getCookie(HISTORY_COOKIE_NAME);
      let history: string[] = [];

      if (existingCookie && typeof existingCookie === 'string') {
        try {
          history = JSON.parse(existingCookie);
        } catch {
          history = [];
        }
      }

      // Timestamp + Ruta para auditoría precisa
      const entry = `${Date.now()}|${url}`;

      // Mantenemos solo los últimos N pasos
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY_LENGTH);

      // Cookie de sesión (sin expiración larga, muere al cerrar navegador)
      // SameSite 'Lax' es suficiente para navegación interna
      setCookie(HISTORY_COOKIE_NAME, JSON.stringify(newHistory), {
        path: '/',
        sameSite: 'lax',
      });

    } catch {
      // Silencio total en caso de error de cookies (Fail Safe)
    }

  }, [pathname, searchParams]);

  // Componente lógico puro ("Headless UI")
  return null;
}
