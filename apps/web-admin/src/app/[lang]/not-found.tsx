// RUTA: apps/web-admin/src/app/[lang]/not-found.tsx
// VERSIÓN: 6.0 - UI de Error 404 Internacionalizada (Server Component)
// DESCRIPCIÓN: Página de "No Encontrado" con acceso completo al sistema de diseño
//              e internacionalización. No cruza fronteras cliente/servidor innecesariamente.

import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';
import { i18n } from '@/config/i18n.config';
import { getDictionary } from '@/lib/get-dictionary';

// Al ser una página especial de Next.js, no siempre recibe params de la forma estándar.
// Sin embargo, al estar dentro de [lang], el layout ya habrá resuelto el contexto.
// Usamos un fallback defensivo para garantizar la estabilidad.

export default async function LocalizedNotFound() {
  const lang = i18n.defaultLocale; // Fallback seguro para el renderizado del componente de error
  const dictionary = await getDictionary(lang);
  const t = dictionary.not_found;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 selection:bg-purple-500/30">
      <div className="max-w-lg text-center space-y-8">

        {/* Arte Visual CSS Puro para el 404 */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800 animate-ping opacity-20" />
          <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-pulse" />
          <h1 className="font-display text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-600">
            404
          </h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-display">
            {t.title}
          </h2>
          <p className="text-zinc-400 leading-relaxed font-sans">
            {t.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`/${lang}`}
            className="group flex items-center gap-2 rounded-full bg-zinc-100 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <Home size={18} className="text-zinc-600 group-hover:text-black transition-colors" />
            {t.cta_button}
          </Link>
        </div>

        <div className="pt-12 flex items-center justify-center gap-2 text-xs text-zinc-600 font-mono">
           <AlertTriangle size={12} />
           <span>ERR_ROUTE_MISSING • SYSTEM_ID_404</span>
        </div>
      </div>
    </div>
  );
}
