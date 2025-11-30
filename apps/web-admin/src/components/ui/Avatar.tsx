// RUTA: apps/web-admin/src/components/ui/Avatar.tsx
// VERSIÓN: 1.0 - Componente de Identidad Dinámica (Imagen/Video)

import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';

// ===================================================================================
// DEFINICIÓN DE ESTILOS CON CVA (CLASS-VARIANCE-AUTHORITY)
// Esto permite crear variantes de estilo de una manera organizada y escalable.
// ===================================================================================

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
      size: {
        sm: 'h-10 w-10',
        md: 'h-16 w-16',
        lg: 'h-24 w-24',
        xl: 'h-32 w-32',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  }
);

// ===================================================================================
// DEFINICIÓN DE PROPS DEL COMPONENTE
// ===================================================================================

// Heredamos las variantes de CVA para tener autocompletado de `shape` y `size`.
export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;       // Fuente para la imagen estática (opcional)
  videoSrc?: string;  // Fuente para el video animado (opcional, tiene prioridad)
  alt: string;        // Texto alternativo (obligatorio por accesibilidad)
  className?: string; // Para clases de estilo personalizadas
}

// ===================================================================================
// COMPONENTE AVATAR
// ===================================================================================

export function Avatar({
  src,
  videoSrc,
  alt,
  shape,
  size,
  className,
}: AvatarProps) {
  // Prioridad de Medio Dinámico: Si existe `videoSrc`, se renderiza el video.
  const hasVideo = !!videoSrc;

  return (
    <div className={avatarVariants({ shape, size, className })}>
      {hasVideo ? (
        // --- Renderizado de Video Animado ---
        <video
          key={videoSrc} // `key` asegura que el video se recargue si la fuente cambia
          autoPlay
          loop
          muted         // `muted` es ESENCIAL para que `autoPlay` funcione en la mayoría de los navegadores
          playsInline   // `playsInline` es crucial para la reproducción en iOS
          className="h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
          {/* Puedes añadir más <source> para otros formatos como webm u ogg */}
        </video>
      ) : (
        // --- Renderizado de Imagen Estática (con optimización de Next.js) ---
        src && (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 5vw"
            className="object-cover"
          />
        )
      )}
    </div>
  );
}
