/**
 * @fileoverview Database Seeder (The Codex v2 - Realms)
 * @module Infra/Database/Seed
 */

import { db } from '../client';
import { actionCodesTable, tiersTable } from '../schema/dictionaries.table';
import { Logger } from '@nestjs/common';

const SYSTEM_ACTIONS = [
  { code: 'AUTH_REGISTER', description: 'Nuevo usuario registrado', isCritical: false },
  { code: 'AUTH_LOGIN', description: 'Inicio de sesión exitoso', isCritical: false },
  { code: 'AUTH_FAILED', description: 'Fallo de autenticación', isCritical: true },
  { code: 'PROJ_CREATE', description: 'Proyecto creado', isCritical: false },
  { code: 'GAMIFICATION_LEVEL_UP', description: 'Usuario subió de nivel', isCritical: false }, // ✅ Nuevo
  { code: 'GAMIFICATION_REALM_UNLOCK', description: 'Usuario desbloqueó un nuevo Reino', isCritical: false }, // ✅ Nuevo
  { code: 'SYS_ERROR', description: 'Error interno del sistema', isCritical: true },
];

// Nomenclatura Tech-Noir (Reemplaza a los Peces)
// Usamos 'slug' para mapear contra el Enum del código
const RAZTER_REALMS = [
  { slug: 'THE_SCRIPT', minXp: '0', description: 'Iniciación. Ejecución básica y scripts locales.' },
  { slug: 'THE_COMPILER', minXp: '14000', description: 'Eficiencia. Optimización y código limpio.' },
  { slug: 'THE_KERNEL', minXp: '65000', description: 'Autoridad. Privilegios de root y seguridad.' },
  { slug: 'THE_NETWORK', minXp: '150000', description: 'Influencia. Escalabilidad y nodos distribuidos.' },
  { slug: 'THE_SOURCE', minXp: '500000', description: 'Leyenda. Omnipotencia sobre el código.' },
];

async function seed() {
  const logger = new Logger('DatabaseSeeder');
  logger.log('🌱 Iniciando sembrado del Códice (Realms Edition)...');

  try {
    // 1. Seed Actions
    logger.log(`... Insertando códigos de acción.`);
    await db.insert(actionCodesTable)
      .values(SYSTEM_ACTIONS)
      .onConflictDoNothing({ target: actionCodesTable.code });

    // 2. Seed Realms (En la tabla dic_tiers, conceptualmente son los reinos mayores)
    logger.log(`... Insertando Reinos Tecnológicos.`);
    await db.insert(tiersTable)
      .values(RAZTER_REALMS)
      .onConflictDoNothing({ target: tiersTable.slug });

    logger.log(`✅ Sembrado completado.`);
    process.exit(0);

  } catch (error) {
    logger.error('❌ Fallo crítico en el sembrado:', error);
    process.exit(1);
  }
}

seed();
