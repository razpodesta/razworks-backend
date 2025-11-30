// RUTA: apps/web-admin/src/components/ui/ShareButtons.tsx
// VERSIÓN: 1.0 - Componente de Cliente Reutilizable y Consciente del Contexto (Ultra-Holístico)
// DESCRIPCIÓN: Este componente encapsula la lógica para generar dinámicamente enlaces
//              de compartición para las principales redes sociales. Al ser un Client Component
//              ('use client'), puede usar hooks como `usePathname` para obtener la URL actual
//              y construir los enlaces de forma precisa, sin necesidad de pasar la URL como prop.

'use client';

import { usePathname } from 'next/navigation';
import { Twitter, Linkedin, Facebook, Mail } from 'lucide-react';
import Link from 'next/link';

type ShareButtonsProps = {
  /** El título del contenido a compartir, usado en el texto predefinido. */
  title: string;
};

export function ShareButtons({ title }: ShareButtonsProps) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Construye la URL canónica completa de la página actual.
  const url = `${baseUrl}${pathname}`;

  // Define la configuración para cada plataforma social.
  const socialPlatforms = [
    {
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      label: 'Compartir en X',
    },
    {
      Icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      label: 'Compartir en LinkedIn',
    },
    {
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      label: 'Compartir en Facebook',
    },
    {
      Icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=Mira este increíble artículo: ${encodeURIComponent(url)}`,
      label: 'Compartir por Email',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-zinc-400">Compartir:</span>
      {socialPlatforms.map(({ Icon, href, label }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="rounded-full p-2 text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
        >
          <Icon size={18} />
        </Link>
      ))}
    </div>
  );
}
