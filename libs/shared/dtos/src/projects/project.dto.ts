/**
 * @fileoverview DTOs de Proyectos (Creación y Búsqueda)
 * @module Shared/DTOs/Projects
 */
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  title: z.string().min(5, 'El título debe ser descriptivo'),
  description: z.string().min(20, 'La descripción debe detallar el alcance'),
  budgetCents: z.number().int().positive(),
  currency: z.enum(['USD', 'BRL', 'EUR']),
  ownerId: z.string().uuid(), // En producción esto viene del JWT, no del body
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const SearchProjectSchema = z.object({
  query: z.string().min(3),
  limit: z.number().min(1).max(20).default(10),
});

export type SearchProjectDto = z.infer<typeof SearchProjectSchema>;
