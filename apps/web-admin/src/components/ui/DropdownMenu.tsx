// RUTA: apps/web-admin/src/components/ui/DropdownMenu.tsx
// VERSIÓN: 1.1 - Con Tipado Explícito para Variantes de Animación

'use client';

import { useState, useRef, useEffect } from 'react';
// --- INICIO DE LA CORRECCIÓN ---
// Se importa explícitamente el tipo 'Variants' desde framer-motion.
import { motion, AnimatePresence, type Variants } from 'framer-motion';
// --- FIN DE LA CORRECCIÓN ---

type DropdownMenuProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
  // Al declarar la constante con el tipo ': Variants', le damos a TypeScript
  // el contexto necesario para que entienda que las cadenas 'easeOut' y 'easeIn'
  // son valores válidos y permitidos para la propiedad 'ease'.
  // Esto resuelve el error de asignación de tipos.
  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full mt-2 w-max origin-top-left rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/40 z-50"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
