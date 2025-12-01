/**
 * @fileoverview DTOs de Notificaciones
 * @module Shared/DTOs/Notifications
 * @description Contratos Zod para el feed de alertas.
 */
import { z } from 'zod';

// Esquema de una notificación individual (Salida)
export const NotificationItemSchema = z.object({
  id: z.string().uuid(),
  action: z.string(), // El código legible (ej: 'PROJ_APPROVED')
  metadata: z.record(z.unknown()), // JSON flexible para hidratar texto
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED']),
  createdAt: z.string().datetime(), // ISO String
});

export type NotificationItemDto = z.infer<typeof NotificationItemSchema>;

// Esquema de respuesta del Feed (Salida)
export const NotificationFeedSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
  items: z.array(NotificationItemSchema),
});

export type NotificationFeedDto = z.infer<typeof NotificationFeedSchema>;

// Esquema para marcar como leídas (Entrada)
export const MarkAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()),
});

export type MarkAsReadDto = z.infer<typeof MarkAsReadSchema>;
