import { z } from 'zod';

export const languageSwitcherSchema = z.object({
  label: z.string(),
  'en-US': z.string(),
  'es-ES': z.string(),
  'pt-BR': z.string(),
});
