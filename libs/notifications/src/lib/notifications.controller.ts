/**
 * @fileoverview Controlador de Notificaciones
 * @module Libs/Notifications
 * @description Endpoints consumidos por el Widget del Frontend.
 */
import { Controller, Get, Patch, Body, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MarkAsReadDto, MarkAsReadSchema, NotificationFeedDto } from '@razworks/dtos';
import { ZodValidationPipe } from '@razworks/shared/utils';
// import { JwtAuthGuard } from '@razworks/auth'; // Asumimos existencia o usamos mock por ahora

// Mock de Request con Usuario (Hasta que el módulo de Auth esté 100% integrado)
interface RequestWithUser {
  user: { id: string };
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @UseGuards(JwtAuthGuard) <--- Descomentar cuando Auth esté activo
  @Get()
  async getFeed(@Req() req: RequestWithUser, @Query('limit') limit = '20'): Promise<NotificationFeedDto> {
    // Mock User ID si no hay Auth real aún (Para pruebas de integración)
    const userId = req.user?.id || 'user-uuid-placeholder';

    return this.notificationsService.getUserFeed(userId, Number(limit));
  }

  // @UseGuards(JwtAuthGuard)
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
