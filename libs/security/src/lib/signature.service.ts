/**
 * @fileoverview Servicio de Firma HMAC con Protección Anti-Replay
 * @description Garantiza Integridad (Nadie modificó el dato) y Autenticidad (Viene del Front).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export class SignatureService {
  constructor(private readonly secret: string) {
    if (!secret || secret.length < 32) {
      throw new Error('Security Risk: SIGNING_SECRET must be at least 32 chars.');
    }
  }

  /**
   * Genera la firma.
   * @param payload El cuerpo del mensaje (JSON string o objeto)
   * @param timestamp El tiempo en ms (Date.now())
   */
  sign(payload: unknown, timestamp: string | number): string {
    // Convertimos el payload a string de forma determinista
    const content = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // EL SECRETO: Combinamos Datos + Tiempo + Clave Privada
    const dataToSign = `${timestamp}.${content}`;

    const hmac = createHmac('sha256', this.secret);
    hmac.update(dataToSign);
    return hmac.digest('hex');
  }

  /**
   * Verifica la firma y la frescura del mensaje.
   * @param toleranceSeconds Tiempo máximo de vida del mensaje (Default: 30s)
   */
  verify(
    payload: unknown,
    incomingSignature: string,
    timestamp: string | number,
    toleranceSeconds = 30
  ): boolean {
    const now = Date.now();
    const sentAt = Number(timestamp);

    // 1. Check Anti-Replay (El mensaje es muy viejo o viene del futuro?)
    if (Math.abs(now - sentAt) > toleranceSeconds * 1000) {
      console.warn(`[HMAC] Replay Attack Detected. Diff: ${now - sentAt}ms`);
      return false;
    }

    // 2. Regenerar la firma localmente
    const expectedSignature = this.sign(payload, timestamp);

    // 3. Comparación segura (Previene Timing Attacks)
    const bufferA = Buffer.from(incomingSignature);
    const bufferB = Buffer.from(expectedSignature);

    return bufferA.length === bufferB.length &&
           timingSafeEqual(bufferA, bufferB);
  }
}
