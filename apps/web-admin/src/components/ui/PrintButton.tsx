// RUTA: apps/web-admin/src/components/ui/PrintButton.tsx
// VERSIÓN: 1.0 - "Botón de Interacción de Cliente"
// @author: Raz Podestá - MetaShark Tech
// @description: Componente de Cliente soberano que encapsula la funcionalidad de impresión del navegador.
//               Su extracción resuelve la violación de las reglas de React Server Components al aislar la
//               interactividad (onClick) del lado del cliente, donde pertenece.

'use client';

import { Printer } from 'lucide-react';

/**
 * @description Renderiza un botón flotante que, al ser presionado, invoca la funcionalidad de impresión del navegador.
 *              Este componente está diseñado para ser ocultado automáticamente al imprimir.
 * @param {{ text: string }} props Las propiedades del componente.
 * @returns {JSX.Element} El componente de botón de impresión.
 */
export function PrintButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
      aria-label={text}
    >
      <Printer size={18} />
      {text}
    </button>
  );
}
