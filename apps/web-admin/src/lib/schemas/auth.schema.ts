// apps/web-admin/src/lib/schemas/auth.schema.ts
import { z } from 'zod';

export const authSchema = z.object({
  login_title: z.string(),
  register_title: z.string(),
  email_label: z.string(),
  password_label: z.string(),
  forgot_password: z.string(),
  submit_login: z.string(),
  submit_register: z.string(),
  social_login_google: z.string(),
  social_login_github: z.string(),
  errors: z.object({
    invalid_credentials: z.string(),
    user_exists: z.string()
  })
});
