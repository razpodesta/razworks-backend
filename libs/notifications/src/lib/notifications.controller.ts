/**
 * @fileoverview Controlador de Notificaciones (REST)
 * @module Notifications/Controller
 * @description Endpoints consumidos por el Widget del Frontend y Webhooks.
 */
import { Controller, Get, Patch, Body, Query, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  MarkAsReadDto,
  MarkAsReadSchema,
  NotificationFeedDto
} from '@razworks/dtos'; // ✅ Ahora estos existen
import { ZodValidationPipe } from '@razworks/shared/utils';

// Mock de Request con Usuario (Hasta integración Auth completa)
interface RequestWithUser {
  user: { id: string };
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getFeed(
    @Req() req: RequestWithUser,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0' // ✅ Soporte para paginación
  ): Promise<NotificationFeedDto> {

    // Mock User ID para pruebas si no hay JWT
    const userId = req.user?.id || 'user-uuid-placeholder';

    // ✅ FIX TS2554: Pasamos los 3 argumentos requeridos por el servicio
    return this.notificationsService.getUserFeed(
      userId,
      Number(limit),
      Number(offset)
    );
  }

  @Patch('read')
  async markAsRead(
    @Req() req: RequestWithUser,
    @Body(new ZodValidationPipe(MarkAsReadSchema)) body: MarkAsReadDto
  ): Promise<{ success: boolean }> {
    const userId = req.user?.id || 'user-uuid-placeholder';

    await this.notificationsService.markAsRead(userId, body.notificationIds);
    return { success: true };
  }
}
