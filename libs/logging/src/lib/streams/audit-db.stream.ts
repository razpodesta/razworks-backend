/**
 * @fileoverview Stream de Auditoría para Pino Logger
 * @module Libs/Logging/Streams
 * @description
 * Stream de escritura personalizado que intercepta logs, filtra por severidad
 * y delega la persistencia a una función inyectada (Callback).
 *
 * Implementa "Fire & Forget" seguro para no bloquear el Event Loop.
 */
import { Writable } from 'node:stream';

// Interfaz del Log parseado de Pino
export interface LogEntry {
  level: number;
  time: number;
  msg: string;
  req?: { id: string | number; method: string; url: string };
  err?: { message: string; stack: string; type: string };
  [key: string]: unknown;
}

// Contrato de la función de persistencia
export type PersistenceCallback = (entry: LogEntry) => Promise<void>;

export class AuditDbStream extends Writable {
  constructor(private readonly saveToDb: PersistenceCallback) {
    super();
  }

  override _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    try {
      // Pino envía strings JSON
      const logString = chunk.toString();
      const entry: LogEntry = JSON.parse(logString);

      // NIVEL 50 = ERROR, 60 = FATAL en Pino estándar
      if (entry.level >= 50) {
        // Ejecutamos la persistencia sin await (Fire & Forget) para no bloquear la API.
        // Capturamos errores de la propia persistencia para evitar crash loops.
        this.saveToDb(entry).catch((err) => {
          // Fallback de emergencia a stderr nativo si falla la DB
          process.stderr.write(`🚨 FATAL: Audit Log Failed: ${err.message}\n`);
        });
      }
    } catch (parseError) {
      // Si el JSON viene roto (muy raro en Pino), no rompemos el stream
    } finally {
      // Siempre llamamos al callback para liberar el stream
      callback();
    }
  }
}
