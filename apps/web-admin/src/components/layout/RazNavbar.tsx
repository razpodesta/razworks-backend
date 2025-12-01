/**
 * @fileoverview Navbar Principal (Strict Typed)
 * @module UI/Layout
 * @description
 * Barra de navegación superior. Consume el diccionario tipado para i18n.
 * Elimina el uso de 'any' para garantizar seguridad de tipos en tiempo de compilación.
 */
'use client';

import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
// ✅ IMPORTACIÓN DEL CONTRATO DE DATOS
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import type { Locale } from '../../config/i18n.config';

type RazNavbarProps = {
  // ✅ Prop tipada estrictamente. Si el JSON cambia, TS grita.
  dictionary: Dictionary;
  lang: Locale;
};

export function RazNavbar({ dictionary, lang }: RazNavbarProps) {
  const t = dictionary.header; // Inferencia automática de claves

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-4 sticky top-0 z-50 supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="container mx-auto flex items-center justify-between">
        {/* LOGO / BRANDING */}
        <Link
          href={`/${lang}`}
          className="font-display font-bold text-xl text-white tracking-tighter hover:opacity-90 transition-opacity"
          aria-label={dictionary.app_metadata.app_name}
        >
          RazWorks<span className="text-primary">.Admin</span>
        </Link>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
             {/* Aquí irían links de navegación si los hubiera en el header */}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
            <LanguageSwitcher dictionary={dictionary.language_switcher} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
