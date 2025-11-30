// apps/web-admin/src/lib/schemas/sidebar.schema.ts
import { z } from 'zod';

export const sidebarSchema = z.object({
  menu_title: z.string(),
  dashboard: z.string(),
  marketplace_management: z.string(),
  users_freelancers: z.string(),
  users_clients: z.string(),
  financials: z.string(),
  cms_blog: z.string(),
  system_settings: z.string(),
  audit_logs: z.string(),
  logout: z.string(),
});
