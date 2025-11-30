// libs/security/src/lib/encryption.service.ts
/**
 * @fileoverview Servicio de Cifrado AEAD (AES-256-GCM)
 * @module Security/Encryption
 * @description
 * Implementa confidencialidad + integridad.
 * Soporta ROTACIÓN DE CLAVES mediante estrategia 'Trial-Chain':
 * - Encripta siempre con la clave primaria (índice 0).
 * - Desencripta probando todas las claves disponibles hasta que el AuthTag coincida.
 */
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keys: Buffer[];

  constructor(secretKeysHex: string | undefined) {
    if (!secretKeysHex) {
      throw new Error('🚨 Security Critical: ENCRYPTION_KEY is not defined in environment.');
    }

    // Parseo de claves separadas por coma (Rotación)
    this.keys = secretKeysHex.split(',').map((keyHex) => {
      const cleanKey = keyHex.trim();
      // Validación estricta de 32 bytes (256 bits)
      if (cleanKey.length !== 64) {
        throw new Error(`🚨 Security Critical: Invalid key length. Expected 64 hex chars, got ${cleanKey.length}.`);
      }
      return Buffer.from(cleanKey, 'hex');
    });

    if (this.keys.length === 0) {
      throw new Error('🚨 Security Critical: No valid keys loaded.');
    }
  }

  /**
   * Cifra un texto usando la clave maestra activa (Primary).
   * @returns Formato "IV:AuthTag:CypherText" (Hex)
   */
  public encrypt(text: string): string {
    const activeKey = this.keys[0]; // Siempre escribe con la más nueva
    const iv = randomBytes(16); // IV único y aleatorio

    const cipher = createCipheriv(this.algorithm, activeKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Desencripta probando la cadena de claves (Trial-Chain).
   * Si el AuthTag no coincide, asume que se usó una clave antigua y reintenta.
   */
  public decrypt(encryptedPayload: string): string {
    const parts = encryptedPayload.split(':');

    if (parts.length !== 3) {
      throw new Error('Security Alert: Malformed encrypted payload format.');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Bucle de Rotación
    for (const key of this.keys) {
      try {
        const decipher = createDecipheriv(this.algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Si llegamos aquí, la integridad matemática es correcta.
        return decrypted;
      } catch (error) {
        // AuthTag mismatch: La clave no es la correcta. Continuamos.
        continue;
      }
    }

    // Si salimos del bucle, ninguna clave funcionó.
    throw new Error('Security Alert: Decryption failed. Invalid Key or Data Tampered.');
  }
}
