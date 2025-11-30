// RUTA: apps/web-admin/src/components/layout/Providers.tsx
'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"       // CRÍTICO: Usa clases (.dark) en lugar de data-attributes
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
