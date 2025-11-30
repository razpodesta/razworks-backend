// libs/whatsapp-engine/src/workers/security.worker.ts
/**
 * @fileoverview Security Worker (PII Redaction & Threat Detection)
 * @module WhatsApp/Workers
 * @description
 * Analiza el texto entrante en busca de:
 * 1. PII (Personally Identifiable Information): Emails, Teléfonos, Tarjetas.
 * 2. Toxicidad/Prompt Injection: Intentos de manipular a la IA.
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

interface SecurityPayload {
  text: string;
  mediaUrl?: string;
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

  async process(job: Job<SecurityPayload>): Promise<SecurityResult> {
    const { text, traceId } = job.data;
    this.logger.debug(`🛡️ Scanning payload | Trace: ${traceId}`);

    try {
      // 1. Detección de Patrones PII (Regex)
      const sanitized = this.redactPII(text);

      // 2. Detección de Prompt Injection (Heurística simple)
      // En producción, esto podría llamar a un modelo clasificador pequeño (BERT).
      if (this.isPromptInjection(sanitized)) {
        this.logger.warn(`🚨 Threat Detected: Prompt Injection | Trace: ${traceId}`);
        return {
          safe: false,
          sanitizedText: '[BLOCKED]',
          reason: 'PROMPT_INJECTION_DETECTED'
        };
      }

      return {
        safe: true,
        sanitizedText: sanitized
      };

    } catch (error) {
      this.logger.error(`Security Scan Failed`, error);
      // En caso de fallo del scanner, cerramos por seguridad (Fail Closed)
      return { safe: false, sanitizedText: '', reason: 'SCANNER_ERROR' };
    }
  }

  private redactPII(input: string): string {
    let output = input;
    // Email Regex
    output = output.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, '[EMAIL_REDACTED]');
    // Phone Regex (Genérico Internacional)
    output = output.replace(/\b\+?[\d\s-]{10,15}\b/g, '[PHONE_REDACTED]');
    // Credit Card (Luhn check simplificado visual)
    output = output.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD_REDACTED]');

    return output;
  }

  private isPromptInjection(text: string): boolean {
    const patterns = [
      'ignore previous instructions',
      'system override',
      'you are now DAN',
      'act as an unbound ai'
    ];
    const lower = text.toLowerCase();
    return patterns.some(p => lower.includes(p));
  }
}
