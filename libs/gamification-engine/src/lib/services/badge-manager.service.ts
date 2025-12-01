/**
 * @fileoverview Gestor de Insignias (Badge System)
 * @module Gamification/Badges
 * @description
 * Evalúa y otorga medallas basadas en reglas de negocio complejas.
 * Implementa el patrón "Specification" implícito.
 * @author Raz Podestá & LIA Legacy
 */
import { Injectable, Logger } from '@nestjs/common';
import { GamificationEmitter } from './gamification.emitter';
import { NotificationsService } from '@razworks/notifications';

// Definición estricta de IDs de Badges (Sincronizar con DB en el futuro)
export type BadgeId =
  | 'ZERO_LATENCY'
  | 'CLEAN_SHEET'
  | 'BUG_EXTERMINATOR'
  | 'FRIDAY_DEPLOYER'
  | 'FIRST_BLOOD';

interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
}

// Catálogo en memoria (Single Source of Truth para MVP)
const BADGE_CATALOG: Record<BadgeId, BadgeDefinition> = {
  'FIRST_BLOOD': {
    id: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'Completó su primer proyecto en RazWorks.',
    xpReward: 1000,
    icon: '🩸'
  },
  'ZERO_LATENCY': {
    id: 'ZERO_LATENCY',
    name: 'Zero Latency',
    description: 'Respondió al 100% de mensajes en < 5 min durante 1 semana.',
    xpReward: 5000,
    icon: '⚡'
  },
  'FRIDAY_DEPLOYER': {
    id: 'FRIDAY_DEPLOYER',
    name: 'Friday Deployer',
    description: 'Entrega exitosa un viernes sin bugs reportados.',
    xpReward: 10000,
    icon: '🔥'
  },
  'CLEAN_SHEET': {
    id: 'CLEAN_SHEET',
    name: 'Clean Sheet',
    description: '10 proyectos seguidos con 5 estrellas.',
    xpReward: 15000,
    icon: '💎'
  },
  'BUG_EXTERMINATOR': {
    id: 'BUG_EXTERMINATOR',
    name: 'Bug Exterminator',
    description: 'Resolvió un proyecto crítico abandonado.',
    xpReward: 8000,
    icon: '🐛'
  }
};

@Injectable()
export class BadgeManagerService {
  private readonly logger = new Logger(BadgeManagerService.name);

  constructor(
    private readonly xpEmitter: GamificationEmitter,
    private readonly notifications: NotificationsService
  ) {}

  /**
   * Evalúa si un usuario merece un badge y lo otorga.
   * (Este método sería llamado por listeners de eventos de dominio)
   */
  async unlockBadge(userId: string, badgeId: BadgeId): Promise<void> {
    const badge = BADGE_CATALOG[badgeId];
    if (!badge) {
      this.logger.warn(`Intento de otorgar badge desconocido: ${badgeId}`);
      return;
    }

    // 1. Verificar si ya lo tiene (Idempotencia)
    // TODO: Conectar con Repositorio de Badges reales en DB.
    // const hasBadge = await this.repo.hasBadge(userId, badgeId);
    // if (hasBadge) return;

    this.logger.log(`🏅 Unlocking Badge [${badge.name}] for ${userId}`);

    // 2. Persistir Badge (TODO: Implementar persistencia)
    // await this.repo.saveBadge(userId, badgeId);

    // 3. Otorgar XP asociada
    await this.xpEmitter.award({
      userId,
      amount: badge.xpReward,
      reason: `BADGE_UNLOCK:${badgeId}`,
      source: 'system'
    });

    // 4. Notificar al usuario (Celebración)
    await this.notifications.dispatch({
      userId,
      actionCode: 'GAMIFICATION_BADGE_UNLOCK', // Requiere agregar al seed
      metadata: {
        badgeName: badge.name,
        badgeIcon: badge.icon,
        xpBonus: badge.xpReward,
        description: badge.description
      }
    });
  }
}
