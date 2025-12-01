// apps/web-admin/src/components/layout/Footer.tsx
/**
 * @fileoverview Footer Administrativo (Strict Typed)
 * @module UI/Layout
 */
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

type FooterProps = {
  lang: string;
  // ✅ Uso del sub-schema específico inferido del diccionario maestro
  content: Dictionary['footer'];
};

export function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-6 text-xs text-zinc-500 font-mono">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Izquierda: Identidad */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-zinc-400 tracking-tight">{content.brand_name}</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-600">
            {content.version_prefix}
          </span>
        </div>

        {/* Centro: Indicador de Estado */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="uppercase tracking-wider text-[10px] font-semibold text-zinc-400">
            {content.system_status_online}
          </span>
        </div>

        {/* Derecha: Copyright */}
        <div className="text-zinc-600 hover:text-zinc-500 transition-colors">
          &copy; {currentYear} {content.copyright_text}
        </div>
      </div>
    </footer>
  );
}
