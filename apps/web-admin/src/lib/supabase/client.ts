// RUTA: apps/web-admin/src/lib/supabase/client.ts
// VERSIÓN: 4.0 - Patrón Singleton Validado
// DESCRIPCIÓN: Este módulo exporta una única instancia (singleton) del cliente de Supabase
//              para el navegador. La instancia solo se crea si las variables de entorno
//              necesarias son válidas, garantizando seguridad de tipos y un comportamiento
//              predecible en toda la aplicación.

import { createBrowserClient } from '@supabase/ssr';

// ===================================================================================
// SECCIÓN 1: Función de Creación y Validación
// Encapsulamos la lógica para poder llamarla y obtener una instancia.
// ===================================================================================

function getSupabaseBrowserClient() {
  // Leemos las variables de entorno dentro de la función.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Implementamos la validación "Fail-Fast".
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'CRITICAL ERROR: Supabase URL or Anon Key is missing. Please check your .env.local file.'
    );
  }

  // Si la validación pasa, TypeScript sabe que las variables son `string`.
  // Por lo tanto, no hay error al pasarlas a `createBrowserClient`.
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// ===================================================================================
// SECCIÓN 2: Exportación del Singleton
// ===================================================================================

// Creamos la única instancia del cliente de Supabase que se usará en toda la aplicación.
// Esta línea solo se ejecuta una vez cuando el módulo es importado por primera vez.
export const supabase = getSupabaseBrowserClient();
