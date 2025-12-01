/**
 * @fileoverview Badge Visual de Estado del Sistema
 * @module UI/Components
 * @description Indicador visual pulsante para feedback de conectividad.
 */
'use client';

import { cn } from '@/lib/utils'; // ✅ Usa la utilidad local de la app

interface StatusBadgeProps {
  status: 'ONLINE' | 'OFFLINE';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isOnline = status === 'ONLINE';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
        isOnline
          ? "bg-green-500/10 text-green-500 border-green-500/20"
          : "bg-red-500/10 text-red-500 border-red-500/20",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          isOnline ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className="tracking-wide font-mono">
        RAZWORKS: {status}
      </span>
    </span>
  );
}
