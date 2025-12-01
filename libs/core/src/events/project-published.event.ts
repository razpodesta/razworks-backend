/**
 * @fileoverview Evento: Proyecto Publicado
 * @module Core/Events
 * @description
 * Disparado cuando un proyecto pasa de DRAFT a OPEN.
 * Consumers típicos: MatchingEngine, NotificationBroadcaster.
 */

import { DomainEvent } from './domain-event.base';
import { Money } from '../value-objects/money.vo';

export class ProjectPublishedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly ownerId: string,
    public readonly title: string,
    public readonly budget: Money,
    public readonly requiredSkills: string[] // Futuro: Value Object Skill
  ) {
    super(projectId);
  }
}
