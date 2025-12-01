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
    PubSubModule // Inyecta el motor de tiempo real
  ],
  controllers: [
    NotificationsController // Mantiene compatibilidad REST
  ],
  providers: [
    NotificationsService,
    NotificationsResolver, // Habilita GraphQL
    GqlAuthGuard
  ],
  exports: [
    NotificationsService // Exportado para uso interno (WhatsApp/Gamification)
  ],
})
export class NotificationsModule {}
