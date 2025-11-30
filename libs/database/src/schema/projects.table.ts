/**
 * @fileoverview Proyectos y Vectores (Split Pattern)
 * @module Infra/Database/Schema
 * @description
 * Implementa el patrón de segregación de datos calientes/fríos.
 * OPTIMIZACIÓN FINAL: Índices compuestos y simples para queries de UI.
 */
import { pgTable, uuid, text, timestamp, integer, index, vector } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles.table';

// 1. Tabla "Ligera" (Metadatos y Estado) - Consultada frecuentemente por la UI
export const projectsTable = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').references(() => profilesTable.id).notNull(),

  title: text('title').notNull(),
  slug: text('slug').notNull().unique(), // SEO Friendly
  status: text('status').default('DRAFT'), // DRAFT, OPEN, IN_PROGRESS, DONE

  budgetCents: integer('budget_cents').notNull(), // Siempre enteros para dinero
  currency: text('currency').default('USD').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // 🚀 PERFORMANCE BOOSTERS
    // 1. Búsqueda rápida de "Mis Proyectos"
    ownerIdx: index('idx_projects_owner').on(table.ownerId),

    // 2. Filtrado rápido en Marketplace (ej: Solo proyectos abiertos)
    statusIdx: index('idx_projects_status').on(table.status),

    // 3. Ordenamiento cronológico optimizado
    createdIdx: index('idx_projects_created').on(table.createdAt)
  };
});

// 2. Tabla "Pesada" (IA & Search) - Consultada solo al buscar o analizar
export const projectEmbeddingsTable = pgTable('project_embeddings', {
  projectId: uuid('project_id').references(() => projectsTable.id, { onDelete: 'cascade' }).primaryKey(),

  // Descripción completa (Texto largo)
  fullDescription: text('full_description'),

  // Vector de búsqueda semántica (1536 dimensiones para OpenAI/Gemini)
  // Requiere habilitar la extensión 'vector'
  embedding: vector('embedding', { dimensions: 1536 }),
}, (table) => {
  return {
    // Índice HNSW para búsqueda vectorial ultra-rápida (Cosine Similarity)
    embeddingIdx: index('idx_embedding_hnsw').using('hnsw', table.embedding.op('vector_cosine_ops')),
  };
});
