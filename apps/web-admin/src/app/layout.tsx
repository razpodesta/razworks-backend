// RUTA: apps/web-admin/src/app/layout.tsx
// VERSIÓN: 3.0 - "The Master Shell"
// DESCRIPCIÓN: Layout Raíz Único. Responsable exclusivo del DOM base (html, body)
//              y de la inyección de recursos globales (Fuentes, CSS).

import React from 'react';
import localFont from 'next/font/local';
import './global.css'; // Importación de estilos globales (Tailwind v4)

// --- 1. SISTEMA DE TIPOGRAFÍA CENTRALIZADO ---
// Cargamos las fuentes aquí para que estén disponibles en TODA la app (incluyendo 404)

const fontSatoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Variable.woff2', style: 'normal' },
    { path: '../../public/fonts/Satoshi-VariableItalic.woff2', style: 'italic' },
  ],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const fontSignature = localFont({
  src: '../../public/fonts/Dicaten.woff2',
  variable: '--font-signature',
  display: 'swap',
  preload: true,
});

const fontClashDisplay = localFont({
  src: [
    { path: '../../public/fonts/ClashDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

// --- 2. LAYOUT RAÍZ ---
// Este es el ÚNICO lugar donde deben existir las etiquetas <html> y <body>.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning es necesario para next-themes
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${fontSatoshi.variable} ${fontSignature.variable} ${fontClashDisplay.variable} font-sans bg-background text-foreground antialiased selection:bg-purple-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
