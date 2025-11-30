// RUTA: apps/web-admin/src/lib/schemas/dictionary.schema.ts
// VERSIÓN: 3.1 - Localized & Decoupled
import { z } from 'zod';

// Imports de Micro-Schemas Locales
import { authSchema } from './auth.schema';
import { dashboardSchema } from './dashboard.schema';
import { sidebarSchema } from './sidebar.schema';
import { commonSchema } from './common.schema';
import { headerSchema } from './header.schema';
// Nota: footer.schema.ts debe existir aunque esté vacío o simple

// --- SCHEMAS ATÓMICOS LOCALES ---
const languageSwitcherSchema = z.object({
  label: z.string(),
  'en-US': z.string(),
  'es-ES': z.string(),
  'pt-BR': z.string(),
});

const systemStatusSchema = z.object({
  items: z.array(z.string()),
  aria_label: z.string(),
});

const notFoundSchema = z.object({
  title: z.string(),
  description: z.string(),
  cta_button: z.string(),
  error_code: z.string(),
});

const serverErrorSchema = z.object({
  title: z.string(),
  description: z.string(),
  retry_button: z.string(),
  home_button: z.string(),
});

const maintenanceSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimated_return: z.string(),
});

const appMetadataSchema = z.object({
  app_name: z.string(),
});

// --- ESQUEMA MAESTRO (Contrato de la App) ---
export const dictionarySchema = z.object({
  app_metadata: appMetadataSchema,
  header: headerSchema,
  sidebar: sidebarSchema,
  // footer: z.any(), // Opcional: Si decidimos simplificar el footer al máximo
  auth: authSchema,
  dashboard: dashboardSchema,
  common: commonSchema,
  language_switcher: languageSwitcherSchema,
  system_status: systemStatusSchema,
  not_found: notFoundSchema,
  server_error: serverErrorSchema,
  maintenance: maintenanceSchema,
});

export type Dictionary = z.infer<typeof dictionarySchema>;
