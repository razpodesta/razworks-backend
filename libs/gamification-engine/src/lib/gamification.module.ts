/**
 * @fileoverview Módulo de Gamificación
 * @module Gamification
 * @description Configura la cola de XP y los trabajadores.
 */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from '@razworks/notifications';

import { GamificationService } from './gamification.service';
import { XpWorker } from './workers/xp.worker';
import { GamificationEmitter } from './services/gamification.emitter';
import { BadgeManagerService } from './services/badge-manager.service'; // ✅ Nuevo Servicio

@Module({
  imports: [
    // Registramos la cola específica de este dominio
    BullModule.registerQueue({
      name: 'gamification-xp',
    }),
    NotificationsModule,
  ],
  providers: [
    GamificationService, // Lógica de cálculo XP
    BadgeManagerService, // Lógica de medallas
    XpWorker,            // Procesador asíncrono
    GamificationEmitter  // Fachada pública
  ],
  exports: [
    GamificationEmitter, // Emisor de XP
    BadgeManagerService  // Gestor de Badges
  ],
})
export class GamificationModule {}
