/**
 * @fileoverview Evento: Usuario Registrado
 * @module Core/Events
 * @description
 * Disparado cuando un usuario completa exitosamente su registro y persistencia.
 * Consumers típicos: WelcomeEmailHandler, CRMSyncHandler, GamificationInitializer.
 */

import { DomainEvent } from './domain-event.base';
import { UserRole } from '../entities/user.entity';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly method: 'EMAIL' | 'GOOGLE' | 'GITHUB'
  ) {
    super(userId);
  }
}
