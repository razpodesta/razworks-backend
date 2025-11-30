// RUTA: apps/web-admin/src/lib/schemas/legal_page.schema.ts
// VERSIÓN: 1.0 - Contrato Genérico para Páginas Legales.
// DESCRIPCIÓN: Define una estructura de contenido flexible para las páginas de
//              Términos de Servicio y Política de Privacidad.

import { z } from 'zod';

export const legalPageSchema = z.object({
  title: z.string(),
  last_updated: z.string(),
  // Permite un array de secciones, cada una con un título y un cuerpo de texto HTML.
  content: z.array(z.object({
    heading: z.string(),
    body: z.string(),
  })),
});
