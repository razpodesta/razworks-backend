// apps/web-admin/src/app/[lang]/maintenance/page.tsx

/**
 * @file Página de Mantenimiento.
 * @version 2.0 - Next.js 15 Compliance
 */

import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/config/i18n.config';
import { AlertOctagon } from 'lucide-react';

type MaintenancePageProps = {
  params: Promise<{ lang: Locale }>;
};

export default async function MaintenancePage(props: MaintenancePageProps) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);
  const t = dict.maintenance;

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-black text-white px-4 text-center">
      <div className="animate-pulse text-yellow-500 mb-6">
        <AlertOctagon size={64} />
      </div>
      <h1 className="font-display text-4xl font-bold mb-4">{t.title}</h1>
      <p className="font-sans text-zinc-400 max-w-md text-lg mb-8">
        {t.description}
      </p>
      <div className="rounded-full bg-zinc-900 border border-zinc-800 px-6 py-2 text-sm text-zinc-500 font-mono">
        {t.estimated_return}
      </div>
    </main>
  );
}
