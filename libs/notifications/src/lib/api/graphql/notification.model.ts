/**
 * @fileoverview Modelo GraphQL de Notificaciones
 * @module Notifications/API
 */
import { Field, ID, ObjectType, Int, registerEnumType } from '@nestjs/graphql';

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(NotificationStatus, { name: 'NotificationStatus' });

@ObjectType()
export class NotificationItem {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Código de acción semántico (ej: PROJ_CREATED)' })
  action: string;

  @Field(() => NotificationStatus)
  status: NotificationStatus;

  @Field(() => String, { description: 'Metadata serializada en JSON para hidratación en UI' })
  metadata: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class NotificationFeed {
  @Field(() => Int, { description: 'Contador en tiempo real de no leídas' })
  unreadCount: number;

  @Field(() => [NotificationItem])
  items: NotificationItem[];
}
