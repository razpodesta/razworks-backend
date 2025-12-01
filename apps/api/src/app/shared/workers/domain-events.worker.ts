/**
 * @fileoverview Worker de Eventos de Dominio (The System Ear)
 * @module API/Shared/Workers
 * @author Raz Podestá & LIA Legacy
 * @description
 * Consume la cola 'domain-events'.
 * Actúa como Router de Eventos: Recibe el mensaje y decide qué subsistemas activar.
 *
 * CORRECCIONES:
 * - Eliminación de 'any' mediante casting a eventos concretos.
 * - Tipado estricto de payloads.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  IDomainEvent,
  UserRegisteredEvent,
  ProjectPublishedEvent
} from '@razworks/core'; // ✅ Importamos los tipos concretos
import { GamificationEmitter } from '@razworks/gamification';
import { NotificationsService } from '@razworks/notifications';

@Processor('domain-events')
export class DomainEventsWorker extends WorkerHost {
  private readonly logger = new Logger(DomainEventsWorker.name);

  constructor(
    // Inyectamos los servicios que reaccionan a los eventos
    private readonly gamification: GamificationEmitter,
    private readonly notifications: NotificationsService
  ) {
    super();
  }

  async process(job: Job<IDomainEvent>): Promise<void> {
    const event = job.data;
    this.logger.log(`👂 Hearing Event: ${event.eventName} [${event.aggregateId}]`);

    try {
      switch (event.eventName) {

        case 'UserRegisteredEvent':
          await this.handleUserRegistered(event as unknown as UserRegisteredEvent);
          break;

        case 'ProjectPublishedEvent':
          await this.handleProjectPublished(event as unknown as ProjectPublishedEvent);
          break;

        default:
          this.logger.debug(`Ignored event: ${event.eventName}`);
      }
    } catch (error) {
      this.logger.error(`Error processing event ${event.eventName}`, error);
      throw error; // Reintentar job
    }
  }

  /**
   * Manejador: Usuario Registrado
   * Efectos:
   * 1. Otorga XP inicial (First Blood / First Breath).
   * 2. Envía notificación de bienvenida.
   */
  private async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    // ✅ Acceso tipado seguro, sin 'any'
    const { userId } = event;

    // A. Gamificación: "First Breath" (100 XP de regalo por nacer)
    await this.gamification.award({
      userId,
      amount: 100,
      reason: 'Welcome Bonus (First Breath)',
      source: 'system'
    });

    // B. Notificaciones: Bienvenida
    await this.notifications.dispatch({
      userId,
      actionCode: 'SYS_WELCOME', // Asegurarse que esté en seed-codes
      metadata: {
        welcomeMessage: 'Bienvenido al ecosistema RazWorks.',
        role: event.role // Podemos usar datos del evento
      }
    });

    this.logger.log(`✨ User ${userId} initialized in ecosystem.`);
  }

  private async handleProjectPublished(event: ProjectPublishedEvent): Promise<void> {
    // ✅ Acceso tipado seguro
    this.logger.log(`🚀 Project published: ${event.title} (Budget: ${event.budget.amount})`);
  }
}
