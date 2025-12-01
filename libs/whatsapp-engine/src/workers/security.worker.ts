/**
 * @fileoverview SECURITY WORKER (Orchestrator)
 * @module WhatsApp/Workers
 * @description
 * Guardián de Integridad.
 * - Consume trabajos de la cola de seguridad.
 * - Delega el análisis al SecurityScannerService.
 * - Decide si el flujo continúa o se aborta (Fail Fast).
 *
 * REFACTORIZACIÓN ELITE:
 * 1. Dependency Injection: Usa SecurityScannerService.
 * 2. Result Pattern: Manejo de errores funcional.
 * 3. Traceability: Logs estructurados con TraceID.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SecurityScannerService } from '../services/security-scanner.service';

interface SecurityPayload {
  text: string;
  mediaUrl?: string; // Para futuro análisis de malware en archivos
  traceId: string;
}

interface SecurityResult {
  safe: boolean;
  sanitizedText: string;
  reason?: string;
}

@Processor('whatsapp-security')
export class SecurityWorker extends WorkerHost {
  private readonly logger = new Logger(SecurityWorker.name);

  constructor(
    private readonly scanner: SecurityScannerService // ✅ Inyección del Motor Heurístico
  ) {
    super();
  }

  async process(job: Job<SecurityPayload>): Promise<SecurityResult> {
    const { text, traceId } = job.data;

    // Nivel Debug para no saturar logs en producción
    this.logger.debug(`🛡️ Security Check Initiated | Trace: ${traceId}`);

    try {
      // 1. Delegación de Análisis al Servicio
      const scanResult = this.scanner.scan(text);

      if (scanResult.isFailure) {
        // Si el motor de seguridad falla, aplicamos el principio "Fail Closed"
        // (Bloquear por defecto ante error interno)
        const error = scanResult.getError();
        this.logger.error(`🔥 Scanner Malfunction: ${error.message} | Trace: ${traceId}`);
        throw error; // BullMQ reintentará, si persiste fallará el flow padre.
      }

      const diagnosis = scanResult.getValue();

      // 2. Decisión y Logging basado en Nivel de Amenaza
      if (!diagnosis.isSafe) {
        this.logger.warn(
          `🚫 THREAT BLOCKED [${diagnosis.threatLevel}]: ${diagnosis.reason} | Trace: ${traceId}`
        );

        return {
          safe: false,
          sanitizedText: '[BLOCKED_PAYLOAD]',
          reason: `Security Policy Violation: ${diagnosis.reason}`
        };
      }

      // 3. Éxito: Retorno del texto limpio (Redacted)
      // Si hubo PII, se loguea como info, pero no se bloquea el flujo.
      if (diagnosis.sanitizedText !== text) {
        this.logger.log(`⚠️ PII Redacted from payload | Trace: ${traceId}`);
      }

      return {
        safe: true,
        sanitizedText: diagnosis.sanitizedText,
        reason: 'CLEAN'
      };

    } catch (error: unknown) {
      // Captura de errores no controlados (Bug en el Worker)
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`❌ Security Worker Critical Failure: ${err.message}`, err.stack);
      throw err;
    }
  }
}
