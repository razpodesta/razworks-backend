// apps/web-admin/src/components/ui/FadeIn.tsx

/**
 * @file Wrapper de Animación FadeIn.
 * @version 1.0 - Client Component Soberano
 * @description Aísla la lógica de Framer Motion para permitir su uso seguro
 *              dentro de Server Components y evitar errores de hidratación.
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className = '', delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
