// INICIO DEL ARCHIVO [apps/web-admin/src/components/ui/Avatar.tsx]
/**
 * @fileoverview Componente Avatar Soberano
 * @module UI/Avatar
 * @description Internalizado para independencia de despliegue.
 */
'use client';

import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Importación local usando alias @/

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  }
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  videoSrc?: string;
  alt: string;
  className?: string;
}

export function Avatar({
  src,
  videoSrc,
  alt,
  shape,
  size,
  className,
}: AvatarProps) {
  const hasVideo = !!videoSrc;

  return (
    <div className={cn(avatarVariants({ shape, size, className }))}>
      {hasVideo ? (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 5vw"
            className="object-cover"
          />
        ) : (
          <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-tighter">
            {alt ? alt.substring(0, 2) : 'NA'}
          </span>
        )
      )}
    </div>
  );
}
// FIN DEL ARCHIVO [apps/web-admin/src/components/ui/Avatar.tsx]
