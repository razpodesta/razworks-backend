/**
 * @fileoverview Resolver de Notificaciones (Real-time & Operations)
 * @module Notifications/API
 */
import { Resolver, Query, Mutation, Subscription, Args } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { NotificationsService } from '../../notifications.service';
import { NotificationItem, NotificationFeed } from './notification.model';
import { PUB_SUB } from '../../infra/pubsub/redis-pubsub.provider';
import { GqlAuthGuard, CurrentUser } from '../guards/gql-auth.guard';

const NOTIFICATION_EVENT = 'notificationAdded';

@Resolver(() => NotificationItem)
export class NotificationsResolver {
  constructor(
    private readonly service: NotificationsService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  // --- PULL: Obtener Historial ---
  @Query(() => NotificationFeed)
  @UseGuards(GqlAuthGuard)
  async myNotifications(
    @CurrentUser() user: { id: string },
    @Args('limit', { nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number
  ) {
    return this.service.getUserFeed(user.id, limit, offset);
  }

  // --- COMMAND: Marcar como Leído ---
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markNotificationsAsRead(
    @CurrentUser() user: { id: string },
    @Args('ids', { type: () => [String] }) ids: string[]
  ) {
    await this.service.markAsRead(user.id, ids);
    return true;
  }

  // --- PUSH: Suscripción en Tiempo Real ---
  @Subscription(() => NotificationItem, {
    filter: (payload, variables) => {
      // 🛡️ FIREWALL DE EVENTOS:
      // El evento solo se envía si el ID del destinatario en el payload
      // coincide con el ID solicitado en la suscripción.
      // Nota: En producción real, 'variables.userId' debería validarse contra el token de conexión WebSocket.
      return payload[NOTIFICATION_EVENT].userId === variables.userId;
    },
    resolve: (payload) => {
      // Extraemos el objeto limpio para el cliente
      return payload[NOTIFICATION_EVENT];
    }
  })
  notificationStream(@Args('userId') userId: string) {
    // Retorna un iterador asíncrono conectado al bus de Redis
    return this.pubSub.asyncIterator(NOTIFICATION_EVENT);
  }
}
