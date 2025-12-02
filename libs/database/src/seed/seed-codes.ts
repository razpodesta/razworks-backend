/**
 * @fileoverview Database Seeder (The Codex v4 - Unified & Typed)
 * @module Infra/Database/Seed
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Semilla maestra que puebla los diccionarios estáticos del sistema.
 * Es la "Fuente de Verdad" para:
 * 1. Códigos de Acción (Audit Logs / Notificaciones).
 * 2. Jerarquía de Reinos (Gamificación).
 *
 * @optimization Uses Core Enums to prevent 'Magic String' drift.
 * @idempotency SAFE - Usa 'onConflictDoNothing' para evitar duplicados.
 */

import { Logger } from '@nestjs/common';
import { db } from '../client';
import { actionCodesTable, tiersTable } from '../schema/dictionaries.table';
// ✅ IMPORTACIÓN CRÍTICA: Usamos los Enums del Core para integridad referencial
import { SystemActionCode, RazterRealm } from '@razworks/core';

// --- 1. CATÁLOGO DE ACCIONES DEL SISTEMA ---
// Mapeo estricto usando el Enum SystemActionCode.
// Esto corrige el bug de 'PROJ_CREATE' vs 'PROJ_CREATED'.

const SYSTEM_ACTIONS = [
  // --- AUTENTICACIÓN & IDENTIDAD ---
  {
    code: SystemActionCode.AUTH_REGISTER,
    description: 'Nuevo usuario registrado en la plataforma',
    isCritical: false
  },
  {
    code: SystemActionCode.AUTH_LOGIN,
    description: 'Inicio de sesión exitoso',
    isCritical: false
  },
  {
    code: SystemActionCode.AUTH_FAILED,
    description: 'Fallo de credenciales o intento de acceso denegado',
    isCritical: true
  },

  // --- PROYECTOS (CORE DOMAIN) ---
  {
    // ✅ FIX: Alineado con la lógica de negocio (antes era PROJ_CREATE)
    code: SystemActionCode.PROJ_CREATED,
    description: 'Nuevo proyecto publicado y vectorizado',
    isCritical: false
  },
  {
    code: SystemActionCode.PROJ_UPDATE,
    description: 'Actualización de metadatos de proyecto',
    isCritical: false
  },

  // --- GAMIFICACIÓN (RAZTERS) ---
  {
    code: SystemActionCode.GAMIFICATION_LEVEL_UP,
    description: 'Usuario alcanzó un nuevo nivel numérico',
    isCritical: false
  },
  {
    code: SystemActionCode.GAMIFICATION_REALM_UNLOCK,
    description: 'Usuario desbloqueó un nuevo Reino de evolución',
    isCritical: false
  },
  {
    code: SystemActionCode.GAMIFICATION_BADGE_UNLOCK,
    description: 'Insignia especial desbloqueada por mérito',
    isCritical: false
  },

  // --- WHATSAPP & CÓRTEX (SISTEMA NERVIOSO) ---
  {
    code: SystemActionCode.WA_MSG_IN,
    description: 'Mensaje entrante recibido vía Webhook WhatsApp',
    isCritical: false
  },
  {
    code: SystemActionCode.WA_SEC_BLOCK,
    description: 'Mensaje bloqueado por el escáner de seguridad (Prompt Injection/PII)',
    isCritical: true
  },
  {
    code: SystemActionCode.SENTIMENT_ALERT,
    description: 'Alerta de sentimiento negativo/hostil detectado por IA',
    isCritical: true
  },

  // --- SISTEMA INTERNO ---
  {
    code: SystemActionCode.SYS_ERROR,
    description: 'Excepción no controlada o error interno del servidor',
    isCritical: true
  },
];

// --- 2. JERARQUÍA DE REINOS (RAZTER REALMS) ---
// Define la progresión del usuario. El slug debe coincidir con el Enum 'RazterRealm'.

const RAZTER_REALMS = [
  {
    slug: RazterRealm.THE_SCRIPT,
    minXp: '0',
    description: 'Iniciación. Ejecución básica y scripts locales. El comienzo del viaje.'
  },
  {
    slug: RazterRealm.THE_COMPILER,
    minXp: '14000',
    description: 'Eficiencia. Optimización, depuración y código limpio.'
  },
  {
    slug: RazterRealm.THE_KERNEL,
    minXp: '65000',
    description: 'Autoridad. Privilegios de root, seguridad y gestión de procesos.'
  },
  {
    slug: RazterRealm.THE_NETWORK,
    minXp: '150000',
    description: 'Influencia. Escalabilidad, nodos distribuidos y topología global.'
  },
  {
    slug: RazterRealm.THE_SOURCE,
    minXp: '500000',
    description: 'Leyenda. Omnipotencia sobre el código. Arquitecto del sistema.'
  },
];

/**
 * Función Principal de Sembrado
 * Ejecuta inserciones en lotes con manejo de conflictos.
 */
async function seed() {
  const logger = new Logger('DatabaseSeeder');
  logger.log('🌱 [SEED] Iniciando protocolo de sembrado del Códice (Unified v4)...');

  try {
    // A. Insertar Códigos de Acción
    logger.log(`... Procesando ${SYSTEM_ACTIONS.length} códigos de acción.`);

    // Usamos onConflictDoNothing para que sea seguro re-ejecutar el script
    // sin duplicar datos ni lanzar errores de Unique Constraint.
    await db.insert(actionCodesTable)
      .values(SYSTEM_ACTIONS)
      .onConflictDoNothing({ target: actionCodesTable.code });

    // B. Insertar Reinos Tecnológicos
    logger.log(`... Procesando ${RAZTER_REALMS.length} Reinos Razter.`);

    await db.insert(tiersTable)
      .values(RAZTER_REALMS)
      .onConflictDoNothing({ target: tiersTable.slug });

    logger.log(`✅ [SEED] Operación completada exitosamente. La Base de Datos está sincronizada.`);

    // Salida limpia para que CI/CD detecte éxito
    process.exit(0);

  } catch (error) {
    logger.error('❌ [SEED] Fallo crítico en el sembrado de datos:', error);
    // Salida con error para detener pipelines de despliegue si esto falla
    process.exit(1);
  }
}

// Ejecución inmediata
seed();
