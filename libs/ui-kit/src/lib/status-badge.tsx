/**
 * @fileoverview Badge de Estado del Sistema
 * @module UI/Atoms
 */
import React from 'react';

interface StatusBadgeProps {
  status: 'ONLINE' | 'OFFLINE';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = status === 'ONLINE'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass} inline-flex items-center gap-2`}>
      <span className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      RAZWORKS: {status}
    </span>
  );
}
