/**
 * @fileoverview Schema Code-First para GraphQL
 * @module Notifications/API
 */
import { Field, ID, ObjectType, Int, registerEnumType } from '@nestjs/graphql';

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

// Registro del Enum para que GraphQL lo entienda
registerEnumType(NotificationStatus, { name: 'NotificationStatus' });

@ObjectType()
export class NotificationItem {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Código de acción legible (ej: PROJ_CREATED)' })
  action: string;

  @Field(() => NotificationStatus)
  status: NotificationStatus;

  @Field(() => String, { description: 'JSON stringified con datos dinámicos' })
  metadata: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class NotificationFeed {
  @Field(() => Int)
  unreadCount: number;

  @Field(() => [NotificationItem])
  items: NotificationItem[];
}
