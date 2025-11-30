// RUTA: apps/web-admin/src/components/ui/ColorWaveBar.tsx
// VERSIÓN: 2.0 - Componente reutilizable con props para posición y dirección.

'use client';

import { motion } from 'framer-motion';

// --- Definición de las Props del Componente ---
// Esto permite controlar la barra desde donde se la llama.
type ColorWaveBarProps = {
  /** Determina si la barra aparece en la parte superior o inferior del contenedor. */
  position?: 'top' | 'bottom';
  /** Controla la dirección del flujo del degradado. */
  direction?: 'left-to-right' | 'right-to-left';
};

export function ColorWaveBar({
  position = 'bottom', // Valor por defecto
  direction = 'left-to-right', // Valor por defecto
}: ColorWaveBarProps) {

  // --- Lógica condicional para la animación ---
  // Se define el punto de inicio y fin de la animación basado en la dirección.
  const backgroundPosition = direction === 'left-to-right'
    ? ['0% 50%', '400% 50%']
    : ['400% 50%', '0% 50%'];

  return (
    <motion.div
      // --- El posicionamiento ahora es dinámico basado en las props ---
      className={`absolute left-0 w-full h-1 overflow-hidden z-10 ${
        position === 'top' ? 'top-0' : 'bottom-0'
      }`}
    >
      <motion.div
        className="h-full w-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500"
        style={{
          backgroundSize: '400% 100%',
        }}
        animate={{
          backgroundPosition,
        }}
        transition={{
          duration: 20, // Aumentamos la duración para un efecto más sutil
          ease: 'linear',
          repeat: Infinity, // La animación ahora es un bucle infinito y continuo
        }}
      />
    </motion.div>
  );
}
