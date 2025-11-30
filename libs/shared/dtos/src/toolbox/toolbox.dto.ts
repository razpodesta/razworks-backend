// libs/shared/dtos/src/toolbox/toolbox.dto.ts
/**
 * @fileoverview DTOs para Herramientas del Toolbox
 * @module Shared/DTOs/Toolbox
 * @description Contratos estrictos para Calculadoras, Conversores y Calendarios.
 */
import { z } from 'zod';

// --- CLIENT TOOLBOX ---
export const BudgetEstimatorSchema = z.object({
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  hoursEstimated: z.number().min(1).max(1000),
  currency: z.enum(['USD', 'BRL', 'EUR']).default('USD'),
});
export type BudgetEstimatorDto = z.infer<typeof BudgetEstimatorSchema>;

// --- RAZTER TOOLBOX ---
export const MediaConversionSchema = z.object({
  fileId: z.string().uuid(),
  targetFormat: z.enum(['mp3', 'wav', 'pdf']),
  // El Tier se inyecta desde el token del usuario, no se envía en el body por seguridad
});
export type MediaConversionDto = z.infer<typeof MediaConversionSchema>;

// --- SHARED TOOLBOX ---
export const AvailabilityCheckSchema = z.object({
  targetUserId: z.string().uuid(),
  date: z.string().datetime(), // ISO 8601
  userTimezone: z.string(),    // IANA Timezone (ej: America/Sao_Paulo)
});
export type AvailabilityCheckDto = z.infer<typeof AvailabilityCheckSchema>;
