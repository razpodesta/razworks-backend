// RUTA: apps/web-admin/src/lib/schemas/not_found.schema.ts
// VERSIÓN: 2.0 - Contrato de Páginas de Sistema
// DESCRIPCIÓN: Define la estructura de contenido para las páginas de error (404)
//              y otros estados del sistema, asegurando consistencia en la mensajería.

import { z } from 'zod';

export const notFoundSchema = z.object({
  title: z.string(),
  description: z.string(),
  cta_button: z.string(),
  error_code: z.string(), // Añadido para trazabilidad técnica (ej: "ERR_404")
});

// Esquema para Error General (500)
export const serverErrorSchema = z.object({
  title: z.string(),
  description: z.string(),
  retry_button: z.string(),
  home_button: z.string(),
});

// Esquema para Página de Mantenimiento
export const maintenanceSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimated_return: z.string(),
});
