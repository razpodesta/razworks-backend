// apps/web-admin/src/lib/schemas/common.schema.ts
import { z } from 'zod';

export const commonSchema = z.object({
  loading: z.string(),
  error_generic: z.string(),
  success_generic: z.string(),
  save: z.string(),
  cancel: z.string(),
  delete: z.string(),
  edit: z.string(),
  view: z.string(),
  actions: z.string(),
  status: z.object({
    active: z.string(),
    pending: z.string(),
    suspended: z.string(),
  }),
  pagination: z.object({
    next: z.string(),
    previous: z.string(),
    showing: z.string(),
  }),
});
