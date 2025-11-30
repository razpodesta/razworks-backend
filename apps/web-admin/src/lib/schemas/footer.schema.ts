// apps/web-admin/src/lib/schemas/footer.schema.ts
/**
 * @fileoverview Esquema de datos para el Footer Administrativo
 * @description Define los textos estáticos permitidos.
 */
import { z } from 'zod';

export const footerSchema = z.object({
  brand_name: z.string(),
  version_prefix: z.string(),
  system_status_online: z.string(),
  copyright_text: z.string(),
});

export type FooterDictionary = z.infer<typeof footerSchema>;
