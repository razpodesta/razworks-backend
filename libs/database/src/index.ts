// libs/database/src/index.ts
/**
 * @fileoverview Barril de Database
 * @description Exporta esquemas, cliente y repositorios.
 */
export * from './client';
export * from './schema/schema-index';
export * from './repositories/drizzle-project.repository';
// No exportamos el Mapper, es interno del paquete database
