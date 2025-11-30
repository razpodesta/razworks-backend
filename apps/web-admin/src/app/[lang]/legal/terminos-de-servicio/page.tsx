// apps/web-admin/src/app/[lang]/legal/terminos-de-servicio/page.tsx

/**
 * @file Página de Términos de Servicio.
 * @version 2.0 - Next.js 15 Compliance
 */

import type { Metadata } from 'next';
import { type Locale } from '@/config/i18n.config';
import { getDictionary } from '@/lib/get-dictionary';

type TermsPageProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateMetadata(props: TermsPageProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const t = dictionary.legal.terms_of_service;
  return { title: t.title };
}

export default async function TermsOfServicePage(props: TermsPageProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const t = dictionary.legal.terms_of_service;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-20 sm:py-24">
      <header className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="font-display text-4xl font-bold text-white">{t.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Última actualización: {t.last_updated}</p>
      </header>
      <div className="prose prose-invert prose-lg font-sans space-y-6">
        {t.content.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p dangerouslySetInnerHTML={{ __html: section.body }} />
          </section>
        ))}
      </div>
    </main>
  );
}
