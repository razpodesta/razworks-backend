/**
 * @fileoverview Resolver GraphQL para Notificaciones
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

  @Query(() => NotificationFeed)
  @UseGuards(GqlAuthGuard)
  async myNotifications(
    @CurrentUser() user: { id: string },
    @Args('limit', { nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number
  ) {
    return this.service.getUserFeed(user.id, limit, offset);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markNotificationsAsRead(
    @CurrentUser() user: { id: string },
    @Args('ids', { type: () => [String] }) ids: string[]
  ) {
    await this.service.markAsRead(user.id, ids);
    return true;
  }

  // 🔥 SUSCRIPCIÓN EN TIEMPO REAL
  @Subscription(() => NotificationItem, {
    filter: (payload, variables, context) => {
      // El payload contiene el evento disparado por Redis
      const notification = payload[NOTIFICATION_EVENT];

      // Security Check: El ID del evento debe coincidir con el ID del suscriptor
      // Nota: En subscriptions, el user suele venir en connectionParams,
      // aquí usamos el argumento explícito por simplicidad arquitectónica.
      return notification.userId === variables.userId;
    },
    resolve: (payload) => {
      // Transformación final antes de enviar al cliente
      return payload[NOTIFICATION_EVENT];
    }
  })
  notificationStream(@Args('userId') userId: string) {
    return this.pubSub.asyncIterator(NOTIFICATION_EVENT);
  }
}
