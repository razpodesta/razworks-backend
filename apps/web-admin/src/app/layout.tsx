/**
 * @fileoverview Layout Raíz del Admin Panel
 * @description Punto de entrada principal. Maneja fuentes, proveedores y estructura base.
 */
import React from 'react';
import { Inter, Syne, Space_Grotesk } from 'next/font/google';
import './global.css';

// ✅ IMPORTACIONES CORREGIDAS USANDO ALIAS
import { Providers } from '@/components/layout/Providers';
import { RazNavbar } from '@/components/layout/RazNavbar';
import { getDictionary } from '@/lib/get-dictionary';
import { i18n, type Locale } from '@/config/i18n.config';

// Configuración de Fuentes
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const fontSignature = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-signature',
  display: 'swap',
});

// ✅ CORRECCIÓN TS7006: Tipado explícito del parámetro 'locale'
export async function generateStaticParams() {
  return i18n.locales.map((locale: Locale) => ({ lang: locale }));
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
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontSignature.variable} font-sans bg-background text-foreground antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <RazNavbar dictionary={dictionary} lang={lang} />
            
            <main className="grow relative z-0">
              {children}
            </main>
            
            <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500 bg-zinc-950">
              © 2025 RazWorks System. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}