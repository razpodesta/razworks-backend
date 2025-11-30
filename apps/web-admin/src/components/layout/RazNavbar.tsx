// RUTA: apps/web-admin/src/components/layout/RazNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, LogOut, FileText } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
// Asumimos que los tipos Dictionary siguen existiendo, aunque sea con menos claves
import type { Dictionary } from '@/lib/schemas/dictionary.schema';

type NavbarProps = {
  dictionary: Dictionary;
  lang: string;
};

export function RazNavbar({ dictionary, lang }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Definición de Rutas del Sistema
  const navItems = [
    { label: 'Dashboard', href: `/${lang}`, icon: LayoutDashboard },
    { label: 'Blog (CMS)', href: `/${lang}/blog`, icon: FileText },
    // Agrega aquí más rutas de sistema (Usuarios, Finanzas, etc.)
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* 1. BRANDING (Izquierda) */}
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white">
              RW
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              RazWorks <span className="text-xs text-zinc-500 font-mono">ADMIN</span>
            </span>
          </Link>

          {/* 2. NAVEGACIÓN DESKTOP (Centro) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* 3. UTILIDADES (Derecha) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher dictionary={dictionary.language_switcher} />
            <div className="h-6 w-px bg-zinc-800 mx-1" />
            <button className="flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors">
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900/50 text-zinc-200"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-zinc-800 flex justify-between">
             <ThemeToggle />
             <LanguageSwitcher dictionary={dictionary.language_switcher} />
          </div>
        </div>
      )}
    </nav>
  );
}
