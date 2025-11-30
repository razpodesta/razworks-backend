/**
 * @fileoverview Database Seeder (The Codex)
 * @module Infra/Database/Seed
 */

import { db } from '../client';
import { actionCodesTable, tiersTable } from '../schema/dictionaries.table';
import { Logger } from '@nestjs/common';

// Definimos los datos. 'as const' es bueno para intellisense,
// pero debemos descongelarlo al insertar.
const SYSTEM_ACTIONS = [
  { code: 'AUTH_REGISTER', description: 'Nuevo usuario registrado', isCritical: false },
  { code: 'AUTH_LOGIN', description: 'Inicio de sesión exitoso', isCritical: false },
  { code: 'AUTH_FAILED', description: 'Fallo de autenticación (Credenciales)', isCritical: true },
  { code: 'PROJ_CREATE', description: 'Proyecto creado (Borrador)', isCritical: false },
  { code: 'PROJ_PUBLISH', description: 'Proyecto publicado al mercado', isCritical: false },
  { code: 'PROJ_MATCH', description: 'Match vectorial encontrado', isCritical: false },
  { code: 'AI_TRANSCRIPT', description: 'Transcripción de audio completada', isCritical: false },
  { code: 'AI_SECURITY_BLOCK', description: 'Bloqueo por Prompt Injection/PII', isCritical: true },
  { code: 'SYS_ERROR', description: 'Error interno no controlado', isCritical: true },
]; // Quitamos 'as const' para evitar conflicto de readonly con Drizzle

const RAZTER_TIERS = [
  { slug: 'PLANKTON', minXp: '0', description: 'Nivel inicial. Acceso básico.' },
  { slug: 'BARRACUDA', minXp: '1000', description: 'Nivel intermedio. Acceso a conversor básico.' },
  { slug: 'TIGER_SHARK', minXp: '5000', description: 'Nivel avanzado. Fees reducidos.' },
  { slug: 'MEGALODON', minXp: '20000', description: 'Leyenda. Soporte prioritario y herramientas Enterprise.' },
];

async function seed() {
  const logger = new Logger('DatabaseSeeder');
  logger.log('🌱 Iniciando sembrado del Códice (Dictionaries)...');

  const start = performance.now();

  try {
    // 1. Seed Actions
    logger.log(`... Insertando ${SYSTEM_ACTIONS.length} códigos de acción.`);
    await db.insert(actionCodesTable)
      .values(SYSTEM_ACTIONS)
      .onConflictDoNothing({ target: actionCodesTable.code });

    // 2. Seed Tiers
    logger.log(`... Insertando ${RAZTER_TIERS.length} niveles de Razter.`);
    await db.insert(tiersTable)
      .values(RAZTER_TIERS)
      .onConflictDoNothing({ target: tiersTable.slug });

    const duration = (performance.now() - start).toFixed(2);
    logger.log(`✅ Sembrado completado en ${duration}ms.`);

    process.exit(0);

  } catch (error) {
    logger.error('❌ Fallo crítico en el sembrado:', error);
    process.exit(1);
  }
}

seed();
