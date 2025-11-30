/**
 * @fileoverview DTOs para Extracción de Información con IA
 * @module Shared/DTOs/AI
 * @description Definición estricta de la estructura que la IA debe poblar.
 */

import { z } from 'zod';

// Esquema para Habilidades Técnicas
const SkillSchema = z.object({
  name: z.string().describe('Nombre de la tecnología o habilidad (ej: React, Node.js)'),
  level: z.enum(['Básico', 'Intermedio', 'Avanzado', 'Experto']).describe('Nivel de dominio inferido del contexto'),
  years: z.number().optional().describe('Años de experiencia con esta habilidad específica si se menciona'),
});

// Esquema Maestro de Extracción de CV
export const CandidateProfileSchema = z.object({
  fullName: z.string().describe('Nombre completo del candidato detectado en el documento'),
  email: z.string().email().describe('Correo electrónico principal de contacto'),
  location: z.string().optional().describe('Ciudad y País de residencia actual'),

  // Análisis de Perfil
  professionalTitle: z.string().describe('Título profesional inferido (ej: Senior Backend Engineer)'),
  summary: z.string().describe('Resumen ejecutivo del perfil profesional en 3ra persona (max 50 palabras)'),

  // Datos Estructurados
  totalExperienceYears: z.number().describe('Suma total de años de experiencia laboral relevante'),
  englishLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo']).describe('Nivel de inglés estimado según certificaciones o autoevaluación'),

  // Listas
  topSkills: z.array(SkillSchema).describe('Top 5 habilidades técnicas más relevantes para el rol'),
  softSkills: z.array(z.string()).describe('Habilidades blandas detectadas (Liderazgo, Comunicación, etc.)'),

  // Metadata de IA
  confidenceScore: z.number().min(0).max(100).describe('Nivel de confianza de la IA en la extracción (0-100)'),
});

// Inferencia de Tipos TypeScript
export type CandidateProfileDto = z.infer<typeof CandidateProfileSchema>;
export type SkillDto = z.infer<typeof SkillSchema>;
