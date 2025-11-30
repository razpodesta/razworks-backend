// apps/web-admin/src/app/[lang]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { Providers } from '../../components/layout/Providers';
import { RazNavbar } from '../../components/layout/RazNavbar'; // <-- NUEVO NAVBAR
import '../global.css';

// Fuentes (Mantener base)
const fontInter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// ... puedes mantener las otras fuentes si las usas o borrarlas

export const metadata: Metadata = {
  title: 'RazWorks Admin',
  description: 'Sistema de Gestión Centralizado',
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${fontInter.variable} font-sans bg-black text-white antialiased`}>
        <Providers>
            <div className="flex min-h-screen flex-col">
              {/* Nuevo Navbar Limpio */}
              <RazNavbar dictionary={dictionary} lang={lang} />

              <main className="grow relative z-0">
                {children}
              </main>

              {/* Footer Simple (Placeholder) */}
              <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
                © 2025 RazWorks System. All rights reserved.
              </footer>
            </div>
        </Providers>
      </body>
    </html>
  );
}
