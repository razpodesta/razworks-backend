/**
 * @fileoverview Módulo de Notificaciones (Assembly)
 * @module Notifications
 */
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './api/graphql/notifications.resolver';
import { PubSubModule } from './infra/pubsub/redis-pubsub.provider';
import { GqlAuthGuard } from './api/guards/gql-auth.guard';

@Module({
  imports: [
    PubSubModule // Inyección del motor de tiempo real
  ],
  controllers: [
    NotificationsController // Mantenemos REST para compatibilidad con webhooks externos
  ],
  providers: [
    NotificationsService,
    NotificationsResolver, // Habilitamos GraphQL
    GqlAuthGuard
  ],
  exports: [
    NotificationsService // Exportamos el servicio para que otros módulos (WhatsApp, Gamification) lo usen
  ],
})
export class NotificationsModule {}
