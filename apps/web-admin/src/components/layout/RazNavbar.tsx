/**
 * @fileoverview Navbar Principal
 */
'use client';

import Link from 'next/link';

// Definimos props mínimas para evitar errores de tipo si el diccionario no está listo
type RazNavbarProps = {
  dictionary: any; // Temporalmente any hasta que definas el schema completo
  lang: string;
};

export function RazNavbar({ lang }: RazNavbarProps) {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href={`/${lang}`} className="font-bold text-xl text-white tracking-tighter">
          RazWorks<span className="text-purple-500">.Admin</span>
        </Link>
        {/* Aquí irían los links y el toggle de tema */}
      </div>
    </nav>
  );
}
