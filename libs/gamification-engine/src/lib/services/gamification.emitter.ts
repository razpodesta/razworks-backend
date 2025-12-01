/**
 * @fileoverview Emisor de Eventos de Gamificación (Fachada)
 * @module Gamification/Emitter
 * @description
 * Permite a otros módulos otorgar XP de manera desacoplada ("Fire & Forget").
 * No bloquea el flujo principal.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface XpEvent {
  userId: string;
  amount: number;
  reason: string;
  source: string;
}

@Injectable()
export class GamificationEmitter {
  private readonly logger = new Logger(GamificationEmitter.name);

  constructor(@InjectQueue('gamification-xp') private xpQueue: Queue) {}

  /**
   * Otorga XP asíncronamente.
   */
  async award(event: XpEvent): Promise<void> {
    try {
      // Usamos un Job ID determinista para evitar duplicados en ventanas cortas (Idempotencia)
      // Ej: user-123-login-20231025
      const jobId = `${event.userId}-${event.reason}-${Date.now()}`;

      await this.xpQueue.add('award-xp', event, {
        jobId,
        removeOnComplete: true
      });

    } catch (error) {
      // Si falla la cola, no rompemos el flujo del usuario, solo logueamos
      this.logger.error(`Fallo al encolar XP para ${event.userId}`, error);
    }
  }
}
