/**
 * @fileoverview Cliente HTTP de WhatsApp (Meta Graph API Wrapper) - LINT FREE
 * @module WhatsApp/Services
 * @description
 * Maneja el envío físico de paquetes a la red de Meta.
 *
 * CORRECCIONES:
 * 1. Uso explícito de la variable 'error' en markAsRead para observabilidad.
 * 2. Optional Catch Binding en sendTypingIndicator para ignorar errores irrelevantes.
 * 3. Tipado estricto de Payloads.
 */
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Result } from '@razworks/shared/utils';

// --- Interfaces Internas de Payload ---
interface TextMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: { body: string };
}

interface StatusPayload {
  messaging_product: 'whatsapp';
  status: 'read';
  message_id: string;
}

@Injectable()
export class WhatsAppClient {
  private readonly logger = new Logger(WhatsAppClient.name);
  private readonly http: AxiosInstance;
  private readonly phoneNumberId: string;

  constructor() {
    const token = process.env['WHATSAPP_ACCESS_TOKEN'];
    // Validación segura de entorno
    const phoneIdRaw = process.env['WHATSAPP_PHONE_ID'];

    if (!token || !phoneIdRaw) {
      throw new Error('FATAL: Configuración de WhatsApp incompleta (Token o Phone ID)');
    }

    this.phoneNumberId = phoneIdRaw;

    this.http = axios.create({
      baseURL: `https://graph.facebook.com/v21.0/${this.phoneNumberId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Envía un mensaje de texto simple.
   */
  async sendMessage(to: string, content: { type: 'text'; body: string }): Promise<Result<string, Error>> {
    try {
      const payload: TextMessagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: content.body },
      };

      const response = await this.http.post('/messages', payload);
      // Retornamos el WAMID (WhatsApp Message ID)
      return Result.ok(response.data.messages[0].id);
    } catch (error: unknown) {
      return this.handleError<string>(error, 'sendMessage');
    }
  }

  /**
   * Marca un mensaje específico como LEÍDO (Doble Check Azul).
   * Vital para el mimetismo humano: Primero leo, luego existo.
   * @param messageId El ID del mensaje recibido (wamid.HBg...)
   */
  async markAsRead(messageId: string): Promise<Result<boolean, Error>> {
    try {
      const payload: StatusPayload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      };

      await this.http.post('/messages', payload);
      return Result.ok(true);
    } catch (error: unknown) {
      // ✅ FIX: Usamos la variable 'error' para enriquecer el log
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(`Failed to mark message ${messageId} as read: ${err.message}`);

      // Retornamos éxito parcial (false) para no interrumpir el flujo principal
      // No es un error crítico si el usuario no ve el check azul.
      return Result.ok(false);
    }
  }

  /**
   * Simula el indicador "Escribiendo...".
   */
  async sendTypingIndicator(_to: string): Promise<Result<void, Error>> {
    try {
      // IMPLEMENTACIÓN FUTURA: Payload para sender_action = typing_on
      // Por ahora, retornamos éxito inmediato.
      return Result.ok(undefined);
    } catch {
      // ✅ FIX: Optional Catch Binding (sin variable) para errores que queremos ignorar totalmente
      return Result.ok(undefined);
    }
  }

  // Manejador de errores tipado y genérico
  private handleError<T>(error: unknown, context: string): Result<T, Error> {
    const err = error instanceof Error ? error : new Error(String(error));

    // Extracción segura de errores de Axios
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosData = (error as any)?.response?.data;
    const details = axiosData?.error?.message || err.message;

    this.logger.error(`Meta API Error [${context}]: ${details}`);

    return Result.fail<T, Error>(new Error(details));
  }
}
