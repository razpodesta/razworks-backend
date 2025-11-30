// RUTA: apps/web-admin/src/app/auth/callback/route.ts
// VERSIÓN: 2.0 - Auth Callback Seguro & Next.js 15 Compliant
// AUTOR: Raz Podestá - MetaShark Tech
// DESCRIPCIÓN: Maneja el intercambio de código de autenticación de Supabase (OAuth/Magic Link).
//              Elimina aserciones no nulas (!) validando variables de entorno explícitamente.
//              Maneja cookies de forma asíncrona para compatibilidad con Next.js 15.

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // "next" es una redirección opcional para enviar al usuario después del login
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // En Next.js 15, el acceso a cookies es asíncrono.
    const cookieStore = await cookies();

    // 1. Extracción segura de variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Guardián de Integridad: Validación explícita en lugar de '!'
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        '[CRITICAL AUTH ERROR] Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Verifica tu .env.local.'
      );
      // Redirigimos a una página de error genérica para no exponer detalles al usuario, pero loggeamos el error.
      return NextResponse.redirect(`${origin}/server-error?code=AUTH_CONFIG_MISSING`);
    }

    // 3. Creación del Cliente de Servidor
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignoramos el error si se intenta setear cookies desde un Server Component
              // que no permite escritura (aunque en Route Handlers sí se permite).
            }
          },
        },
      }
    );

    // 4. Intercambio de código por sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirección exitosa a la página de destino o home
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('[AUTH ERROR] Fallo al intercambiar código por sesión:', error.message);
    }
  }

  // Si no hay código o hubo error en el intercambio, redirigir a página de error de auth
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
