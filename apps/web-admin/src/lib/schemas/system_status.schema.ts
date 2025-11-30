import { z } from 'zod';

export const systemStatusSchema = z.object({
  items: z.array(z.string()), // Array de mensajes rotativos
  aria_label: z.string(),     // Para accesibilidad
});
