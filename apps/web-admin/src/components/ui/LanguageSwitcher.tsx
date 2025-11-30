// RUTA: apps/web-admin/src/components/ui/LanguageSwitcher.tsx
// VERSIÓN: 4.0 - Persistencia Explícita de Cookie
// DESCRIPCIÓN: Selector de idioma que actualiza la cookie 'NEXT_LOCALE' al cambiar,
//              garantizando consistencia en futuras visitas.

'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { setCookie } from 'cookies-next';
import { i18n, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import { Flag } from './Flag';

type LanguageSwitcherProps = {
  dictionary: Dictionary['language_switcher'];
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

export function LanguageSwitcher({ dictionary }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extracción segura del locale actual desde la URL
  const currentLocale = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  // Mapeo de códigos de país para las banderas
  const getCountryCode = (locale: Locale): string => {
    switch (locale) {
      case 'en-US': return 'US';
      case 'es-ES': return 'ES';
      case 'pt-BR': return 'BR';
      default: return 'BR';
    }
  };

  // Genera la nueva ruta reemplazando el segmento de idioma
  const getRedirectedPath = (newLocale: Locale) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  const handleLanguageChange = (newLocale: Locale) => {
    // 1. Persistir la preferencia en la cookie (1 año)
    setCookie(i18n.cookieName, newLocale, { maxAge: 60 * 60 * 24 * 365, path: '/' });

    // 2. Cerrar menú
    setIsOpen(false);

    // 3. Navegar a la nueva ruta
    router.push(getRedirectedPath(newLocale));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-full hover:bg-zinc-800 transition-colors bg-zinc-900/50 border border-zinc-800"
        aria-label={dictionary.label}
        aria-expanded={isOpen}
      >
        <div className="transition-transform duration-300 ease-out hover:scale-110">
          <Flag countryCode={getCountryCode(currentLocale)} className="h-5 w-5" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-40 origin-top-right rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden"
          >
            <div className="p-1 flex flex-col gap-0.5">
              {i18n.locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  className={`flex items-center gap-3 w-full p-2 text-left text-sm rounded-lg transition-all ${
                    currentLocale === locale
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Flag countryCode={getCountryCode(locale)} className="h-4 w-4 rounded-sm shadow-sm" />
                  <span>{dictionary[locale]}</span>
                  {currentLocale === locale && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
