/**
 * @fileoverview API Pública del Núcleo Soberano
 * @module Core
 */

// Entidades
export * from './entities/user.entity';
export * from './entities/project.entity';

// Objetos de Valor
export * from './base/value-object.base';
export * from './value-objects/money.vo';
export * from './value-objects/email.vo';

// Eventos de Dominio
export * from './events/domain-event.base';
export * from './events/user-registered.event.ts';
export * from './events/project-published.event.ts';

// Servicios de Dominio
export * from './services/system-health.service';

// Puertos (Interfaces)
export * from './ports/repositories/user.repository.port';
export * from './ports/repositories/project.repository.port';

// Shared
export * from './shared/app-error';
export * from './ports/events/event-dispatcher.port';
