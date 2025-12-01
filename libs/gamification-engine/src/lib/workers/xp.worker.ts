/**
 * @fileoverview Worker de Experiencia (XP)
 * @module Gamification/Workers
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { GamificationService } from '../gamification.service';

export interface XpEventPayload {
  userId: string;
  amount: number;
  reason: string;
  source: 'whatsapp' | 'web' | 'system';
}

@Processor('gamification-xp')
export class XpWorker extends WorkerHost {
  private readonly logger = new Logger(XpWorker.name);

  constructor(private readonly gamificationService: GamificationService) {
    super();
  }

  async process(job: Job<XpEventPayload>): Promise<void> {
    const { userId, amount, reason } = job.data;

    try {
      await this.gamificationService.awardXp(userId, amount, reason);
    } catch (error) {
      this.logger.error(`Fallo al procesar XP para ${userId}`, error);
      throw error; // BullMQ reintentará según configuración
    }
  }
}
