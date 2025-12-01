/**
 * @fileoverview Fábrica de Persistencia de Auditoría
 * @module API/Shared
 * @description Puente entre el Stream de Logging y la Base de Datos.
 */
import { db, auditLogsTable, actionCodesTable } from '@razworks/database';
import { LogEntry } from '@razworks/logging';
import { eq } from 'drizzle-orm';

// Cache simple en memoria para el ID de error del sistema
let sysErrorActionId: number | null = null;

async function getSysErrorId(): Promise<number> {
  if (sysErrorActionId) return sysErrorActionId;

  // Buscamos el ID correspondiente a 'SYS_ERROR' (Sembrado en seed-codes.ts)
  const code = await db
    .select({ id: actionCodesTable.id })
    .from(actionCodesTable)
    .where(eq(actionCodesTable.code, 'SYS_ERROR'))
    .limit(1);

  if (code.length > 0) {
    sysErrorActionId = code[0].id;
    return sysErrorActionId;
  }

  // Fallback de emergencia si no se corrió el seed (evita crash)
  return 0;
}

export async function saveAuditLog(entry: LogEntry): Promise<void> {
  const actionId = await getSysErrorId();

  // Mapeo del Log de Pino a la Tabla AuditLogs "Zero-Fat"
  await db.insert(auditLogsTable).values({
    // Si tenemos un usuario en el request, lo usamos (Pino inyecta req.raw)
    // Nota: Extraer el user del log de pino es complejo si no se serializa explícitamente.
    // Para errores de sistema no autenticados, userId será null (permitido en schema).
    userId: null,

    actionId: actionId,

    // Guardamos el error completo en metadata
    metadata: {
      message: entry.msg,
      error: entry.err,
      path: entry.req?.url,
      method: entry.req?.method,
      level: entry.level
    },

    durationMs: 0, // No aplicable para logs de error asíncronos
  });
}
