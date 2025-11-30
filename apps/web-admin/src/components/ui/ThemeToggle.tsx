// RUTA: apps/web-admin/src/components/ui/ThemeToggle.tsx
// VERSIÓN: 3.2 - Lint Compliance & React 19 Pattern
// AUTOR: Raz Podestá - MetaShark Tech
// DESCRIPCIÓN: Control maestro de tema. Utiliza 'useSyncExternalStore' para
//              manejar la hidratación sin efectos de cascada. Se ha ajustado
//              la sintaxis del 'subscribe' para satisfacer reglas estrictas de ESLint.

'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useSyncExternalStore } from 'react';

/**
 * Hook utilitario para detectar si estamos en el cliente.
 * Utiliza useSyncExternalStore para evitar el anti-patrón useEffect+setState.
 */
function useMounted() {
  return useSyncExternalStore(
    () => {
      // La suscripción es necesaria por contrato, pero para este caso de uso
      // (verificar montaje) no necesitamos escuchar eventos externos.
      // Retornamos una función de limpieza vacía documentada.
      return () => {
        // No cleanup required
      };
    },
    () => true,     // getSnapshot (Cliente): siempre true
    () => false     // getServerSnapshot (Servidor): siempre false
  );
}

export function ThemeToggle() {
  // 1. Estado de Montaje (Optimizado y Lint-Safe)
  const mounted = useMounted();

  // 2. Hooks del Tema
  const { theme, setTheme } = useTheme();

  // 3. Renderizado Defensivo (Skeleton)
  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full">
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      // THEMED: Tokens semánticos para adaptación automática
      className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Moon size={18} strokeWidth={1.5} className="transition-transform duration-200 active:scale-90" />
      ) : (
        <Sun size={18} strokeWidth={1.5} className="transition-transform duration-200 active:scale-90" />
      )}
    </button>
  );
}
