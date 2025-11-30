// apps/web-admin/src/components/layout/Footer.tsx
/**
 * @fileoverview Footer Administrativo Minimalista (Strict Typed & i18n)
 * @description Muestra versión, estado y copyright localizados.
 */
import type { FooterDictionary } from '../../lib/schemas/footer.schema';

type FooterProps = {
  lang: string;
  // FIX: Reemplazo de 'any' por el tipo estricto del esquema
  content: FooterDictionary;
};

export function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-[#0e0e0e] py-4 text-xs text-zinc-500 font-mono">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">

        {/* Izquierda: Identidad */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-400">{content.brand_name}</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px]">
            {content.version_prefix}
          </span>
        </div>

        {/* Centro: Estado del Sistema */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>{content.system_status_online}</span>
        </div>

        {/* Derecha: Copyright */}
        <div>
          &copy; {currentYear} {content.copyright_text}
        </div>
      </div>
    </footer>
  );
}
