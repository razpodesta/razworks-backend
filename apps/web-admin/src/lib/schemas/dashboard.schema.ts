// apps/web-admin/src/lib/schemas/dashboard.schema.ts
import { z } from 'zod';

export const dashboardSchema = z.object({
  welcome_title: z.string(),
  welcome_subtitle: z.string(),
  stats: z.object({
    total_revenue: z.string(),
    active_projects: z.string(),
    new_users: z.string(),
    system_status: z.string(),
  }),
  recent_activity_title: z.string(),
  quick_actions: z.string()
});
