// apps/web-admin/src/lib/utils/api-client.ts
/**
 * @fileoverview Cliente HTTP Seguro para comunicación S2S (Server-to-Server)
 * @description Firma peticiones con HMAC para garantizar integridad y autenticidad.
 * @security CRITICAL: Este archivo DEBE permanecer solo en el servidor.
 */
import 'server-only'; // 🛡️ Muro de contención: Falla el build si se importa en cliente.
import { SignatureService } from '@razworks/security';

const secret = process.env.SIGNING_SECRET;

if (!secret) {
  throw new Error('🚨 SECURITY CONFIG ERROR: SIGNING_SECRET is missing in Next.js server environment.');
}

const signer = new SignatureService(secret);

/**
 * Realiza un fetch firmado al Backend.
 * @param url Endpoint destino
 * @param body Payload de datos (Tipado genérico)
 */
export async function secureFetch<T>(url: string, body: T): Promise<Response> {
  const timestamp = Date.now().toString();

  // Generamos la firma HMAC (Payload + Timestamp)
  // Casting a object es seguro aquí porque JSON.stringify lo manejará después
  const signature = signer.sign(body as object, timestamp);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razworks-timestamp': timestamp,
      'x-razworks-signature': signature
    },
    body: JSON.stringify(body)
  });
}
