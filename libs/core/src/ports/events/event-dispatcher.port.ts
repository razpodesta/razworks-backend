/**
 * @fileoverview Puerto del Despachador de Eventos (Domain Event Dispatcher)
 * @module Core/Ports/Events
 * @author Raz Podestá & LIA Legacy
 * @description
 * Define la interfaz que la infraestructura debe implementar para propagar
 * eventos de dominio (Side Effects) fuera del límite transaccional.
 */

import { IDomainEvent } from '../../events/domain-event.base';

export abstract class EventDispatcherPort {
  /**
   * Publica un evento de dominio al sistema.
   * @param event El evento inmutable que ocurrió.
   */
  abstract dispatch(event: IDomainEvent): Promise<void>;

  /**
   * Publica múltiples eventos en lote.
   */
  abstract dispatchAll(events: IDomainEvent[]): Promise<void>;
}
