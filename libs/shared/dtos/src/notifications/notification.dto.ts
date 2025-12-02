/**
 * @fileoverview DTOs de Notificaciones (Contracts)
 * @module Shared/DTOs/Notifications
 * @description Contratos Zod para el feed de alertas y operaciones de lectura.
 */
import { z } from 'zod';

// --- ENUMS & TYPES ---
export const NotificationStatusSchema = z.enum(['UNREAD', 'READ', 'ARCHIVED']);
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

// --- ITEMS INDIVIDUALES ---
export const NotificationItemSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  metadata: z.string(), // Serializado JSON
  status: NotificationStatusSchema,
  createdAt: z.string().datetime(), // ISO Date
});

export type NotificationItemDto = z.infer<typeof NotificationItemSchema>;

// --- FEED RESPONSE ---
export const NotificationFeedSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
  items: z.array(NotificationItemSchema),
});

export type NotificationFeedDto = z.infer<typeof NotificationFeedSchema>;

// --- MARK AS READ REQUEST ---
export const MarkAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()),
});

export type MarkAsReadDto = z.infer<typeof MarkAsReadSchema>;
