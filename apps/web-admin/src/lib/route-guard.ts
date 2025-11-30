// RUTA: apps/web-admin/src/lib/route-guard.ts
// VERSIÓN: 7.0 - Seguridad de Tipos Robusta & Arquitectura Escalable
// @file Guardián de Rutas (Middleware Logic)
// @description Maneja la protección de rutas, RBAC y normalización de URLs.
//              Refactorizado para eliminar errores de comparación de tipos (TS2367)
//              mediante una simulación de sesión estrictamente tipada.
// @author Raz Podestá - MetaShark Tech

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';

// ===================================================================================
// DEFINICIONES DE TIPO Y CONTRATOS
// ===================================================================================

/**
 * Roles permitidos en el sistema.
 * Definido como unión de literales para uso en RBAC.
 */
type UserRole = 'user' | 'admin';

/**
 * Interfaz que simula el objeto de sesión de un proveedor de autenticación real.
 * Esto evita que TypeScript infiera tipos literales inmutables en los mocks.
 */
interface Session {
  isAuthenticated: boolean;
  role: UserRole;
}

// ===================================================================================
// CONFIGURACIÓN DE RUTAS
// ===================================================================================

/**
 * Prefijos de rutas que son accesibles públicamente sin autenticación.
 * El sistema es "Permisivo por defecto", pero esta lista ayuda a organizar
 * la lógica de exclusión explícita si se cambia la estrategia a "Restrictivo".
 */
const publicPathPrefixes = [
  '/',              // Homepage & Landing
  '/login',         // Autenticación
  '/quien-soy',     // Identidad
  '/mision-y-vision',
  '/contacto',
  '/blog',          // CMS Contenido
  '/servicios',     // Catálogo
  '/cocreacion',
  '/sistema-de-diseno',
  '/iconos',        // Herramientas
  '/tecnologias',
  '/legal',
  '/curriculum'
];

/**
 * Prefijo reservado para el panel de administración.
 * Requiere rol 'admin' estrictamente.
 */
const adminPathPrefix = '/admin';

// ===================================================================================
// UTILIDADES INTERNAS
// ===================================================================================

/**
 * Normaliza la ruta eliminando el prefijo de idioma para simplificar la comparación.
 * Ej: /pt-BR/blog/post-1 -> /blog/post-1
 *
 * @param pathname La ruta completa incluyendo el locale.
 * @param locale El locale actual detectado.
 */
function getPathWithoutLocale(pathname: string, locale: Locale): string {
  const path = pathname.replace(new RegExp(`^/${locale}`), '');
  // Asegura que siempre devolvemos al menos '/' para la raíz
  return path === '' ? '/' : path;
}

// ===================================================================================
// LÓGICA DEL GUARDIÁN (MAIN)
// ===================================================================================

/**
 * Ejecuta la lógica de protección de rutas.
 *
 * @param request La petición entrante de Next.js.
 * @param locale El idioma actual resuelto por el middleware.
 * @returns {NextResponse | null} Retorna un objeto redirect si se deniega el acceso, o null para permitir.
 */
export function routeGuard(request: NextRequest, locale: Locale): NextResponse | null {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = getPathWithoutLocale(pathname, locale);

  // ---------------------------------------------------------------------------
  // 1. VERIFICACIÓN DE RUTAS PÚBLICAS (WHITELIST)
  // ---------------------------------------------------------------------------
  // Si la ruta coincide exactamente con la raíz o empieza con un prefijo público,
  // permitimos el paso inmediatamente.
  const isPublic = publicPathPrefixes.some(prefix => {
    if (prefix === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale.startsWith(prefix);
  });

  if (isPublic) {
    return null; // Acceso concedido
  }

  // ---------------------------------------------------------------------------
  // 2. OBTENCIÓN DE SESIÓN (SIMULACIÓN TIPADA)
  // ---------------------------------------------------------------------------
  // Aquí simulamos la obtención de la sesión. En producción, esto vendría de:
  // const session = await supabase.auth.getSession();
  //
  // NOTA: Usamos la interfaz 'Session' explícitamente. Esto soluciona el error TS2367
  // al decirle al compilador que 'role' es un tipo amplio (UserRole), no el literal 'user',
  // permitiendo comparaciones lógicas válidas con 'admin'.
  const session: Session = {
    isAuthenticated: false, // Cambiar a true para simular login
    role: 'user',           // Cambiar a 'admin' para simular privilegios
  };

  // ---------------------------------------------------------------------------
  // 3. PROTECCIÓN DE RUTAS ADMINISTRATIVAS (RBAC)
  // ---------------------------------------------------------------------------
  if (pathWithoutLocale.startsWith(adminPathPrefix)) {
    // Lógica de Guardia: Debe estar autenticado Y tener rol de admin.
    if (!session.isAuthenticated || session.role !== 'admin') {
      console.warn(`[Security] Acceso denegado a ruta administrativa: ${pathname}`);
      // Redirigir a login, preservando el locale actual
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // ---------------------------------------------------------------------------
  // 4. RUTAS PRIVADAS GENERALES (COMPORTAMIENTO POR DEFECTO)
  // ---------------------------------------------------------------------------
  // Según la directriz actual: "por defecto todas las rutas son públicas".
  // Sin embargo, mantenemos la estructura lógica lista para proteger rutas de usuario
  // en el futuro (ej: /dashboard, /profile).

  /*
  // LÓGICA FUTURA PARA RUTAS PRIVADAS:
  if (!session.isAuthenticated) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  */

  // Por ahora, permitimos el acceso a cualquier ruta no capturada anteriormente.
  return null;
}
