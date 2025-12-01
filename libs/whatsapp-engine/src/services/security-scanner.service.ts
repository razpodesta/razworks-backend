/**
 * @fileoverview Servicio de Escaneo de Seguridad (Heuristic Engine) - FIXED
 * @module WhatsApp/Services
 * @description
 * Motor de defensa activo.
 * 1. Sanitización de PII (Redact).
 * 2. Detección de Fuga de Plataforma (Crypto Wallets).
 * 3. Análisis de Inyección de Prompt basado en Puntuación de Riesgo.
 *
 * CORRECCIÓN ESLINT:
 * - Uso explícito de la variable 'error' en el catch para logging forense.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@razworks/shared/utils';

export interface ScanResult {
  isSafe: boolean;
  sanitizedText: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: string;
}

@Injectable()
export class SecurityScannerService {
  private readonly logger = new Logger(SecurityScannerService.name);

  // Umbral de tolerancia para bloqueo (Score > 0.8 es bloqueo)
  private readonly THREAT_THRESHOLD = 0.8;

  /**
   * Ejecuta la matriz de defensa completa sobre el texto.
   */
  public scan(text: string): Result<ScanResult, Error> {
    try {
      if (!text) {
        return Result.ok({ isSafe: true, sanitizedText: '', threatLevel: 'LOW' });
      }

      // 1. Sanitización de Datos Sensibles (PII & Finance)
      const sanitized = this.redactSensitiveData(text);

      // 2. Análisis Heurístico de Amenazas (Prompt Injection)
      const { score, reason } = this.calculateThreatScore(sanitized);

      const isSafe = score < this.THREAT_THRESHOLD;

      let threatLevel: ScanResult['threatLevel'] = 'LOW';
      if (score > 0.9) threatLevel = 'CRITICAL';
      else if (score > 0.7) threatLevel = 'HIGH';
      else if (score > 0.4) threatLevel = 'MEDIUM';

      if (!isSafe) {
        this.logger.warn(`🚨 Threat Detected: [${threatLevel}] ${reason}`);
      }

      return Result.ok({
        isSafe,
        sanitizedText: isSafe ? sanitized : '[BLOCKED_CONTENT]',
        threatLevel,
        reason: isSafe ? undefined : reason
      });

    } catch (error: unknown) {
      // ✅ FIX: Uso de la variable error para trazabilidad antes de fallar
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(`🔥 Security Scanner Internal Failure: ${err.message}`, err.stack);

      // En seguridad, si el escáner falla, cerramos la puerta (Fail Closed)
      return Result.fail(new Error('Security Scanner Malfunction - Execution Halted'));
    }
  }

  /**
   * Motor de Redacción con Regex Optimizado (Anti-ReDoS).
   */
  private redactSensitiveData(input: string): string {
    let output = input;

    // EMAIL: Estricto, case-insensitive
    output = output.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL_REDACTED]'
    );

    // PHONE: Formatos internacionales (+55 11..., 011...)
    output = output.replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g,
      '[PHONE_REDACTED]'
    );

    // CREDIT CARD: Grupos de 4 dígitos
    output = output.replace(
      /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
      '[CARD_REDACTED]'
    );

    // CRYPTO WALLETS (ETH/BTC Basic Checks)
    output = output.replace(/\b0x[a-fA-F0-9]{40}\b/g, '[WALLET_REDACTED]');
    output = output.replace(/\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b/g, '[WALLET_REDACTED]');

    return output;
  }

  /**
   * Sistema de Puntuación de Amenazas.
   */
  private calculateThreatScore(text: string): { score: number; reason?: string } {
    let totalScore = 0;
    const lowerText = text.toLowerCase();
    const detectedPatterns: string[] = [];

    const patterns = [
      { rule: 'ignore previous instructions', weight: 1.0 },
      { rule: 'system prompt', weight: 0.9 },
      { rule: 'you are now', weight: 0.8 },
      { rule: 'developer mode', weight: 0.8 },
      { rule: 'do anything now', weight: 1.0 },
      { rule: 'simula ser', weight: 0.6 },
      { rule: 'olvida todo', weight: 0.9 },
    ];

    for (const p of patterns) {
      if (lowerText.includes(p.rule)) {
        totalScore += p.weight;
        detectedPatterns.push(p.rule);
      }
    }

    if (text.length > 2000) totalScore += 0.2;

    totalScore = Math.min(totalScore, 1.0);

    return {
      score: totalScore,
      reason: totalScore > 0 ? `Patterns: ${detectedPatterns.join(', ')}` : undefined
    };
  }
}
