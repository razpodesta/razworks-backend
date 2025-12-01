/**
 * @fileoverview Servicio de Salida Humanizado (The Mimic)
 * @module WhatsApp/Services
 * @description
 * Orquesta el ciclo: Leer -> Calcular Tiempo -> Escribir -> Enviar.
 * Evita respuestas instantáneas que rompen la inmersión.
 */
import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppClient } from './whatsapp-client.service';
import { Result } from '@razworks/shared/utils';

@Injectable()
export class OutboundHumanizerService {
  private readonly logger = new Logger(OutboundHumanizerService.name);

  // Velocidad de escritura simulada (Caracteres por minuto)
  // Un humano rápido escribe ~300-400 CPM.
  private readonly TYPING_SPEED_CPM = 400;

  // Latencia base de red/pensamiento (milisegundos)
  private readonly BASE_LATENCY_MS = 1500;

  constructor(private readonly client: WhatsAppClient) {}

  async sendHumanResponse(to: string, text: string): Promise<Result<void, Error>> {
    try {
      // 1. Calcular Latencia Cognitiva (Simulada)
      const typingTimeMs = this.calculateTypingTime(text);

      this.logger.log(`🤖 Mimic Protocol: Typing for ${typingTimeMs}ms to ${to}`);

      // 2. Enviar Señal "Escribiendo..." (Si estuviera implementada 100% en el cliente)
      // await this.client.sendTypingIndicator(to);

      // 3. Esperar (El Silencio Elocuente)
      await this.delay(typingTimeMs + this.BASE_LATENCY_MS);

      // 4. Ejecución del Envío
      const sendResult = await this.client.sendMessage(to, { type: 'text', body: text });

      if (sendResult.isFailure) {
        return Result.fail(sendResult.getError());
      }

      return Result.ok(undefined);

    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Outbound Error'));
    }
  }

  private calculateTypingTime(text: string): number {
    const chars = text.length;
    // (Caracteres / CaracteresPorMinuto) * 60 * 1000 = ms
    const rawTime = (chars / this.TYPING_SPEED_CPM) * 60 * 1000;

    // Cap: Nunca esperar más de 8 segundos, o el usuario se frustra.
    return Math.min(rawTime, 8000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
