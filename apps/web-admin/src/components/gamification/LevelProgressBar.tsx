// RUTA: apps/web-admin/src/components/gamification/LevelProgressBar.tsx
'use client';

import { motion } from 'framer-motion';

type LevelProgressBarProps = {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  labels: {
    level: string;
    xp: string;
  };
};

export function LevelProgressBar({
  currentLevel,
  currentXp,
  nextLevelXp,
  progressPercent,
  labels,
}: LevelProgressBarProps) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {labels.level}
          </span>
          <h2 className="font-display text-4xl font-bold text-white">{currentLevel}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {labels.xp}
          </span>
          <p className="font-mono text-sm text-purple-400">
            {currentXp} <span className="text-zinc-600">/</span> {nextLevelXp}
          </p>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-zinc-950 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600"
        >
          {/* Efecto de brillo en movimiento */}
          <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
