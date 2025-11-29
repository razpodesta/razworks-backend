/**
 * @fileoverview DTO para Health Check
 * @module Shared/DTOs/Health
 * @author Raz Podestá <contact@metashark.tech>
 */
import { z } from 'zod';

export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  version: z.string(),
  timestamp: z.string().datetime(),
  service: z.string(),
  message: z.string(),
});

export type HealthStatusDto = z.infer<typeof HealthStatusSchema>;
