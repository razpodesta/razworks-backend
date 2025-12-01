/**
 * @fileoverview Contrato Base para Eventos de Dominio
 * @module Core/Events
 * @author Raz Podestá & LIA Legacy
 * @description
 * Un Evento de Dominio es un hecho inmutable que ya ocurrió en el pasado.
 * Sirve para desacoplar efectos secundarios (ej: Enviar Email tras Registro).
 */

export interface IDomainEvent {
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredAt: Date;
  public readonly eventName: string;

  constructor(public readonly aggregateId: string) {
    this.occurredAt = new Date();
    // Obtiene el nombre de la clase como nombre del evento
    this.eventName = this.constructor.name;
  }
}
