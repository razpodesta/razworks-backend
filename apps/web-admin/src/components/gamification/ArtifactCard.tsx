/**
 * @file ArtifactCard.tsx
 * @description Componente visual para artefactos de gamificación.
 * @standard ELITE - TYPE SAFE & CLEAN
 */

'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { Hexagon, Sparkles, Shield, Zap } from 'lucide-react';
import type { Artifact } from '@/lib/gamification/types';

// Estilos base definidos con CVA
const cardStyles = cva(
  "relative flex flex-col items-center justify-between p-6 rounded-2xl border transition-all duration-500 overflow-hidden group hover:-translate-y-2",
  {
    variants: {
      rarity: {
        COMMON: "bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-500/10",
        RARE: "bg-blue-950/30 border-blue-900/50 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20",
        LEGENDARY: "bg-purple-950/30 border-purple-900/50 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/30",
        MYTHIC: "bg-amber-950/30 border-amber-900/50 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/30",
        UNIQUE: "bg-rose-950/30 border-rose-900/50 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/30",
      }
    },
    defaultVariants: {
      rarity: "COMMON"
    }
  }
);

// Definimos tipos de rareza explícitos para evitar 'any' implícito en índices
type RarityType = 'COMMON' | 'RARE' | 'LEGENDARY' | 'MYTHIC' | 'UNIQUE';

const textColors: Record<RarityType, string> = {
  COMMON: "text-zinc-400",
  RARE: "text-blue-400",
  LEGENDARY: "text-purple-400",
  MYTHIC: "text-amber-400",
  UNIQUE: "text-rose-400",
};

const HouseIcon = ({ house, className }: { house: string; className?: string }) => {
  switch (house) {
    case 'ARCHITECTS': return <Shield className={className} />;
    case 'WEAVERS': return <Hexagon className={className} />;
    case 'ANOMALIES': return <Zap className={className} />;
    default: return <Hexagon className={className} />;
  }
};

// Solución TS2322: Extendemos de HTMLMotionProps en lugar de HTMLAttributes
// para ser compatibles con <motion.div>. Omitimos 'onDrag' si no lo usamos o lo tipamos correctamente.
interface ArtifactCardProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  artifact: Artifact;
  isEquipped?: boolean;
  showValue?: boolean;
  // Exponemos las variantes de estilo explícitamente si es necesario
  variant?: VariantProps<typeof cardStyles>;
}

export function ArtifactCard({
  artifact,
  isEquipped = false,
  showValue = true,
  className,
  ...props
}: ArtifactCardProps) {

  // Validación segura de rareza
  const rarity = (artifact.rarity as RarityType) || 'COMMON';
  const rarityColor = textColors[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      // TS Fix: Pasamos las props rest de manera segura
      className={`${cardStyles({ rarity })} ${className || ''}`}
      {...props}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      {isEquipped && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/50 text-[10px] font-bold text-green-400 uppercase tracking-wider shadow-sm shadow-green-900/20">
          Equipado
        </div>
      )}

      <div className={`mb-4 p-4 rounded-full bg-black/40 border border-white/5 shadow-inner ${rarityColor}`}>
        <HouseIcon house={artifact.house} className="w-8 h-8" />
      </div>

      <div className="text-center z-10">
        <h3 className={`font-display text-lg font-bold uppercase tracking-tight ${rarityColor} brightness-125 group-hover:brightness-150 transition-all`}>
          {artifact.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
           <span className="text-[10px] font-mono text-zinc-500 uppercase">{artifact.house}</span>
           <span className="text-zinc-700">•</span>
           <span className={`text-[10px] font-bold uppercase ${rarityColor}`}>{rarity}</span>
        </div>

        <p className="mt-4 text-xs text-zinc-400 font-sans leading-relaxed line-clamp-3">
          {artifact.description}
        </p>
      </div>

      {showValue && (
        <div className="mt-6 w-full pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Valor Base</span>
          <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-zinc-300">
            <Sparkles size={12} className="text-yellow-500" />
            {artifact.baseValue} <span className="text-zinc-600 text-[10px]">RZB</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
