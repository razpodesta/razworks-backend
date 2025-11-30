// RUTA: apps/web-admin/src/components/ui/Flag.tsx
// VERSIÓN: 1.0 - Componente de Bandera Soberano y de Alto Rendimiento.
// DESCRIPCIÓN: Este componente reemplaza la dependencia externa 'react-flag-kit'.
//              Renderiza una bandera SVG optimizada desde una CDN, utilizando el
//              componente 'next/image' para garantizar el mejor rendimiento y
//              evitar 'layout shifts'. Es una pieza de UI de élite, autocontenida
//              y sin dependencias externas.

'use client';

import Image from 'next/image';

type FlagProps = {
  /** El código de país de 2 letras en formato ISO 3166-1 alpha-2 (ej. 'US', 'BR'). */
  countryCode: string;
  /** Clases de Tailwind CSS para aplicar estilo personalizado, principalmente tamaño (ej. 'h-5 w-5'). */
  className?: string;
};

/**
 * Muestra la bandera de un país utilizando un CDN rápido para SVGs.
 */
export function Flag({ countryCode, className = 'h-6 w-6' }: FlagProps) {
  // Se convierte el código de país a minúsculas, como lo requiere la URL del CDN.
  const lowerCaseCode = countryCode.toLowerCase();

  // Construimos la URL del recurso de la bandera.
  // Usamos flagcdn.com, un servicio optimizado para este propósito.
  const flagUrl = `https://flagcdn.com/${lowerCaseCode}.svg`;

  return (
    <div className={`relative overflow-hidden rounded-sm ${className}`}>
      <Image
        src={flagUrl}
        alt={`Bandera de ${countryCode}`}
        // 'fill' hace que la imagen ocupe todo el espacio de su contenedor padre.
        fill
        // 'sizes' ayuda a Next.js a priorizar la carga. 32px es un tamaño razonable.
        sizes="32px"
        // 'unoptimized' puede ser útil para SVGs si no se requiere una optimización compleja.
        // En este caso, lo dejamos para que Next.js maneje el cacheo.
      />
    </div>
  );
}
