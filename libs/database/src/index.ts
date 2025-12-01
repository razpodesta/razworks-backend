/**
 * @fileoverview Public API - Database Library
 * @module Infra/Database
 * @description
 * Punto de acceso único para la infraestructura de datos.
 */

// 1. Módulo NestJS (Para apps/api)
export * from './lib/database.module';

// 2. Cliente Core (Para scripts fuera de NestJS)
export * from './client';

// 3. Servicios de Utilidad
export * from './services/dictionary-manager.service';

// 4. Esquemas (Tipado)
export * from './schema/schema-index';

// 5. Repositorios Concretos (Aunque se recomienda usar los Puertos exportados por el Module)
export * from './repositories/drizzle-project.repository';
export * from './repositories/drizzle-user.repository';
export * from './repositories/drizzle-audit.repository';

// 6. Mappers
export * from './mappers/user.mapper';
