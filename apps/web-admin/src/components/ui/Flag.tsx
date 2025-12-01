// INICIO DEL ARCHIVO [apps/web-admin/src/components/ui/Flag.tsx]
/**
 * @fileoverview Componente de Bandera (CDN Based)
 * @module UI/Flag
 */
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface FlagProps {
  countryCode: string; // ISO 3166-1 alpha-2 (US, BR, ES)
  className?: string;
}

export function Flag({ countryCode, className }: FlagProps) {
  const lowerCaseCode = countryCode.toLowerCase();
  // Usamos flagcdn por su velocidad y consistencia
  const flagUrl = `https://flagcdn.com/${lowerCaseCode}.svg`;

  return (
    <div className={cn("relative overflow-hidden rounded-sm inline-block shadow-sm", className || "h-4 w-6")}>
      <Image
        src={flagUrl}
        alt={`Bandera de ${countryCode}`}
        fill
        sizes="32px"
        className="object-cover"
        unoptimized // SVG vectorial
      />
    </div>
  );
}
// FIN DEL ARCHIVO [apps/web-admin/src/components/ui/Flag.tsx]
