/**
 * @fileoverview Adaptador de Despacho de Eventos (BullMQ Implementation)
 * @module API/Shared/Adapters
 * @author Raz Podestá & LIA Legacy
 * @description
 * Implementación concreta del puerto `EventDispatcherPort` del Core.
 * Toma un Evento de Dominio puro y lo inyecta en la cola de mensajería del Sistema Nervioso.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventDispatcherPort, IDomainEvent } from '@razworks/core';

@Injectable()
export class BullMqEventDispatcher implements EventDispatcherPort {
  private readonly logger = new Logger(BullMqEventDispatcher.name);

  constructor(
    // Inyectamos la cola global de eventos de dominio
    @InjectQueue('domain-events') private readonly eventQueue: Queue
  ) {}

  /**
   * Publica un evento de dominio en la cola asíncrona.
   * @param event El evento inmutable del Core.
   */
  async dispatch(event: IDomainEvent): Promise<void> {
    const jobName = event.eventName; // Ej: 'UserRegisteredEvent'

    try {
      await this.eventQueue.add(jobName, event, {
        // Configuración de resiliencia por defecto para eventos
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        // Idempotencia: Usamos el ID del agregado + Nombre evento como JobID
        // Esto evita duplicados si el proceso falla y reintenta antes de commitear.
        jobId: `${event.aggregateId}-${event.eventName}-${event.occurredAt.getTime()}`,
      });

      this.logger.debug(`📢 Event Dispatched: ${jobName} [${event.aggregateId}]`);
    } catch (error) {
      // Si el bus de eventos falla, no deberíamos romper la transacción del usuario,
      // pero es un error crítico de infraestructura.
      this.logger.error(`❌ Failed to dispatch event ${jobName}:`, error);
      // Dependiendo de la política, aquí podríamos guardar en una tabla 'outbox' de contingencia.
    }
  }

  async dispatchAll(events: IDomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.dispatch(event)));
  }
}
